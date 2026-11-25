import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { Field } from "../Field";
import { Fieldset } from "../Fieldset";
import { SecretInput } from "./";

function getInput(container: HTMLElement) {
  return container.querySelector<HTMLInputElement>("[data-input-group-input]")!;
}

describe("SecretInput", () => {
  it("renders a password input by default", () => {
    const { container } = render(<SecretInput />);

    expect(getInput(container)).toHaveAttribute("type", "password");
  });

  it("ignores a runtime type override", () => {
    const unsafeProps = { type: "text" } as unknown as React.ComponentProps<
      typeof SecretInput
    >;
    const { container } = render(<SecretInput {...unsafeProps} />);
    const input = getInput(container);

    expect(input).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Show secret" }));
    expect(input).toHaveAttribute("type", "text");
    fireEvent.click(screen.getByRole("button", { name: "Hide secret" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("ignores a runtime render override", () => {
    const unsafeProps = {
      render: <textarea data-testid="replacement" />,
    } as unknown as React.ComponentProps<typeof SecretInput>;
    const { container } = render(<SecretInput {...unsafeProps} />);

    expect(getInput(container)).toBeInstanceOf(HTMLInputElement);
    expect(screen.queryByTestId("replacement")).not.toBeInTheDocument();
  });

  it("renders an icon-only toggle inside the input group", () => {
    const { container } = render(<SecretInput />);
    const toggle = screen.getByRole("button", { name: "Show secret" });
    const group = container.querySelector("[data-input-group]");

    expect(toggle).toBeInTheDocument();
    expect(toggle.parentElement).toBe(group);
    expect(container.querySelector("[data-input-group-cap]")).toBeNull();
  });

  it("uses a non-submitting toggle button", () => {
    render(<SecretInput />);

    expect(screen.getByRole("button", { name: "Show secret" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("swaps to a text input and back", () => {
    const { container } = render(<SecretInput />);
    const input = getInput(container);

    fireEvent.click(screen.getByRole("button", { name: "Show secret" }));
    expect(input).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: "Hide secret" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Hide secret" }));
    expect(input).toHaveAttribute("type", "password");
    expect(
      screen.getByRole("button", { name: "Show secret" }),
    ).toBeInTheDocument();
  });

  it("preserves the value across visibility toggles", () => {
    const { container } = render(<SecretInput defaultValue="hunter2!" />);
    const input = getInput(container);

    fireEvent.click(screen.getByRole("button", { name: "Show secret" }));
    expect(input).toHaveValue("hunter2!");

    fireEvent.click(screen.getByRole("button", { name: "Hide secret" }));
    expect(input).toHaveValue("hunter2!");
  });

  it("supports context-specific visibility labels", () => {
    const { container } = render(
      <SecretInput showLabel="Show password" hideLabel="Hide password" />,
    );
    const input = getInput(container);

    fireEvent.click(screen.getByRole("button", { name: "Show password" }));

    expect(input).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: "Hide password" }),
    ).toBeInTheDocument();
  });

  it("reports the exact typed value without sanitizing", () => {
    const onValueChange = vi.fn();
    const { container } = render(<SecretInput onValueChange={onValueChange} />);

    fireEvent.change(getInput(container), {
      target: { value: "hunter2!\u202c" },
    });

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0][0]).toBe("hunter2!\u202c");
  });

  it("defaults autocomplete to off so browsers do not capture secrets", () => {
    const { container } = render(<SecretInput />);

    expect(getInput(container)).toHaveAttribute("autocomplete", "off");
  });

  it("lets callers override the default autocomplete", () => {
    const { container } = render(
      <SecretInput autoComplete="current-password" />,
    );

    expect(getInput(container)).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
  });

  it("turns off text correction while the secret is revealed", () => {
    const { container } = render(<SecretInput defaultValue="hunter2!" />);
    const input = getInput(container);

    expect(input).not.toHaveAttribute("autocorrect");
    expect(input).not.toHaveAttribute("autocapitalize");
    expect(input).not.toHaveAttribute("spellcheck");

    fireEvent.click(screen.getByRole("button", { name: "Show secret" }));
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("autocorrect", "off");
    expect(input).toHaveAttribute("autocapitalize", "off");
    expect(input).toHaveAttribute("spellcheck", "false");
  });

  it("remasks when a native fieldset ancestor becomes disabled", () => {
    const renderNativeFieldset = (disabled: boolean) => (
      <fieldset disabled={disabled}>
        <SecretInput defaultValue="saved secret" />
      </fieldset>
    );
    const { container, rerender } = render(renderNativeFieldset(false));
    const input = getInput(container);

    fireEvent.click(screen.getByRole("button", { name: "Show secret" }));
    expect(input).toHaveAttribute("type", "text");

    rerender(renderNativeFieldset(true));
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveValue("saved secret");

    rerender(renderNativeFieldset(false));
    expect(input).toBeEnabled();
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveValue("saved secret");
  });

  it("remasks when a native fieldset disables without a React rerender", async () => {
    const fieldsetRef = React.createRef<HTMLFieldSetElement>();
    const MemoSecretInput = React.memo(SecretInput);
    const { container } = render(
      <fieldset ref={fieldsetRef}>
        <MemoSecretInput defaultValue="saved secret" />
      </fieldset>,
    );
    const input = getInput(container);

    fireEvent.click(screen.getByRole("button", { name: "Show secret" }));
    expect(input).toHaveAttribute("type", "text");

    act(() => {
      fieldsetRef.current!.disabled = true;
    });

    expect(input).toBeDisabled();
    await waitFor(() => {
      expect(input).toHaveAttribute("type", "password");
    });
    expect(input).toHaveValue("saved secret");
  });

  it("keeps the toggle inert after the input is disabled imperatively", async () => {
    const { container } = render(<SecretInput defaultValue="saved secret" />);
    const input = getInput(container);
    const toggle = screen.getByRole("button", { name: "Show secret" });

    act(() => {
      input.disabled = true;
    });
    await waitFor(() => expect(toggle).toBeDisabled());
    fireEvent.click(toggle);
    expect(input).toHaveAttribute("type", "password");

    act(() => {
      input.disabled = false;
    });
    await waitFor(() => expect(toggle).toBeEnabled());
    expect(input).toHaveAttribute("type", "password");
  });

  it("remasks when an outer native fieldset disables without a React rerender", async () => {
    const outerRef = React.createRef<HTMLFieldSetElement>();
    const { container } = render(
      <fieldset ref={outerRef}>
        <fieldset>
          <SecretInput defaultValue="saved secret" />
        </fieldset>
      </fieldset>,
    );
    const input = getInput(container);

    fireEvent.click(screen.getByRole("button", { name: "Show secret" }));
    expect(input).toHaveAttribute("type", "text");

    act(() => {
      outerRef.current!.disabled = true;
    });

    expect(input).toBeDisabled();
    await waitFor(() => {
      expect(input).toHaveAttribute("type", "password");
    });
    expect(input).toHaveValue("saved secret");
  });

  it("keeps the saved value masked when explicitly disabled", () => {
    const { container } = render(
      <SecretInput disabled defaultValue="saved secret" />,
    );
    const input = getInput(container);
    const toggle = screen.getByRole("button", { name: "Show secret" });

    expect(input).toBeDisabled();
    expect(toggle).toBeDisabled();
    fireEvent.click(toggle);
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveValue("saved secret");
  });

  it("inherits the disabled state from Field", () => {
    const { container } = render(
      <Field.Root name="secret" disabled>
        <SecretInput defaultValue="saved secret" />
      </Field.Root>,
    );
    const input = getInput(container);
    const toggle = screen.getByRole("button", { name: "Show secret" });

    expect(input).toBeDisabled();
    expect(toggle).toBeDisabled();
    fireEvent.click(toggle);
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveValue("saved secret");
  });

  it("inherits the disabled state from Fieldset", () => {
    const { container } = render(
      <Fieldset.Root disabled>
        <Fieldset.Legend>Credentials</Fieldset.Legend>
        <Field.Root name="secret">
          <SecretInput defaultValue="saved secret" />
        </Field.Root>
      </Fieldset.Root>,
    );
    const input = getInput(container);
    const toggle = screen.getByRole("button", { name: "Show secret" });

    expect(input).toBeDisabled();
    expect(toggle).toBeDisabled();
    fireEvent.click(toggle);
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveValue("saved secret");
  });

  it("remasks through nested Fieldsets when the outer Fieldset becomes disabled", () => {
    const renderNestedSecret = (outerDisabled: boolean) => (
      <Fieldset.Root disabled={outerDisabled} render={<div />}>
        <Fieldset.Legend>Credentials</Fieldset.Legend>
        <Fieldset.Root disabled={false} render={<div />}>
          <Fieldset.Legend>Nested credentials</Fieldset.Legend>
          <Field.Root name="secret" disabled={false}>
            <SecretInput defaultValue="saved secret" />
          </Field.Root>
        </Fieldset.Root>
      </Fieldset.Root>
    );
    const { container, rerender } = render(renderNestedSecret(false));
    const input = getInput(container);

    fireEvent.click(screen.getByRole("button", { name: "Show secret" }));
    expect(input).toHaveAttribute("type", "text");

    rerender(renderNestedSecret(true));
    const disabledToggle = screen.getByRole("button", { name: "Show secret" });
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("disabled");
    expect(disabledToggle).toHaveAttribute("disabled");
    expect(input).toHaveValue("saved secret");
    fireEvent.click(disabledToggle);
    expect(input).toHaveAttribute("type", "password");

    rerender(renderNestedSecret(false));
    expect(input).not.toHaveAttribute("disabled");
    expect(disabledToggle).not.toHaveAttribute("disabled");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveValue("saved secret");
  });

  it("masks immediately when Fieldset becomes disabled and stays masked", () => {
    const renderSecret = (disabled: boolean) => (
      <Fieldset.Root disabled={disabled}>
        <Fieldset.Legend>Credentials</Fieldset.Legend>
        <Field.Root name="secret">
          <SecretInput defaultValue="saved secret" />
        </Field.Root>
      </Fieldset.Root>
    );
    const { container, rerender } = render(renderSecret(false));
    const input = getInput(container);

    fireEvent.click(screen.getByRole("button", { name: "Show secret" }));
    expect(input).toHaveAttribute("type", "text");

    rerender(renderSecret(true));
    const disabledToggle = screen.getByRole("button", { name: "Show secret" });
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveValue("saved secret");
    expect(disabledToggle).toBeDisabled();
    fireEvent.click(disabledToggle);
    expect(input).toHaveAttribute("type", "password");

    rerender(renderSecret(false));
    expect(input).toBeEnabled();
    expect(disabledToggle).toBeEnabled();
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveValue("saved secret");
  });

  it("masks immediately and stays masked after being dynamically disabled", () => {
    const { container, rerender } = render(
      <SecretInput defaultValue="saved secret" />,
    );
    const input = getInput(container);

    fireEvent.click(screen.getByRole("button", { name: "Show secret" }));
    expect(input).toHaveAttribute("type", "text");

    rerender(<SecretInput disabled defaultValue="saved secret" />);
    const disabledToggle = screen.getByRole("button", { name: "Show secret" });
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveValue("saved secret");
    expect(disabledToggle).toBeDisabled();

    fireEvent.click(disabledToggle);
    expect(input).toHaveAttribute("type", "password");

    rerender(<SecretInput defaultValue="saved secret" />);
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveValue("saved secret");
  });

  it("marks the group and input invalid", () => {
    const { container } = render(<SecretInput invalid />);

    expect(container.querySelector("[data-input-group]")).toHaveAttribute(
      "data-invalid",
      "",
    );
    expect(getInput(container)).toHaveAttribute("aria-invalid", "true");
  });

  it("applies className and style to the group", () => {
    const { container } = render(
      <SecretInput className="custom-class" style={{ width: 200 }} />,
    );
    const root = container.querySelector<HTMLElement>("[data-secret-input]")!;

    expect(root).toHaveClass("custom-class");
    expect(root.style.width).toBe("200px");
  });

  it("forwards the ref to the input", () => {
    const ref = React.createRef<HTMLInputElement>();
    const { container } = render(<SecretInput ref={ref} />);

    expect(ref.current).toBe(getInput(container));
  });

  it("associates a Field label with the input", () => {
    const { container } = render(
      <Field.Root name="password">
        <Field.Label>Password</Field.Label>
        <SecretInput />
      </Field.Root>,
    );
    const input = getInput(container);
    const label = screen.getByText("Password");

    expect(label.tagName).toBe("LABEL");
    expect(input.id).toBeTruthy();
    expect(label).toHaveAttribute("for", input.id);
  });

  it("wires a Field description to the input", () => {
    const { container } = render(
      <Field.Root name="password">
        <Field.Label>Password</Field.Label>
        <SecretInput />
        <Field.Description>At least 12 characters</Field.Description>
      </Field.Root>,
    );
    const input = getInput(container);
    const describedBy = input.getAttribute("aria-describedby");

    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)).toHaveTextContent(
      "At least 12 characters",
    );
  });
});
