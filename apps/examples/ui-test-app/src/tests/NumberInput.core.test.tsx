import { jest } from "@jest/globals";
import { NumberInput } from "@lightsparkdev/ui/components/NumberInput";
import "@testing-library/jest-dom";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "./render";

describe("NumberInput core", () => {
  const onChangeSpy = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Renders without error", () => {
    render(
      <NumberInput
        id="validationCustom01"
        name="inputName"
        placeholder="£1,000"
        value=""
        onChange={() => {}}
      />,
    );
    const input = screen.getByRole("textbox");

    expect(input).toHaveValue("");
  });

  it("Renders with value", () => {
    render(<NumberInput value="1234.56" prefix="£" onChange={() => {}} />);
    const input = screen.getByRole("textbox");

    expect(input).toHaveValue("£1,234.56");
  });

  it("Renders with value 0", () => {
    render(<NumberInput value="0" prefix="£" onChange={() => {}} />);

    expect(screen.getByRole("textbox")).toHaveValue("£0");
  });

  it("Renders with value 0 with decimalScale 2", () => {
    render(
      <NumberInput value="0" decimalScale={2} prefix="£" onChange={() => {}} />,
    );

    expect(screen.getByRole("textbox")).toHaveValue("£0.00");
  });

  it("Renders with value prop", () => {
    render(<NumberInput value="49.99" prefix="£" onChange={() => {}} />);

    expect(screen.getByRole("textbox")).toHaveValue("£49.99");
  });

  it("Renders with value 0.1 with decimalScale 2", async () => {
    render(
      <NumberInput
        value="0.1"
        prefix="£"
        decimalScale={2}
        onChange={() => {}}
      />,
    );

    expect(screen.getByRole("textbox")).toHaveValue("£0.10");

    await userEvent.type(screen.getByRole("textbox"), "{backspace}");

    expect(screen.getByRole("textbox")).toHaveValue("£0.1");
  });

  it("should prefix 0 value", () => {
    render(<NumberInput prefix="£" value="0" onChange={onChangeSpy} />);

    expect(screen.getByRole("textbox")).toHaveValue("£0");
  });

  it("should allow empty value", async () => {
    const { rerender } = render(
      <NumberInput prefix="£" onChange={onChangeSpy} value="1" />,
    );
    await userEvent.clear(screen.getByRole("textbox"));

    expect(onChangeSpy).toHaveBeenLastCalledWith("", {
      float: null,
      formatted: "",
      value: "",
    });
    rerender(<NumberInput prefix="£" onChange={onChangeSpy} value="" />);
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("should not allow invalid characters", async () => {
    render(<NumberInput prefix="£" value="" onChange={onChangeSpy} />);
    await userEvent.type(screen.getByRole("textbox"), "hello");

    expect(onChangeSpy).toHaveBeenLastCalledWith("", {
      float: null,
      formatted: "",
      value: "",
    });

    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("should clear decimal point only input", async () => {
    render(<NumberInput prefix="£" value="" onChange={onChangeSpy} />);
    await userEvent.type(screen.getByRole("textbox"), ".");

    expect(onChangeSpy).toHaveBeenLastCalledWith("", {
      float: null,
      formatted: "",
      value: "",
    });

    fireEvent.focusOut(screen.getByRole("textbox"));
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("should allow .3 decimal inputs", async () => {
    const { rerender } = render(
      <NumberInput prefix="£" value="" onChange={onChangeSpy} />,
    );
    await userEvent.type(screen.getByRole("textbox"), ".3");

    expect(onChangeSpy).toHaveBeenLastCalledWith(".3", {
      float: 0.3,
      formatted: "£0.3",
      value: ".3",
    });

    rerender(<NumberInput prefix="£" value=".3" onChange={onChangeSpy} />);
    fireEvent.focusOut(screen.getByRole("textbox"));
    expect(screen.getByRole("textbox")).toHaveValue("£0.3");
  });

  it("should update the input when prop value changes to another number", () => {
    const { rerender } = render(
      <NumberInput
        value="1"
        placeholder="Please enter a number"
        prefix="£"
        onChange={() => {}}
      />,
    );

    const field = screen.getByRole("textbox");
    expect(field).toHaveValue("£1");

    rerender(
      <NumberInput
        value="2"
        placeholder="Please enter a number"
        prefix="£"
        onChange={() => {}}
      />,
    );

    expect(field).toHaveValue("£2");
  });
});
