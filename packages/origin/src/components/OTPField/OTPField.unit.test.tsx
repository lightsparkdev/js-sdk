/**
 * OTPField Unit Tests (Vitest + @testing-library/react)
 *
 * Fast tests for component contracts, rendering logic, and conformance.
 * These run in JSDOM (~5ms/test) vs Playwright CT (~200ms/test).
 *
 * For real browser testing (typing flows, paste, keyboard navigation,
 * accessibility tree), see OTPField.test.tsx
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { OTPField } from "./";
import { Field } from "../Field";

function getSlots(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLInputElement>("[data-otp-field-input]"),
  );
}

describe("OTPField.Root", () => {
  it("renders 6 slots by default", () => {
    const { container } = render(<OTPField.Root />);
    expect(getSlots(container)).toHaveLength(6);
  });

  it("renders a configurable number of slots", () => {
    const { container } = render(<OTPField.Root length={4} />);
    expect(getSlots(container)).toHaveLength(4);
  });

  it("renders default slots when children is null", () => {
    const { container } = render(<OTPField.Root>{null}</OTPField.Root>);
    expect(getSlots(container)).toHaveLength(6);
  });

  it("renders default slots when children is a false conditional", () => {
    const { container } = render(<OTPField.Root>{false}</OTPField.Root>);
    expect(getSlots(container)).toHaveLength(6);
  });

  it("renders explicit children instead of auto slots", () => {
    const { container } = render(
      <OTPField.Root length={2}>
        <OTPField.Input />
        <OTPField.Input />
      </OTPField.Root>,
    );
    expect(getSlots(container)).toHaveLength(2);
  });

  it("forwards data-* attributes to the DOM", () => {
    render(<OTPField.Root data-testid="test-root" data-custom="value" />);
    expect(screen.getByTestId("test-root")).toHaveAttribute(
      "data-custom",
      "value",
    );
  });

  it("applies custom className alongside internal className", () => {
    render(<OTPField.Root data-testid="test-root" className="custom-class" />);
    const element = screen.getByTestId("test-root");
    expect(element).toHaveClass("custom-class");
    expect(element.className).not.toBe("custom-class");
  });

  it("supports className as a state function", () => {
    render(
      <OTPField.Root
        data-testid="test-root"
        className={(state) => (state.disabled ? "is-disabled" : "is-enabled")}
      />,
    );
    expect(screen.getByTestId("test-root")).toHaveClass("is-enabled");
    expect(screen.getByTestId("test-root").className).not.toBe("is-enabled");
  });

  it("splits defaultValue across slots", () => {
    const { container } = render(<OTPField.Root defaultValue="123" />);
    const slots = getSlots(container);
    expect(slots[0]).toHaveValue("1");
    expect(slots[1]).toHaveValue("2");
    expect(slots[2]).toHaveValue("3");
    expect(slots[3]).toHaveValue("");
  });

  it("marks all slots disabled when the root is disabled", () => {
    const { container } = render(<OTPField.Root disabled />);
    for (const slot of getSlots(container)) {
      expect(slot).toBeDisabled();
      expect(slot).toHaveAttribute("data-disabled", "");
    }
  });

  it("marks all slots readonly when the root is readOnly", () => {
    const { container } = render(<OTPField.Root readOnly />);
    for (const slot of getSlots(container)) {
      expect(slot).toHaveAttribute("readonly");
    }
  });

  it("forwards placeholder to auto-rendered slots", () => {
    const { container } = render(<OTPField.Root placeholder="0" />);
    const slots = getSlots(container);
    expect(slots).toHaveLength(6);
    for (const slot of slots) {
      expect(slot).toHaveAttribute("placeholder", "0");
    }
  });

  it("ignores placeholder when explicit children are provided", () => {
    const { container } = render(
      <OTPField.Root length={2} placeholder="0">
        <OTPField.Input />
        <OTPField.Input />
      </OTPField.Root>,
    );
    for (const slot of getSlots(container)) {
      expect(slot).not.toHaveAttribute("placeholder");
    }
  });

  it("applies one-time-code autocomplete to the first slot only", () => {
    const { container } = render(<OTPField.Root />);
    const slots = getSlots(container);
    expect(slots[0]).toHaveAttribute("autocomplete", "one-time-code");
    expect(slots[1]).toHaveAttribute("autocomplete", "off");
  });
});

describe("OTPField.Input aria-labels", () => {
  it("labels slots after the first with their position", () => {
    const { container } = render(<OTPField.Root />);
    const slots = getSlots(container);
    expect(slots[0]).not.toHaveAttribute("aria-label");
    expect(slots[1]).toHaveAttribute("aria-label", "Character 2 of 6");
    expect(slots[5]).toHaveAttribute("aria-label", "Character 6 of 6");
  });

  it("uses the configured length in slot labels", () => {
    const { container } = render(<OTPField.Root length={4} />);
    const slots = getSlots(container);
    expect(slots[3]).toHaveAttribute("aria-label", "Character 4 of 4");
  });

  it("respects a custom aria-label on later slots", () => {
    const { container } = render(
      <OTPField.Root length={2}>
        <OTPField.Input />
        <OTPField.Input aria-label="Last digit" />
      </OTPField.Root>,
    );
    const slots = getSlots(container);
    expect(slots[1]).toHaveAttribute("aria-label", "Last digit");
  });
});

describe("OTPField with Field", () => {
  it("associates the field label with the first slot", () => {
    const { container } = render(
      <Field.Root name="code">
        <Field.Label>Verification code</Field.Label>
        <OTPField.Root />
      </Field.Root>,
    );
    const slots = getSlots(container);
    const labelledBy = slots[0].getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy as string)).toHaveTextContent(
      "Verification code",
    );
  });

  it("propagates Field invalid state to slots", () => {
    const { container } = render(
      <Field.Root name="code" invalid>
        <Field.Label>Verification code</Field.Label>
        <OTPField.Root />
      </Field.Root>,
    );
    for (const slot of getSlots(container)) {
      expect(slot).toHaveAttribute("data-invalid");
    }
  });
});

describe("OTPField.Separator", () => {
  it("renders with role separator", () => {
    render(
      <OTPField.Root length={2}>
        <OTPField.Input />
        <OTPField.Separator data-testid="sep" />
        <OTPField.Input />
      </OTPField.Root>,
    );
    expect(screen.getByTestId("sep")).toHaveAttribute("role", "separator");
  });

  it("renders grouped layouts with all slots", () => {
    const { container } = render(
      <OTPField.Root>
        <OTPField.Input />
        <OTPField.Input />
        <OTPField.Input />
        <OTPField.Separator data-testid="sep" />
        <OTPField.Input />
        <OTPField.Input />
        <OTPField.Input />
      </OTPField.Root>,
    );
    expect(getSlots(container)).toHaveLength(6);
    expect(screen.getByTestId("sep")).toBeInTheDocument();
  });
});
