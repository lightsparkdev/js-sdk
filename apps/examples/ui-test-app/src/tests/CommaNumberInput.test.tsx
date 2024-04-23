import { ThemeProvider } from "@emotion/react";
import { CommaNumberInput } from "@lightsparkdev/ui/components/CommaNumberInput";
import { themes } from "@lightsparkdev/ui/styles/themes";
import { screen, render as tlRender } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";

function Providers({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={themes.dark}>{children}</ThemeProvider>;
}

function render(renderElement: ReactElement) {
  return tlRender(renderElement, {
    wrapper: Providers,
  });
}

// write a test for the CommaNumberInput component
describe("CommaNumberInput", () => {
  const defaultOnChange = () => {};
  test("should not add commas to numbers less than 1000", () => {
    render(<CommaNumberInput value="123" onChange={defaultOnChange} />);
    const el = screen.getByPlaceholderText("Enter a number");
    expect(el).toHaveValue("123");
  });
  test("should add commas", () => {
    render(<CommaNumberInput value="12354" onChange={defaultOnChange} />);
    const el = screen.getByPlaceholderText("Enter a number");
    expect(el).toHaveValue("12,354");
  });
  test("should add multiple commas for large values", () => {
    render(<CommaNumberInput value="123456789" onChange={defaultOnChange} />);
    const el = screen.getByPlaceholderText("Enter a number");
    expect(el).toHaveValue("123,456,789");
  });
  test("should return input onChange without commas", async () => {
    let value = "";
    function onChange(newValue: string) {
      value = newValue;
    }
    const { rerender } = render(
      <CommaNumberInput value="123456" onChange={onChange} />,
    );
    const el = screen.getByPlaceholderText("Enter a number");
    expect(el).toHaveValue("123,456");
    await userEvent.type(el, "7");
    expect(value).toBe("1234567");
    rerender(<CommaNumberInput value={value} onChange={onChange} />);
    expect(el).toHaveValue("1,234,567");
  });
  test("should have expected cursor position when adding values to end", async () => {
    const { rerender } = render(
      <CommaNumberInput value="123456" onChange={defaultOnChange} />,
    );
    const el = screen.getByPlaceholderText<HTMLInputElement>("Enter a number");
    expect(el).toHaveValue("123,456");
    await userEvent.type(el, "7");
    rerender(<CommaNumberInput value="1234567" onChange={defaultOnChange} />);
    expect(el).toHaveValue("1,234,567");
    expect(el.selectionStart).toBe(9);
  });
  test("should have expected cursor position when adding values to beginning", async () => {
    let value = "";
    function onChange(newValue: string) {
      value = newValue;
    }
    const { rerender } = render(
      <CommaNumberInput value="123456" onChange={onChange} />,
    );
    const el = screen.getByPlaceholderText<HTMLInputElement>("Enter a number");
    expect(el).toHaveValue("123,456");
    el.setSelectionRange(0, 0);
    await userEvent.type(el, "7", {
      initialSelectionStart: 0,
      initialSelectionEnd: 0,
    });
    expect(value).toBe("7123456");
    rerender(<CommaNumberInput value="7123456" onChange={onChange} />);
    expect(el).toHaveValue("7,123,456");
    expect(el.selectionStart).toBe(2);
  });
  test("should have expected cursor position when adding values to middle", async () => {
    let value = "";
    function onChange(newValue: string) {
      value = newValue;
    }
    const { rerender } = render(
      <CommaNumberInput value="123456" onChange={onChange} />,
    );
    const el = screen.getByPlaceholderText<HTMLInputElement>("Enter a number");
    expect(el).toHaveValue("123,456");
    el.setSelectionRange(2, 2);
    await userEvent.type(el, "7", {
      initialSelectionStart: 2,
      initialSelectionEnd: 2,
    });
    expect(value).toBe("1273456");
    rerender(<CommaNumberInput value="1273456" onChange={onChange} />);
    expect(el).toHaveValue("1,273,456");
    expect(el.selectionStart).toBe(4);
  });
  test("backspace should delete proper character when not comma", async () => {
    let value = "";
    function onChange(newValue: string) {
      value = newValue;
    }
    const { rerender } = render(
      <CommaNumberInput value="123456" onChange={onChange} />,
    );
    const el = screen.getByPlaceholderText<HTMLInputElement>("Enter a number");
    expect(el).toHaveValue("123,456");
    el.setSelectionRange(2, 2);
    await userEvent.type(el, "{backspace}", {
      initialSelectionStart: 2,
      initialSelectionEnd: 2,
    });
    expect(value).toBe("13456");
    rerender(<CommaNumberInput value="13456" onChange={onChange} />);
    expect(el).toHaveValue("13,456");
    expect(el.selectionStart).toBe(1);
  });
  test("backspace should delete proper character when comma", async () => {
    let value = "";
    function onChange(newValue: string) {
      value = newValue;
    }
    const { rerender } = render(
      <CommaNumberInput value="123456" onChange={onChange} />,
    );
    const el = screen.getByPlaceholderText<HTMLInputElement>("Enter a number");
    expect(el).toHaveValue("123,456");
    el.setSelectionRange(4, 4);
    await userEvent.type(el, "{backspace}", {
      initialSelectionStart: 4,
      initialSelectionEnd: 4,
    });
    expect(value).toBe("12456");
    rerender(<CommaNumberInput value="12456" onChange={onChange} />);
    expect(el).toHaveValue("12,456");
    expect(el.selectionStart).toBe(2);
  });
  test("delete key should delete proper character when not comma", async () => {
    let value = "";
    function onChange(newValue: string) {
      value = newValue;
    }
    const { rerender } = render(
      <CommaNumberInput value="123456" onChange={onChange} />,
    );
    const el = screen.getByPlaceholderText<HTMLInputElement>("Enter a number");
    expect(el).toHaveValue("123,456");
    el.setSelectionRange(2, 2);
    await userEvent.type(el, "{delete}", {
      initialSelectionStart: 2,
      initialSelectionEnd: 2,
    });
    expect(value).toBe("12456");
    rerender(<CommaNumberInput value="12456" onChange={onChange} />);
    expect(el).toHaveValue("12,456");
    expect(el.selectionStart).toBe(2);
  });
  test("delete key should delete proper character when comma", async () => {
    let value = "";
    function onChange(newValue: string) {
      value = newValue;
    }
    const { rerender } = render(
      <CommaNumberInput value="123456" onChange={onChange} />,
    );
    const el = screen.getByPlaceholderText<HTMLInputElement>("Enter a number");
    expect(el).toHaveValue("123,456");
    el.setSelectionRange(3, 3);
    await userEvent.type(el, "{delete}", {
      initialSelectionStart: 3,
      initialSelectionEnd: 3,
    });
    expect(value).toBe("12356");
    rerender(<CommaNumberInput value="12356" onChange={onChange} />);
    expect(el).toHaveValue("12,356");
    expect(el.selectionStart).toBe(4);
  });
  test("deleting range of characters including comma", async () => {
    let value = "";
    function onChange(newValue: string) {
      value = newValue;
    }
    const { rerender } = render(
      <CommaNumberInput value="123456789" onChange={onChange} />,
    );
    const el = screen.getByPlaceholderText<HTMLInputElement>("Enter a number");
    expect(el).toHaveValue("123,456,789");
    el.setSelectionRange(1, 5);
    await userEvent.type(el, "{delete}", {
      initialSelectionStart: 1,
      initialSelectionEnd: 5,
    });
    expect(value).toBe("156789");
    rerender(<CommaNumberInput value="156789" onChange={onChange} />);
    expect(el).toHaveValue("156,789");
    expect(el.selectionStart).toBe(1);
  });
  test("paste should trigger on change", async () => {
    let value = "";
    function onChange(newValue: string) {
      value = newValue;
    }
    render(<CommaNumberInput value="" onChange={onChange} />);
    const el = screen.getByPlaceholderText<HTMLInputElement>("Enter a number");
    expect(el).toHaveValue("");
    await userEvent.click(el);
    await userEvent.paste("123456789");
    expect(value).toBe("123456789");
  });
});
