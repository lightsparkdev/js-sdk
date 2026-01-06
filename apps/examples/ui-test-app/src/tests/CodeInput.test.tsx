import { jest } from "@jest/globals";
import { CodeInput } from "@lightsparkdev/ui/components/CodeInput/CodeInput";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "./render";

describe("CodeInput", () => {
  beforeEach(() => {
    const mockClipboardReadWithoutNumbers = jest.fn(() =>
      Promise.resolve("sdkjfnsd"),
    );
    // `userEvent.setup()` may install `navigator.clipboard` as a getter-only prop.
    // Use `defineProperty` so this mock is resilient regardless of that setup.
    Object.defineProperty(navigator, "clipboard", {
      value: {
        readText: mockClipboardReadWithoutNumbers,
      },
      configurable: true,
    });
  });

  it("renders the correct number of input fields", () => {
    render(<CodeInput codeLength={8} />);
    const inputFields = screen.getAllByRole("spinbutton");
    expect(inputFields).toHaveLength(8);
  });

  it("prevents non-numeric characters from being entered", () => {
    render(<CodeInput codeLength={8} />);
    const inputField = screen.getAllByRole("spinbutton")[0];
    fireEvent.keyDown(inputField, { key: "A" });
    expect(inputField).toHaveValue(null);
  });

  it("allows numeric characters to be entered", () => {
    render(<CodeInput codeLength={8} />);
    const inputField = screen.getAllByRole("spinbutton")[0];
    fireEvent.keyDown(inputField, { key: "1" });
    expect(inputField).toHaveValue(1);
  });

  it('handles the "Backspace" key correctly', () => {
    render(<CodeInput codeLength={8} />);
    const inputFields = screen.getAllByRole("spinbutton");
    const firstInput = inputFields[0];
    const secondInput = inputFields[1];
    fireEvent.keyDown(firstInput, { key: "1" });
    expect(secondInput).toHaveFocus();

    // deleting from the empty second input should move the focus back to the
    // first
    fireEvent.keyDown(inputFields[1], { key: "Backspace" });
    expect(firstInput).toHaveFocus();

    // deleting with a value should remove the value
    fireEvent.keyDown(firstInput, { key: "Backspace" });
    expect(firstInput).toHaveValue(null);

    // test deleting past the first input
    fireEvent.keyDown(firstInput, { key: "Backspace" });
    expect(firstInput).toHaveFocus();
  });

  it('handles the "Delete" key correctly', () => {
    render(<CodeInput codeLength={8} />);
    const inputFields = screen.getAllByRole("spinbutton");
    const firstInput = inputFields[0];
    const secondInput = inputFields[1];
    fireEvent.keyDown(firstInput, { key: "1" });
    expect(secondInput).toHaveFocus();
    fireEvent.keyDown(secondInput, { key: "ArrowLeft" });
    expect(firstInput).toHaveFocus();
    fireEvent.keyDown(firstInput, { key: "Delete" });
    expect(firstInput).toHaveValue(null);
    expect(inputFields[1]).toHaveFocus();
  });

  it('handles the "Arrow" keys correctly', () => {
    render(<CodeInput codeLength={4} />);
    const inputFields = screen.getAllByRole("spinbutton");
    fireEvent.keyDown(inputFields[0], { key: "ArrowRight" });
    expect(inputFields[1]).toHaveFocus();
    fireEvent.keyDown(inputFields[1], { key: "ArrowRight" });
    expect(inputFields[2]).toHaveFocus();
    fireEvent.keyDown(inputFields[2], { key: "ArrowRight" });
    expect(inputFields[3]).toHaveFocus();
    fireEvent.keyDown(inputFields[3], { key: "ArrowLeft" });
    expect(inputFields[2]).toHaveFocus();
    fireEvent.keyDown(inputFields[2], { key: "ArrowLeft" });
    expect(inputFields[1]).toHaveFocus();
    fireEvent.keyDown(inputFields[1], { key: "ArrowLeft" });
    expect(inputFields[0]).toHaveFocus();
    fireEvent.keyDown(inputFields[0], { key: "ArrowLeft" });
    expect(inputFields[0]).toHaveFocus();
  });

  it('handles the "Escape" key correctly', () => {
    render(<CodeInput codeLength={8} />);
    const inputFields = screen.getAllByRole("spinbutton");
    fireEvent.keyDown(inputFields[0], { key: "1" });
    expect(inputFields[1]).toHaveFocus();
    fireEvent.keyDown(inputFields[1], { key: "Escape" });
    expect(inputFields[1]).not.toHaveFocus();
  });

  it('handles the "Backspace" with meta keys correctly', () => {
    render(<CodeInput codeLength={8} />);
    const inputFields = screen.getAllByRole("spinbutton");
    fireEvent.keyDown(inputFields[0], { key: "1" });
    fireEvent.keyDown(inputFields[1], { key: "2" });
    fireEvent.keyDown(inputFields[2], { key: "3" });
    fireEvent.keyDown(inputFields[3], { key: "Backspace", metaKey: true });
    expect(inputFields[0]).toHaveValue(null);
    expect(inputFields[1]).toHaveValue(null);
    expect(inputFields[2]).toHaveValue(null);
    expect(inputFields[3]).toHaveValue(null);
    expect(inputFields[0]).toHaveFocus();
  });

  it("handles pasting data correctly", async () => {
    render(<CodeInput codeLength={8} />);

    const inputFields = screen.getAllByRole("spinbutton");
    fireEvent.paste(inputFields[0], {
      clipboardData: { getData: () => "sdkjfnsd" },
    });
    expect(inputFields[0]).toHaveValue(null);
    expect(inputFields[1]).toHaveValue(null);
    expect(inputFields[2]).toHaveValue(null);

    fireEvent.paste(inputFields[0], {
      clipboardData: { getData: () => "234" },
    });
    await waitFor(() => expect(inputFields[0]).toHaveValue(2));
    expect(inputFields[0]).toHaveValue(2);
    expect(inputFields[1]).toHaveValue(3);
    expect(inputFields[2]).toHaveValue(4);
    expect(inputFields[3]).toHaveValue(null);
    expect(inputFields[2]).toHaveFocus();
  });

  it("redirects focus to first empty input when clicking on empty input in unified variant", async () => {
    const user = userEvent.setup();
    render(<CodeInput codeLength={6} variant="unified" />);
    const inputFields = screen.getAllByRole("textbox");
    expect(inputFields).toHaveLength(6);

    // Enter some digits in the first two positions
    fireEvent.keyDown(inputFields[0], { key: "1" });
    fireEvent.keyDown(inputFields[1], { key: "2" });

    // Now focus should be on the third input (index 2)
    expect(inputFields[2]).toHaveFocus();

    // Simulate clicking on the 5th input (index 4) - an empty position
    // onMouseDown should redirect focus to the first empty input (index 2)
    await user.click(inputFields[4]);
    expect(inputFields[2]).toHaveFocus();
  });

  it("allows clicking on any filled input in unified variant", async () => {
    const user = userEvent.setup();
    render(<CodeInput codeLength={6} variant="unified" />);
    const inputFields = screen.getAllByRole("textbox");

    // Enter some digits
    fireEvent.keyDown(inputFields[0], { key: "1" });
    fireEvent.keyDown(inputFields[1], { key: "2" });
    fireEvent.keyDown(inputFields[2], { key: "3" });

    // Focus should be on the 4th input (index 3)
    expect(inputFields[3]).toHaveFocus();

    // Clicking on a filled input (index 1) should work normally - no redirect
    await user.click(inputFields[1]);
    expect(inputFields[1]).toHaveFocus();

    // Can also click on index 0
    await user.click(inputFields[0]);
    expect(inputFields[0]).toHaveFocus();

    // Can also click on index 2
    await user.click(inputFields[2]);
    expect(inputFields[2]).toHaveFocus();
  });

  it("focuses first input when all inputs are empty in unified variant", () => {
    render(<CodeInput codeLength={6} variant="unified" />);
    const inputFields = screen.getAllByRole("textbox");

    // Blur the auto-focused first input
    fireEvent.blur(inputFields[0]);

    // Click on a middle input when all are empty
    fireEvent.mouseDown(inputFields[3]);
    expect(inputFields[0]).toHaveFocus();
  });
});
