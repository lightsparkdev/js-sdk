import { jest } from "@jest/globals";
import { TextInput } from "@lightsparkdev/ui/components/TextInput";
import { act, screen } from "@testing-library/react";
import { render } from "./render";

describe("TextInput", () => {
  const noop = () => {};

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should leave no pending timer behind when unmounted without subtext", () => {
    const { unmount } = render(<TextInput value="" onChange={noop} />);

    unmount();

    expect(jest.getTimerCount()).toBe(0);
  });

  test("should leave no pending timer behind when unmounted after subtext clears", () => {
    const { rerender, unmount } = render(
      <TextInput value="" onChange={noop} hint="A hint" />,
    );

    rerender(<TextInput value="" onChange={noop} />);
    unmount();

    expect(jest.getTimerCount()).toBe(0);
  });

  test("should keep the hint mounted until the fade-out elapses, then drop it", () => {
    const { rerender } = render(
      <TextInput value="" onChange={noop} hint="A hint" />,
    );
    expect(screen.getByText("A hint")).toBeInTheDocument();

    rerender(<TextInput value="" onChange={noop} />);
    expect(screen.getByText("A hint")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(screen.queryByText("A hint")).not.toBeInTheDocument();
  });

  test("should keep a restored hint when it returns before the fade-out elapses", () => {
    const { rerender } = render(
      <TextInput value="" onChange={noop} hint="A hint" />,
    );

    rerender(<TextInput value="" onChange={noop} />);
    rerender(<TextInput value="" onChange={noop} hint="A hint" />);

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(screen.getByText("A hint")).toBeInTheDocument();
  });
});
