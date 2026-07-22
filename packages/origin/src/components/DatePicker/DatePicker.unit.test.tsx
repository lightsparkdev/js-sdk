import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import * as DatePicker from "./";

describe("DatePicker range ownership", () => {
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

      expect(
        screen.getByRole("textbox", { name: "Start time" }),
      ).not.toBeDisabled();
      expect(screen.getByRole("textbox", { name: "End time" })).toBeDisabled();
      expect(screen.getByRole("textbox", { name: "End time" })).toHaveValue("");
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
    const startTime = screen.getByRole("textbox", { name: "Start time" });
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
