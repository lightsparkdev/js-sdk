import { fireEvent, render } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { Input } from "../Input";
import { InputGroup } from "./";

function renderInput(props: React.ComponentProps<typeof InputGroup.Input>) {
  const { getByRole } = render(
    <InputGroup.Root>
      <InputGroup.Input {...props} />
    </InputGroup.Root>,
  );
  return getByRole("textbox") as HTMLInputElement;
}

describe("InputGroup.Input sanitization", () => {
  it("matches Input sanitization behavior", () => {
    const onInputValueChange = vi.fn();
    const onInputGroupValueChange = vi.fn();
    const { getAllByRole } = render(
      <>
        <Input onValueChange={onInputValueChange} />
        <InputGroup.Root>
          <InputGroup.Input onValueChange={onInputGroupValueChange} />
        </InputGroup.Root>
      </>,
    );
    const [input, inputGroupInput] = getAllByRole("textbox");
    const value = "hello\u00a0world\u202c";

    fireEvent.change(input, { target: { value } });
    fireEvent.change(inputGroupInput, { target: { value } });

    expect(onInputValueChange.mock.calls[0][0]).toBe("hello world");
    expect(onInputGroupValueChange.mock.calls[0][0]).toBe(
      onInputValueChange.mock.calls[0][0],
    );
  });

  it("strips invisible characters from changed values", () => {
    const onValueChange = vi.fn();
    const input = renderInput({ onValueChange });

    fireEvent.change(input, { target: { value: "04814270\u202c" } });

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0][0]).toBe("04814270");
  });

  it("normalizes exotic spaces to plain spaces", () => {
    const onValueChange = vi.fn();
    const input = renderInput({ onValueChange });

    fireEvent.change(input, { target: { value: "hello\u00a0world" } });

    expect(onValueChange.mock.calls[0][0]).toBe("hello world");
  });

  it("passes printable values through unchanged", () => {
    const onValueChange = vi.fn();
    const input = renderInput({ onValueChange });

    fireEvent.change(input, { target: { value: "plain value 123" } });

    expect(onValueChange.mock.calls[0][0]).toBe("plain value 123");
  });

  it("forwards event details", () => {
    const onValueChange = vi.fn();
    const input = renderInput({ onValueChange });

    fireEvent.change(input, { target: { value: "abc" } });

    expect(onValueChange.mock.calls[0][1]).toBeDefined();
  });

  it("preserves the exact value when sanitization is off", () => {
    const onValueChange = vi.fn();
    const input = renderInput({
      onValueChange,
      sanitizeValue: false,
    });

    fireEvent.change(input, { target: { value: "hello\u00a0world\u202c" } });

    expect(onValueChange.mock.calls[0][0]).toBe("hello\u00a0world\u202c");
  });

  it("renders without onValueChange", () => {
    const input = renderInput({ defaultValue: "Content" });

    expect(input).toHaveValue("Content");
  });
});
