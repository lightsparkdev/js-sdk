import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import * as DatePicker from "./";
import { useRangeEndpointIntent } from "./useRangeEndpointIntent";

function ControlledRangeDraftHarness() {
  const [draft, setDraft] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: new Date(2026, 1, 5),
    end: new Date(2026, 1, 20),
  });

  return (
    <DatePicker.Root
      mode="range"
      rangeDraft={draft}
      onRangeDraftChange={setDraft}
      defaultMonth={new Date(2026, 1, 1)}
    >
      <DatePicker.Header />
      <DatePicker.Grid />
    </DatePicker.Root>
  );
}

describe("DatePicker range ownership", () => {
  it("uses null teardown for legacy forwarded callback refs", () => {
    const legacyRef = vi.fn();
    let setRootRef:
      | ReturnType<typeof useRangeEndpointIntent>["setRootRef"]
      | undefined;

    function Harness() {
      setRootRef = useRangeEndpointIntent(legacyRef, undefined).setRootRef;
      return null;
    }

    render(<Harness />);
    const rootElement = document.createElement("div");

    expect(setRootRef?.(rootElement)).toBeUndefined();
    setRootRef?.(null);

    expect(legacyRef).toHaveBeenNthCalledWith(1, rootElement);
    expect(legacyRef).toHaveBeenNthCalledWith(2, null);
  });

  it("runs a forwarded Root callback ref cleanup on unmount", () => {
    const refCleanup = vi.fn();
    const rootRef = vi.fn(() => refCleanup);
    const { unmount } = render(
      <DatePicker.Root ref={rootRef}>
        <DatePicker.Header />
        <DatePicker.Grid />
      </DatePicker.Root>,
    );

    expect(rootRef).toHaveBeenCalledWith(expect.any(HTMLDivElement));

    unmount();

    expect(refCleanup).toHaveBeenCalledOnce();
    expect(rootRef).not.toHaveBeenCalledWith(null);
  });

  it("updates the focused end date from the calendar while preserving the start", () => {
    function Harness() {
      const [range, setRange] = useState({
        start: new Date(2026, 1, 5),
        end: new Date(2026, 1, 20),
      });

      return (
        <DatePicker.Root
          mode="range"
          value={range}
          onValueChange={(value) => {
            if (!(value instanceof Date)) {
              setRange(value);
            }
          }}
          defaultMonth={new Date(2026, 1, 1)}
        >
          <DatePicker.Header />
          <DatePicker.Grid />
        </DatePicker.Root>
      );
    }

    render(<Harness />);
    const endInput = screen.getByRole("textbox", { name: "End date" });

    fireEvent.focus(endInput);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Tuesday, February 24, 2026",
      }),
    );

    expect(screen.getByRole("textbox", { name: "Start date" })).toHaveValue(
      "02/05/2026",
    );
    expect(endInput).toHaveValue("02/24/2026");
  });

  it("applies focused start intent through the existing range ordering rules", () => {
    const onValueChange = vi.fn();
    render(
      <DatePicker.Root
        mode="range"
        includeTime
        value={{
          start: new Date(2026, 1, 11, 9, 0),
          end: new Date(2026, 1, 15, 17, 30),
        }}
        onValueChange={onValueChange}
        defaultMonth={new Date(2026, 1, 1)}
      >
        <DatePicker.Header />
        <DatePicker.Grid />
      </DatePicker.Root>,
    );

    fireEvent.focus(screen.getByRole("textbox", { name: "Start date" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Friday, February 20, 2026",
      }),
    );

    expect(onValueChange).toHaveBeenCalledWith({
      start: new Date(2026, 1, 15, 9, 0),
      end: new Date(2026, 1, 20, 17, 30),
    });
  });

  it("applies focused end intent through the existing range ordering rules", () => {
    const onValueChange = vi.fn();
    render(
      <DatePicker.Root
        mode="range"
        includeTime
        value={{
          start: new Date(2026, 1, 11, 9, 0),
          end: new Date(2026, 1, 15, 17, 30),
        }}
        onValueChange={onValueChange}
        defaultMonth={new Date(2026, 1, 1)}
      >
        <DatePicker.Header />
        <DatePicker.Grid />
      </DatePicker.Root>,
    );

    fireEvent.focus(screen.getByRole("textbox", { name: "End date" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Thursday, February 5, 2026",
      }),
    );

    expect(onValueChange).toHaveBeenCalledWith({
      start: new Date(2026, 1, 5, 9, 0),
      end: new Date(2026, 1, 11, 17, 30),
    });
  });

  it("starts a conventional new range when no endpoint has fresh intent", () => {
    render(<ControlledRangeDraftHarness />);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Thursday, February 12, 2026",
      }),
    );

    expect(screen.getByRole("textbox", { name: "Start date" })).toHaveValue(
      "02/12/2026",
    );
    expect(screen.getByRole("textbox", { name: "End date" })).toHaveValue("");
  });

  it("consumes endpoint intent after one calendar selection", () => {
    render(<ControlledRangeDraftHarness />);
    fireEvent.focus(screen.getByRole("textbox", { name: "End date" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Tuesday, February 24, 2026",
      }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Thursday, February 12, 2026",
      }),
    );

    expect(screen.getByRole("textbox", { name: "Start date" })).toHaveValue(
      "02/12/2026",
    );
    expect(screen.getByRole("textbox", { name: "End date" })).toHaveValue("");
  });

  it("replaces a cleared invalid endpoint from the calendar", () => {
    render(<ControlledRangeDraftHarness />);
    const endInput = screen.getByRole("textbox", { name: "End date" });
    fireEvent.focus(endInput);
    fireEvent.change(endInput, { target: { value: "" } });
    const dayButton = screen.getByRole("button", {
      name: "Tuesday, February 24, 2026",
    });
    fireEvent.blur(endInput, { relatedTarget: dayButton });
    expect(screen.getByText("Enter a valid date")).toBeInTheDocument();

    fireEvent.click(dayButton);

    expect(screen.queryByText("Enter a valid date")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Start date" })).toHaveValue(
      "02/05/2026",
    );
    expect(endInput).toHaveValue("02/24/2026");
  });

  it("uses focused time input intent for the next calendar selection", () => {
    const onValueChange = vi.fn();
    render(
      <DatePicker.Root
        mode="range"
        includeTime
        value={{
          start: new Date(2026, 1, 11, 9, 0),
          end: new Date(2026, 1, 15, 17, 30),
        }}
        onValueChange={onValueChange}
        defaultMonth={new Date(2026, 1, 1)}
      >
        <DatePicker.Header />
        <DatePicker.Grid />
      </DatePicker.Root>,
    );

    fireEvent.focus(screen.getByRole("textbox", { name: "End time" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Friday, February 20, 2026",
      }),
    );

    expect(onValueChange).toHaveBeenCalledWith({
      start: new Date(2026, 1, 11, 9, 0),
      end: new Date(2026, 1, 20, 17, 30),
    });
  });

  it("preserves a pending conventional start when the end input takes intent", () => {
    const onValueChange = vi.fn();
    render(
      <DatePicker.Root
        mode="range"
        onValueChange={onValueChange}
        defaultMonth={new Date(2026, 1, 1)}
      >
        <DatePicker.Header />
        <DatePicker.Grid />
      </DatePicker.Root>,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Thursday, February 5, 2026",
      }),
    );
    fireEvent.focus(screen.getByRole("textbox", { name: "End date" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Friday, February 20, 2026",
      }),
    );

    expect(onValueChange).toHaveBeenCalledWith({
      start: new Date(2026, 1, 5),
      end: new Date(2026, 1, 20),
    });
  });

  it("preserves start and end role times when end intent completes a pending start", () => {
    const onValueChange = vi.fn();
    render(
      <DatePicker.Root
        mode="range"
        includeTime
        value={{
          start: new Date(2026, 1, 11, 9, 0),
          end: new Date(2026, 1, 15, 17, 30),
        }}
        onValueChange={onValueChange}
        defaultMonth={new Date(2026, 1, 1)}
      >
        <DatePicker.Header />
        <DatePicker.Grid />
      </DatePicker.Root>,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Thursday, February 5, 2026",
      }),
    );
    fireEvent.focus(screen.getByRole("textbox", { name: "End date" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Friday, February 20, 2026",
      }),
    );

    expect(onValueChange).toHaveBeenCalledWith({
      start: new Date(2026, 1, 5, 9, 0),
      end: new Date(2026, 1, 20, 17, 30),
    });
  });

  it("keeps a rejected first calendar selection controlled", () => {
    const rangeDraft = {
      start: new Date(2026, 1, 5),
      end: new Date(2026, 1, 20),
    };
    const onRangeDraftChange = vi.fn();
    const onValueChange = vi.fn();
    const onApply = vi.fn();
    render(
      <DatePicker.Root
        mode="range"
        defaultMonth={new Date(2026, 1, 1)}
        rangeDraft={rangeDraft}
        onRangeDraftChange={onRangeDraftChange}
        onValueChange={onValueChange}
      >
        <DatePicker.Header />
        <DatePicker.Grid />
        <DatePicker.Footer>
          <button type="button" onClick={() => onApply(rangeDraft)}>
            Apply
          </button>
        </DatePicker.Footer>
      </DatePicker.Root>,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Tuesday, February 24, 2026",
      }),
    );

    expect(onRangeDraftChange).toHaveBeenCalledWith({
      start: new Date(2026, 1, 24),
      end: null,
    });
    expect(screen.getByRole("textbox", { name: "Start date" })).toHaveValue(
      "02/05/2026",
    );
    expect(screen.getByRole("textbox", { name: "End date" })).toHaveValue(
      "02/20/2026",
    );
    expect(
      screen.getByRole("button", {
        name: "Tuesday, February 24, 2026",
      }),
    ).not.toHaveAttribute("aria-selected");

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledWith(rangeDraft);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it.each(["Start date", "End date"])(
    "commits a same-day range after typing the first %s without the draft API",
    (label) => {
      const onValueChange = vi.fn();
      render(
        <DatePicker.Root mode="range" onValueChange={onValueChange}>
          <DatePicker.Header />
        </DatePicker.Root>,
      );
      const input = screen.getByRole("textbox", { name: label });

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "02/12/2026" } });
      fireEvent.blur(input);

      expect(onValueChange).toHaveBeenCalledOnce();
      expect(onValueChange).toHaveBeenCalledWith({
        start: new Date(2026, 1, 12),
        end: new Date(2026, 1, 12),
      });
      expect(screen.getByRole("textbox", { name: "Start date" })).toHaveValue(
        "02/12/2026",
      );
      expect(screen.getByRole("textbox", { name: "End date" })).toHaveValue(
        "02/12/2026",
      );
    },
  );

  it("keeps a first typed bound partial when a draft callback is supplied", () => {
    const onValueChange = vi.fn();
    const onRangeDraftChange = vi.fn();
    render(
      <DatePicker.Root
        mode="range"
        onValueChange={onValueChange}
        onRangeDraftChange={onRangeDraftChange}
      >
        <DatePicker.Header />
      </DatePicker.Root>,
    );
    const startInput = screen.getByRole("textbox", { name: "Start date" });

    fireEvent.focus(startInput);
    fireEvent.change(startInput, { target: { value: "02/12/2026" } });
    fireEvent.blur(startInput);

    expect(onRangeDraftChange).toHaveBeenCalledWith({
      start: new Date(2026, 1, 12),
      end: null,
    });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(startInput).toHaveValue("02/12/2026");
    expect(screen.getByRole("textbox", { name: "End date" })).toHaveValue("");
  });

  it("preserves callback-only draft state across value-equal committed rerenders", async () => {
    function Harness() {
      const [committedRange, setCommittedRange] = useState({
        start: new Date(2026, 1, 5),
        end: new Date(2026, 1, 20),
      });

      return (
        <>
          <button
            type="button"
            onClick={() =>
              setCommittedRange({
                start: new Date(2026, 1, 5),
                end: new Date(2026, 1, 20),
              })
            }
          >
            Rerender equal
          </button>
          <button
            type="button"
            onClick={() =>
              setCommittedRange({
                start: new Date(2026, 1, 6),
                end: new Date(2026, 1, 20),
              })
            }
          >
            Change committed range
          </button>
          <DatePicker.Root
            mode="range"
            value={committedRange}
            onRangeDraftChange={() => undefined}
            defaultMonth={new Date(2026, 1, 1)}
          >
            <DatePicker.Header />
            <DatePicker.Grid />
          </DatePicker.Root>
        </>
      );
    }

    render(<Harness />);
    const startInput = screen.getByRole("textbox", { name: "Start date" });
    const endInput = screen.getByRole("textbox", { name: "End date" });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Thursday, February 12, 2026",
      }),
    );
    expect(startInput).toHaveValue("02/12/2026");
    expect(endInput).toHaveValue("");

    fireEvent.click(screen.getByRole("button", { name: "Rerender equal" }));
    await waitFor(() => {
      expect(startInput).toHaveValue("02/12/2026");
      expect(endInput).toHaveValue("");
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Change committed range" }),
    );
    await waitFor(() => {
      expect(startInput).toHaveValue("02/06/2026");
      expect(endInput).toHaveValue("02/20/2026");
    });
  });

  it("retains and orders an end-only draft completed from the calendar", () => {
    const onValueChange = vi.fn();

    function Harness() {
      const [draft, setDraft] = useState({
        start: null as Date | null,
        end: new Date(2026, 1, 15),
      });

      return (
        <DatePicker.Root
          mode="range"
          defaultMonth={new Date(2026, 1, 1)}
          rangeDraft={draft}
          onRangeDraftChange={setDraft}
          onValueChange={onValueChange}
        >
          <DatePicker.Header />
          <DatePicker.Grid />
        </DatePicker.Root>
      );
    }

    render(<Harness />);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Friday, February 20, 2026",
      }),
    );

    expect(onValueChange).toHaveBeenCalledWith({
      start: new Date(2026, 1, 15),
      end: new Date(2026, 1, 20),
    });
    expect(screen.getByRole("textbox", { name: "Start date" })).toHaveValue(
      "02/15/2026",
    );
    expect(screen.getByRole("textbox", { name: "End date" })).toHaveValue(
      "02/20/2026",
    );
  });

  it("honors a controlled null draft over the committed range", () => {
    render(
      <DatePicker.Root
        mode="range"
        value={{
          start: new Date(2026, 1, 5, 9, 0),
          end: new Date(2026, 1, 20, 17, 0),
        }}
        rangeDraft={null}
      >
        <DatePicker.Header />
      </DatePicker.Root>,
    );

    expect(screen.getByRole("textbox", { name: "Start date" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "End date" })).toHaveValue("");
  });

  it.each(["local", "UTC"] as const)(
    "disables a missing bound's time in an explicit %s draft",
    (timeZone) => {
      const onRangeDraftChange = vi.fn();
      render(
        <DatePicker.Root
          mode="range"
          includeTime
          timeZone={timeZone}
          rangeDraft={{
            start:
              timeZone === "UTC"
                ? new Date("2026-03-08T02:30:00.000Z")
                : new Date(2026, 2, 8, 2, 30),
            end: null,
          }}
          onRangeDraftChange={onRangeDraftChange}
        >
          <DatePicker.Header />
        </DatePicker.Root>,
      );

      const suffix = timeZone === "UTC" ? " (UTC)" : "";
      expect(
        screen.getByRole("textbox", { name: `Start time${suffix}` }),
      ).not.toBeDisabled();
      expect(
        screen.getByRole("textbox", { name: `End time${suffix}` }),
      ).toBeDisabled();
      expect(
        screen.getByRole("textbox", { name: `End time${suffix}` }),
      ).toHaveValue("");
      expect(onRangeDraftChange).not.toHaveBeenCalled();
    },
  );

  it("preserves legacy time-first today synthesis without the draft API", () => {
    const onValueChange = vi.fn();
    render(
      <DatePicker.Root mode="range" includeTime onValueChange={onValueChange}>
        <DatePicker.Header />
      </DatePicker.Root>,
    );
    const startTime = screen.getByRole("textbox", { name: "Start time" });

    fireEvent.focus(startTime);
    fireEvent.change(startTime, { target: { value: "5:00 PM" } });
    fireEvent.blur(startTime);

    expect(onValueChange).toHaveBeenCalledOnce();
    const range = onValueChange.mock.calls[0]?.[0];
    expect(range.start.getTime()).toBe(range.end.getTime());
    expect(range.start.getFullYear()).toBe(new Date().getFullYear());
    expect(range.start.getMonth()).toBe(new Date().getMonth());
    expect(range.start.getDate()).toBe(new Date().getDate());
    expect(range.start.getHours()).toBe(17);
  });

  it("represents and edits UTC wall-clock times inside a local DST gap", () => {
    const onRangeDraftChange = vi.fn();

    function Harness() {
      const [draft, setDraft] = useState({
        start: new Date("2026-03-08T02:30:00.000Z"),
        end: new Date("2026-03-08T04:30:00.000Z"),
      });
      return (
        <DatePicker.Root
          mode="range"
          includeTime
          timeZone="UTC"
          rangeDraft={draft}
          onRangeDraftChange={(nextDraft) => {
            onRangeDraftChange(nextDraft);
            setDraft(nextDraft);
          }}
        >
          <DatePicker.Header />
        </DatePicker.Root>
      );
    }

    render(<Harness />);

    expect(screen.getByRole("textbox", { name: "Start date" })).toHaveValue(
      "03/08/2026",
    );
    const startTime = screen.getByRole("textbox", {
      name: "Start time (UTC)",
    });
    expect(startTime).toHaveValue("2:30 AM");

    fireEvent.focus(startTime);
    fireEvent.change(startTime, { target: { value: "2:45 AM" } });
    fireEvent.blur(startTime);

    const emittedDraft = onRangeDraftChange.mock.calls.at(-1)?.[0];
    expect(emittedDraft.start.toISOString()).toBe("2026-03-08T02:45:00.000Z");
    expect(emittedDraft.end.toISOString()).toBe("2026-03-08T04:30:00.000Z");
    expect(startTime).toHaveValue("2:45 AM");
  });

  it("keeps the committed range and controlled partial draft as independent channels", async () => {
    const onValueChange = vi.fn();
    const onRangeDraftChange = vi.fn();

    function Harness() {
      const [, setUpdateCount] = useState(0);
      return (
        <DatePicker.Root
          mode="range"
          value={{
            start: new Date(2026, 1, 5, 9, 0),
            end: new Date(2026, 1, 20, 17, 0),
          }}
          onValueChange={onValueChange}
          rangeDraft={{ start: new Date(2026, 1, 12, 9, 0), end: null }}
          onRangeDraftChange={(draft) => {
            onRangeDraftChange(draft);
            setUpdateCount((count) => count + 1);
          }}
        >
          <DatePicker.Header />
        </DatePicker.Root>
      );
    }

    render(<Harness />);

    const startInput = screen.getByRole("textbox", { name: "Start date" });
    const endInput = screen.getByRole("textbox", { name: "End date" });
    expect(startInput).toHaveValue("02/12/2026");
    expect(endInput).toHaveValue("");

    fireEvent.focus(endInput);
    fireEvent.change(endInput, { target: { value: "02/10/2026" } });
    fireEvent.blur(endInput);

    expect(onRangeDraftChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledOnce();
    const emittedDraft = onRangeDraftChange.mock.calls[0]?.[0];
    const committedRange = onValueChange.mock.calls[0]?.[0];
    expect(emittedDraft.start).toEqual(new Date(2026, 1, 10));
    expect(emittedDraft.end).toEqual(new Date(2026, 1, 12, 9, 0));
    expect(committedRange).toEqual(emittedDraft);

    await waitFor(() => {
      expect(startInput).toHaveValue("02/12/2026");
      expect(endInput).toHaveValue("");
    });
  });
});

describe("DatePicker grid focus and composition", () => {
  function getRovingDays() {
    return within(screen.getByRole("grid"))
      .getAllByRole("button")
      .filter((button) => button.tabIndex === 0);
  }

  it("creates one visible roving tab stop when value and month differ", async () => {
    render(
      <DatePicker.Root
        value={new Date("2026-02-11T00:00:00.000Z")}
        defaultMonth={new Date("2026-07-01T00:00:00.000Z")}
        timeZone="UTC"
      >
        <DatePicker.Grid />
      </DatePicker.Root>,
    );

    await waitFor(() => expect(getRovingDays()).toHaveLength(1));
    expect(getRovingDays()[0]).toHaveAccessibleName("Wednesday, July 1, 2026");
  });

  it("reconciles the roving tab stop after an external month change", async () => {
    function Harness() {
      const [month, setMonth] = useState(new Date("2026-07-01T00:00:00.000Z"));
      return (
        <>
          <button
            type="button"
            onClick={() => setMonth(new Date("2026-08-01T00:00:00.000Z"))}
          >
            Change month
          </button>
          <DatePicker.Root
            month={month}
            onMonthChange={setMonth}
            value={new Date("2026-08-15T00:00:00.000Z")}
            timeZone="UTC"
          >
            <DatePicker.Grid />
          </DatePicker.Root>
        </>
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Change month" }));

    await waitFor(() => expect(getRovingDays()).toHaveLength(1));
    expect(getRovingDays()[0]).toHaveAccessibleName(
      "Saturday, August 15, 2026",
    );
  });

  it("keeps a disabled roving tab stop after an external month change", async () => {
    const onValueChange = vi.fn();

    function Harness() {
      const [month, setMonth] = useState(new Date("2026-07-01T00:00:00.000Z"));
      return (
        <>
          <button
            type="button"
            onClick={() => setMonth(new Date("2026-08-01T00:00:00.000Z"))}
          >
            Change month
          </button>
          <DatePicker.Root
            month={month}
            onMonthChange={setMonth}
            onValueChange={onValueChange}
            disabled={(date) => date.getUTCMonth() === 7}
            timeZone="UTC"
          >
            <DatePicker.Grid />
          </DatePicker.Root>
        </>
      );
    }

    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Change month" }));

    await waitFor(() => expect(getRovingDays()).toHaveLength(1));
    const rovingDay = getRovingDays()[0];
    expect(rovingDay).toHaveAccessibleName("Saturday, August 1, 2026");
    expect(rovingDay).toHaveAttribute("aria-disabled", "true");

    rovingDay.focus();
    expect(rovingDay).toHaveFocus();

    fireEvent.keyDown(rovingDay, { key: "Enter" });
    fireEvent.keyDown(rovingDay, { key: " " });

    expect(onValueChange).not.toHaveBeenCalled();
    expect(rovingDay).not.toHaveAttribute("aria-selected");
  });

  it("skips disabled dates and stops at min/max keyboard boundaries", async () => {
    render(
      <DatePicker.Root
        defaultMonth={new Date("2026-02-01T00:00:00.000Z")}
        min={new Date("2026-02-10T00:00:00.000Z")}
        max={new Date("2026-02-12T00:00:00.000Z")}
        disabled={(date) => date.getUTCDate() === 11}
        timeZone="UTC"
      >
        <DatePicker.Grid />
      </DatePicker.Root>,
    );
    await waitFor(() =>
      expect(getRovingDays()[0]).toHaveAccessibleName(
        "Tuesday, February 10, 2026",
      ),
    );
    const grid = screen.getByRole("grid");

    fireEvent.keyDown(grid, { key: "ArrowRight" });
    expect(getRovingDays()[0]).toHaveAccessibleName(
      "Thursday, February 12, 2026",
    );
    fireEvent.keyDown(grid, { key: "ArrowRight" });
    expect(getRovingDays()[0]).toHaveAccessibleName(
      "Thursday, February 12, 2026",
    );
    fireEvent.keyDown(grid, { key: "ArrowDown" });
    expect(getRovingDays()[0]).toHaveAccessibleName(
      "Thursday, February 12, 2026",
    );
    fireEvent.keyDown(grid, { key: "ArrowLeft" });
    expect(getRovingDays()[0]).toHaveAccessibleName(
      "Tuesday, February 10, 2026",
    );
    fireEvent.keyDown(grid, { key: "ArrowUp" });
    expect(getRovingDays()[0]).toHaveAccessibleName(
      "Tuesday, February 10, 2026",
    );
    fireEvent.keyDown(grid, { key: "End" });
    expect(getRovingDays()[0]).toHaveAccessibleName(
      "Thursday, February 12, 2026",
    );
    fireEvent.keyDown(grid, { key: "Home" });
    expect(getRovingDays()[0]).toHaveAccessibleName(
      "Tuesday, February 10, 2026",
    );
    fireEvent.keyDown(grid, { key: "End" });
    expect(getRovingDays()[0]).toHaveAccessibleName(
      "Thursday, February 12, 2026",
    );
    fireEvent.keyDown(grid, { key: "PageDown" });
    expect(getRovingDays()[0]).toHaveAccessibleName(
      "Thursday, February 12, 2026",
    );
    fireEvent.keyDown(grid, { key: "PageUp" });
    expect(getRovingDays()[0]).toHaveAccessibleName(
      "Thursday, February 12, 2026",
    );
  });

  it("composes consumer and internal grid handlers once", async () => {
    const onKeyDown = vi.fn();
    const onMouseLeave = vi.fn();
    render(
      <DatePicker.Root
        mode="range"
        defaultMonth={new Date("2026-02-01T00:00:00.000Z")}
        timeZone="UTC"
      >
        <DatePicker.Grid onKeyDown={onKeyDown} onMouseLeave={onMouseLeave} />
      </DatePicker.Root>,
    );
    await waitFor(() => expect(getRovingDays()).toHaveLength(1));
    const grid = screen.getByRole("grid");
    const initialLabel = getRovingDays()[0].getAttribute("aria-label");

    fireEvent.keyDown(grid, { key: "ArrowRight" });
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(getRovingDays()[0]).not.toHaveAccessibleName(initialLabel!);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Wednesday, February 11, 2026",
      }),
    );
    const rangeEnd = screen.getByRole("button", {
      name: "Friday, February 13, 2026",
    });
    fireEvent.mouseEnter(rangeEnd);
    expect(rangeEnd).toHaveAttribute("data-range-end");

    fireEvent.mouseLeave(grid);
    expect(onMouseLeave).toHaveBeenCalledOnce();
    expect(rangeEnd).not.toHaveAttribute("data-range-end");
  });

  it("respects consumer prevention of internal grid handlers", async () => {
    render(
      <DatePicker.Root
        mode="range"
        defaultMonth={new Date("2026-02-01T00:00:00.000Z")}
        timeZone="UTC"
      >
        <DatePicker.Grid
          onKeyDown={(event) => event.preventDefault()}
          onMouseLeave={(event) => event.preventDefault()}
        />
      </DatePicker.Root>,
    );
    await waitFor(() => expect(getRovingDays()).toHaveLength(1));
    const grid = screen.getByRole("grid");
    const initialLabel = getRovingDays()[0].getAttribute("aria-label");

    fireEvent.keyDown(grid, { key: "ArrowRight" });

    expect(getRovingDays()[0]).toHaveAccessibleName(initialLabel!);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Wednesday, February 11, 2026",
      }),
    );
    const rangeEnd = screen.getByRole("button", {
      name: "Friday, February 13, 2026",
    });
    fireEvent.mouseEnter(rangeEnd);
    expect(rangeEnd).toHaveAttribute("data-range-end");

    fireEvent.mouseLeave(grid);
    expect(rangeEnd).toHaveAttribute("data-range-end");
  });

  it("supports Base UI handler cancellation from grid consumers", async () => {
    render(
      <DatePicker.Root
        defaultMonth={new Date("2026-02-01T00:00:00.000Z")}
        timeZone="UTC"
      >
        <DatePicker.Grid onKeyDown={(event) => event.preventBaseUIHandler()} />
      </DatePicker.Root>,
    );
    await waitFor(() => expect(getRovingDays()).toHaveLength(1));
    const initialLabel = getRovingDays()[0].getAttribute("aria-label");

    fireEvent.keyDown(screen.getByRole("grid"), { key: "ArrowRight" });

    expect(getRovingDays()[0]).toHaveAccessibleName(initialLabel!);
  });

  it("marks today with aria-current", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-11T12:00:00.000Z"));
    render(
      <DatePicker.Root
        defaultMonth={new Date("2026-02-01T00:00:00.000Z")}
        timeZone="UTC"
      >
        <DatePicker.Grid />
      </DatePicker.Root>,
    );

    expect(
      screen.getByRole("button", {
        name: "Wednesday, February 11, 2026",
      }),
    ).toHaveAttribute("aria-current", "date");
  });

  it("opens unseeded with empty inputs, the current month, and focus on today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-11T12:00:00.000Z"));
    render(
      <DatePicker.Root mode="range" timeZone="UTC">
        <DatePicker.Header />
        <DatePicker.Grid />
      </DatePicker.Root>,
    );

    const grid = screen.getByRole("grid");
    expect(grid).toHaveAccessibleName("February 2026");
    expect(screen.getByRole("textbox", { name: "Start date" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "End date" })).toHaveValue("");
    expect(grid.querySelector("[aria-selected]")).toBeNull();

    const today = screen.getByRole("button", {
      name: "Wednesday, February 11, 2026",
    });
    expect(today).toHaveAttribute("data-today", "true");
    expect(today).toHaveAttribute("tabindex", "0");
  });
});
