import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, useLayoutEffect, useState } from "react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsProvider } from "../Analytics";
import * as DatePicker from "./";
import type { DatePickerPreset, DateRange, DateRangeDraft } from "./";

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

beforeEach(() => {
  vi.useRealTimers();
});

const LONG_PRESET_LABEL = "Previous 24 hours with a deliberately long label";

const PRESETS = [
  {
    id: "today",
    label: "Today",
    textValue: "Today",
    resolve: (now) => ({
      value: new Date(now),
      mode: "single",
      granularity: "date",
    }),
  },
  {
    id: "window",
    label: LONG_PRESET_LABEL,
    textValue: LONG_PRESET_LABEL,
    resolve: (now) => ({
      value: {
        start: new Date(now.getTime() - 86_400_000),
        end: new Date(now),
      },
      mode: "range",
      granularity: "date-time",
    }),
  },
] as const satisfies readonly DatePickerPreset[];

const UNAVAILABLE_PRESET_CASES = [
  {
    availability: "missing",
    presets: [] as readonly DatePickerPreset[],
  },
  {
    availability: "disabled",
    presets: [{ ...PRESETS[0], disabled: true }],
  },
] as const;

const UNRESOLVABLE_PRESET_CASES = [
  {
    resolution: "throwing",
    createResolve: () =>
      vi.fn(() => {
        throw new Error("resolver failed");
      }),
  },
  {
    resolution: "malformed",
    createResolve: () => vi.fn(() => null as never),
  },
] as const;

function choosePreset(label: string) {
  fireEvent.click(screen.getByRole("combobox", { name: "Date preset" }));
  const option = screen.getByRole("option", { name: label });
  fireEvent.pointerDown(option, { button: 0 });
  fireEvent.mouseDown(option, { button: 0 });
  fireEvent.pointerUp(option, { button: 0 });
  fireEvent.mouseUp(option, { button: 0 });
  fireEvent.click(option);
}

describe("DatePicker presets", () => {
  it("defines the previous 24 hours fixture as a full day", () => {
    const now = new Date("2026-07-31T17:30:45.000Z");

    expect(PRESETS[1].resolve(now)).toEqual({
      value: {
        start: new Date("2026-07-30T17:30:45.000Z"),
        end: now,
      },
      mode: "range",
      granularity: "date-time",
    });
  });

  it("resolves now once on selection and updates the uncontrolled state tuple", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-31T17:30:45.000Z"));
    const onValueChange = vi.fn();
    const onModeChange = vi.fn();
    const onGranularityChange = vi.fn();
    const onPresetIdChange = vi.fn();
    const resolve = vi.fn((now: Date) => ({
      value: new Date(now),
      mode: "single" as const,
      granularity: "date" as const,
    }));

    render(
      <DatePicker.Root
        presets={[{ id: "today", label: "Today", textValue: "Today", resolve }]}
        onValueChange={onValueChange}
        onModeChange={onModeChange}
        onGranularityChange={onGranularityChange}
        onPresetIdChange={onPresetIdChange}
      >
        <DatePicker.PresetSelect />
      </DatePicker.Root>,
    );

    expect(
      screen.getByRole("combobox", { name: "Date preset" }),
    ).toHaveTextContent("Custom");
    choosePreset("Today");

    expect(onValueChange).toHaveBeenCalledWith(
      new Date("2026-07-31T17:30:45.000Z"),
    );
    expect(onModeChange).toHaveBeenCalledWith("single");
    expect(onGranularityChange).toHaveBeenCalledWith("date");
    expect(onPresetIdChange).toHaveBeenCalledWith("today");
    expect(resolve).toHaveBeenCalledOnce();
    expect(resolve).toHaveBeenCalledWith(new Date("2026-07-31T17:30:45.000Z"));
    expect(
      screen.getByRole("combobox", { name: "Date preset" }),
    ).toHaveTextContent("Today");
  });

  it("keeps the full long label in the trigger and open option", () => {
    render(
      <DatePicker.Root presets={PRESETS} defaultPresetId="window">
        <DatePicker.PresetSelect />
      </DatePicker.Root>,
    );

    const trigger = screen.getByRole("combobox", { name: "Date preset" });
    expect(trigger).toHaveTextContent(LONG_PRESET_LABEL);

    fireEvent.click(trigger);

    const option = screen.getByRole("option", { name: LONG_PRESET_LABEL });
    expect(option).toHaveTextContent(LONG_PRESET_LABEL);
  });

  it("reports the selected preset's next mode to analytics", () => {
    const onInteraction = vi.fn();
    render(
      <AnalyticsProvider value={{ onInteraction }}>
        <DatePicker.Root
          mode="range"
          presets={PRESETS}
          analyticsName="created-at"
        >
          <DatePicker.PresetSelect />
        </DatePicker.Root>
      </AnalyticsProvider>,
    );

    choosePreset("Today");

    expect(onInteraction).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ mode: "single" }),
      }),
    );
  });

  it("keeps controlled preset identity authoritative", () => {
    const onPresetIdChange = vi.fn();
    render(
      <DatePicker.Root
        presets={PRESETS}
        presetId={null}
        onPresetIdChange={onPresetIdChange}
      >
        <DatePicker.PresetSelect />
      </DatePicker.Root>,
    );

    choosePreset("Today");

    expect(onPresetIdChange).toHaveBeenCalledWith("today");
    expect(
      screen.getByRole("combobox", { name: "Date preset" }),
    ).toHaveTextContent("Custom");
  });

  it.each(UNAVAILABLE_PRESET_CASES)(
    "normalizes an initially $availability controlled preset identity to Custom",
    ({ presets }) => {
      const actionsRef = createRef<DatePicker.DatePickerActions>();
      const onPresetIdChange = vi.fn();
      const onValidityChange = vi.fn();

      render(
        <DatePicker.Root
          actionsRef={actionsRef}
          presets={presets}
          presetId="today"
          onPresetIdChange={onPresetIdChange}
          onValidityChange={onValidityChange}
        >
          <DatePicker.PresetSelect />
        </DatePicker.Root>,
      );

      expect(
        screen.getByRole("combobox", { name: "Date preset" }),
      ).toHaveTextContent("Custom");
      expect(actionsRef.current?.validate()).toBe(true);
      expect(onValidityChange).toHaveBeenLastCalledWith(true);
      expect(onPresetIdChange).not.toHaveBeenCalled();
    },
  );

  it("normalizes a controlled preset identity update to Custom", () => {
    const actionsRef = createRef<DatePicker.DatePickerActions>();
    const onValidityChange = vi.fn();
    const { rerender } = render(
      <DatePicker.Root
        actionsRef={actionsRef}
        presets={PRESETS}
        presetId="today"
        onValidityChange={onValidityChange}
      >
        <DatePicker.PresetSelect />
      </DatePicker.Root>,
    );

    expect(
      screen.getByRole("combobox", { name: "Date preset" }),
    ).toHaveTextContent("Today");

    rerender(
      <DatePicker.Root
        actionsRef={actionsRef}
        presets={PRESETS}
        presetId="missing"
        onValidityChange={onValidityChange}
      >
        <DatePicker.PresetSelect />
      </DatePicker.Root>,
    );

    expect(
      screen.getByRole("combobox", { name: "Date preset" }),
    ).toHaveTextContent("Custom");
    expect(actionsRef.current?.validate()).toBe(true);
    expect(onValidityChange).toHaveBeenLastCalledWith(true);
  });

  it.each(UNAVAILABLE_PRESET_CASES)(
    "normalizes an initially $availability uncontrolled preset identity to Custom",
    ({ presets }) => {
      const actionsRef = createRef<DatePicker.DatePickerActions>();
      const onPresetIdChange = vi.fn();
      const onValidityChange = vi.fn();

      render(
        <DatePicker.Root
          actionsRef={actionsRef}
          presets={presets}
          defaultPresetId="today"
          onPresetIdChange={onPresetIdChange}
          onValidityChange={onValidityChange}
        >
          <DatePicker.PresetSelect />
        </DatePicker.Root>,
      );

      expect(
        screen.getByRole("combobox", { name: "Date preset" }),
      ).toHaveTextContent("Custom");
      expect(actionsRef.current?.validate()).toBe(true);
      expect(onValidityChange).toHaveBeenLastCalledWith(true);
      expect(onPresetIdChange).not.toHaveBeenCalled();
    },
  );

  it.each(UNAVAILABLE_PRESET_CASES)(
    "clears an uncontrolled preset identity when it becomes $availability",
    ({ presets }) => {
      const actionsRef = createRef<DatePicker.DatePickerActions>();
      const onPresetIdChange = vi.fn();
      const onValidityChange = vi.fn();
      const { rerender } = render(
        <DatePicker.Root
          actionsRef={actionsRef}
          presets={PRESETS}
          defaultPresetId="today"
          onPresetIdChange={onPresetIdChange}
          onValidityChange={onValidityChange}
        >
          <DatePicker.PresetSelect />
        </DatePicker.Root>,
      );

      expect(
        screen.getByRole("combobox", { name: "Date preset" }),
      ).toHaveTextContent("Today");

      rerender(
        <DatePicker.Root
          actionsRef={actionsRef}
          presets={presets}
          defaultPresetId="today"
          onPresetIdChange={onPresetIdChange}
          onValidityChange={onValidityChange}
        >
          <DatePicker.PresetSelect />
        </DatePicker.Root>,
      );

      expect(
        screen.getByRole("combobox", { name: "Date preset" }),
      ).toHaveTextContent("Custom");
      expect(onPresetIdChange).toHaveBeenCalledOnce();
      expect(onPresetIdChange).toHaveBeenCalledWith(null);
      expect(actionsRef.current?.validate()).toBe(true);
      expect(onValidityChange).toHaveBeenLastCalledWith(true);
    },
  );

  it.each(UNRESOLVABLE_PRESET_CASES)(
    "normalizes an initially $resolution controlled preset identity to Custom",
    ({ createResolve }) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-08-10T12:00:00.000Z"));
      const actionsRef = createRef<DatePicker.DatePickerActions>();
      const onValidityChange = vi.fn();
      const resolve = createResolve();

      render(
        <DatePicker.Root
          actionsRef={actionsRef}
          presets={[
            {
              id: "unsafe",
              label: "Unsafe",
              textValue: "Unsafe",
              resolve,
            },
          ]}
          presetId="unsafe"
          onValidityChange={onValidityChange}
        >
          <DatePicker.PresetSelect />
        </DatePicker.Root>,
      );

      expect(
        screen.getByRole("combobox", { name: "Date preset" }),
      ).toHaveTextContent("Custom");
      expect(resolve).toHaveBeenCalledOnce();
      expect(resolve).toHaveBeenCalledWith(
        new Date("2026-08-10T12:00:00.000Z"),
      );
      expect(actionsRef.current?.validate()).toBe(true);
      expect(onValidityChange).toHaveBeenLastCalledWith(true);
    },
  );

  it.each(UNRESOLVABLE_PRESET_CASES)(
    "normalizes an initially $resolution default preset identity to Custom",
    ({ createResolve }) => {
      const actionsRef = createRef<DatePicker.DatePickerActions>();
      const onPresetIdChange = vi.fn();
      const onValidityChange = vi.fn();
      const resolve = createResolve();

      render(
        <DatePicker.Root
          actionsRef={actionsRef}
          presets={[
            {
              id: "unsafe",
              label: "Unsafe",
              textValue: "Unsafe",
              resolve,
            },
          ]}
          defaultPresetId="unsafe"
          onPresetIdChange={onPresetIdChange}
          onValidityChange={onValidityChange}
        >
          <DatePicker.PresetSelect />
        </DatePicker.Root>,
      );

      expect(
        screen.getByRole("combobox", { name: "Date preset" }),
      ).toHaveTextContent("Custom");
      expect(resolve).toHaveBeenCalledOnce();
      expect(onPresetIdChange).not.toHaveBeenCalled();
      expect(actionsRef.current?.validate()).toBe(true);
      expect(onValidityChange).toHaveBeenLastCalledWith(true);
    },
  );

  it.each(UNRESOLVABLE_PRESET_CASES)(
    "clears an uncontrolled preset identity when its resolver becomes $resolution",
    ({ createResolve }) => {
      const actionsRef = createRef<DatePicker.DatePickerActions>();
      const onPresetIdChange = vi.fn();
      const onValidityChange = vi.fn();
      const resolve = createResolve();
      const { rerender } = render(
        <DatePicker.Root
          actionsRef={actionsRef}
          presets={PRESETS}
          defaultPresetId="today"
          onPresetIdChange={onPresetIdChange}
          onValidityChange={onValidityChange}
        >
          <DatePicker.PresetSelect />
        </DatePicker.Root>,
      );

      expect(
        screen.getByRole("combobox", { name: "Date preset" }),
      ).toHaveTextContent("Today");

      rerender(
        <DatePicker.Root
          actionsRef={actionsRef}
          presets={[
            {
              id: "today",
              label: "Today",
              textValue: "Today",
              resolve,
            },
          ]}
          defaultPresetId="today"
          onPresetIdChange={onPresetIdChange}
          onValidityChange={onValidityChange}
        >
          <DatePicker.PresetSelect />
        </DatePicker.Root>,
      );

      expect(
        screen.getByRole("combobox", { name: "Date preset" }),
      ).toHaveTextContent("Custom");
      expect(resolve).toHaveBeenCalledOnce();
      expect(onPresetIdChange).toHaveBeenCalledOnce();
      expect(onPresetIdChange).toHaveBeenCalledWith(null);
      expect(actionsRef.current?.validate()).toBe(true);
      expect(onValidityChange).toHaveBeenLastCalledWith(true);
    },
  );

  it("clears preset identity when a date is edited manually", () => {
    const onPresetIdChange = vi.fn();

    function Harness() {
      const [value, setValue] = useState<Date | null>(
        new Date("2026-07-31T00:00:00.000Z"),
      );
      const [presetId, setPresetId] = useState<string | null>("today");
      return (
        <DatePicker.Root
          presets={PRESETS}
          presetId={presetId}
          onPresetIdChange={(nextId) => {
            onPresetIdChange(nextId);
            setPresetId(nextId);
          }}
          value={value}
          onValueChange={(nextValue) => setValue(nextValue as Date)}
          defaultMonth={new Date("2026-07-01T00:00:00.000Z")}
          timeZone="UTC"
        >
          <DatePicker.PresetSelect />
          <DatePicker.Header />
        </DatePicker.Root>
      );
    }

    render(<Harness />);
    const dateInput = screen.getByRole("textbox", { name: "Date" });
    fireEvent.focus(dateInput);
    fireEvent.change(dateInput, { target: { value: "07/30/2026" } });
    fireEvent.blur(dateInput);

    expect(onPresetIdChange).toHaveBeenCalledWith(null);
    expect(
      screen.getByRole("combobox", { name: "Date preset" }),
    ).toHaveTextContent("Custom");
  });

  it("rejects an unavailable preset without partially changing state", () => {
    const onValueChange = vi.fn();
    const onModeChange = vi.fn();
    const onGranularityChange = vi.fn();
    const onPresetIdChange = vi.fn();
    const onValidityChange = vi.fn();
    const unavailablePreset: DatePickerPreset = {
      id: "future",
      label: "Future",
      textValue: "Future",
      resolve: () => ({
        value: new Date("2026-08-02T00:00:00.000Z"),
        mode: "single",
        granularity: "date",
      }),
    };

    render(
      <DatePicker.Root
        presets={[unavailablePreset]}
        max={new Date("2026-07-31T23:59:59.999Z")}
        onValueChange={onValueChange}
        onModeChange={onModeChange}
        onGranularityChange={onGranularityChange}
        onPresetIdChange={onPresetIdChange}
        onValidityChange={onValidityChange}
      >
        <DatePicker.PresetSelect />
      </DatePicker.Root>,
    );

    choosePreset("Future");

    const error = screen.getByText("This preset contains unavailable dates");
    const presetSelect = screen.getByRole("combobox", {
      name: "Date preset",
    });
    expect(error.tagName).toBe("DIV");
    expect(error).not.toHaveAttribute("role");
    expect(error.parentElement).toHaveAttribute("data-invalid", "");
    expect(presetSelect).toHaveAttribute("aria-describedby", error.id);
    expect(
      screen.getAllByText("This preset contains unavailable dates"),
    ).toHaveLength(1);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onModeChange).not.toHaveBeenCalled();
    expect(onGranularityChange).not.toHaveBeenCalled();
    expect(onPresetIdChange).not.toHaveBeenCalled();
    expect(onValidityChange).toHaveBeenLastCalledWith(false);
  });

  it("reports unavailable when a preset resolver throws", () => {
    const onValueChange = vi.fn();
    const onPresetIdChange = vi.fn();
    const preset: DatePickerPreset = {
      id: "unsafe",
      label: "Unsafe",
      textValue: "Unsafe",
      resolve: () => {
        throw new Error("resolver failed");
      },
    };

    render(
      <DatePicker.Root
        presets={[preset]}
        onValueChange={onValueChange}
        onPresetIdChange={onPresetIdChange}
      >
        <DatePicker.PresetSelect />
      </DatePicker.Root>,
    );

    choosePreset("Unsafe");

    expect(
      screen.getByText("This preset contains unavailable dates"),
    ).toBeInTheDocument();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onPresetIdChange).not.toHaveBeenCalled();
  });

  it("clears a failed preset attempt only for semantic controlled selection changes", () => {
    const throwingPreset: DatePickerPreset = {
      id: "unsafe",
      label: "Unsafe",
      textValue: "Unsafe",
      resolve: () => {
        throw new Error("resolver failed");
      },
    };

    function Harness() {
      const [renderCount, setRenderCount] = useState(0);
      const [value, setValue] = useState<DateRange>({
        start: new Date("2026-07-01T00:00:00.000Z"),
        end: new Date("2026-07-02T00:00:00.000Z"),
      });
      const [rangeDraft, setRangeDraft] = useState<DateRangeDraft | null>(null);
      const [presetId, setPresetId] = useState<string | null | undefined>(
        undefined,
      );
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setRenderCount((count) => count + 1);
              setValue({
                start: new Date("2026-07-01T00:00:00.000Z"),
                end: new Date("2026-07-02T00:00:00.000Z"),
              });
            }}
          >
            Rerender equal {renderCount}
          </button>
          <button
            type="button"
            onClick={() =>
              setValue({
                start: new Date("2026-07-03T00:00:00.000Z"),
                end: new Date("2026-07-04T00:00:00.000Z"),
              })
            }
          >
            Change value
          </button>
          <button
            type="button"
            onClick={() =>
              setValue({
                start: new Date("2026-07-01T00:00:00.000Z"),
                end: new Date("2026-07-02T00:00:00.000Z"),
              })
            }
          >
            Restore value
          </button>
          <button
            type="button"
            onClick={() =>
              setRangeDraft({
                start: new Date("2026-07-05T00:00:00.000Z"),
                end: null,
              })
            }
          >
            Change draft
          </button>
          <button type="button" onClick={() => setPresetId("external")}>
            Change preset identity
          </button>
          <button type="button" onClick={() => setPresetId(null)}>
            Control preset identity
          </button>
          <DatePicker.Root
            mode="range"
            presets={[throwingPreset]}
            value={value}
            rangeDraft={rangeDraft}
            presetId={presetId}
          >
            <DatePicker.PresetSelect />
          </DatePicker.Root>
        </>
      );
    }

    render(<Harness />);
    choosePreset("Unsafe");
    expect(
      screen.getByText("This preset contains unavailable dates"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Rerender equal 0" }));
    expect(
      screen.getByText("This preset contains unavailable dates"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Change value" }));
    expect(
      screen.queryByText("This preset contains unavailable dates"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Restore value" }));
    expect(
      screen.queryByText("This preset contains unavailable dates"),
    ).not.toBeInTheDocument();

    choosePreset("Unsafe");
    fireEvent.click(screen.getByRole("button", { name: "Change draft" }));
    expect(
      screen.queryByText("This preset contains unavailable dates"),
    ).not.toBeInTheDocument();

    choosePreset("Unsafe");
    fireEvent.click(
      screen.getByRole("button", { name: "Control preset identity" }),
    );
    expect(
      screen.queryByText("This preset contains unavailable dates"),
    ).not.toBeInTheDocument();

    choosePreset("Unsafe");
    fireEvent.click(
      screen.getByRole("button", { name: "Change preset identity" }),
    );
    expect(
      screen.queryByText("This preset contains unavailable dates"),
    ).not.toBeInTheDocument();
  });

  it("makes a failed attempt inactive before layout effects observe a controlled change", () => {
    const throwingPreset: DatePickerPreset = {
      id: "unsafe",
      label: "Unsafe",
      textValue: "Unsafe",
      resolve: () => {
        throw new Error("resolver failed");
      },
    };
    const actionsRef = createRef<DatePicker.DatePickerActions>();
    const layoutValidationResults: boolean[] = [];
    const initialValue = new Date("2026-07-01T00:00:00.000Z");
    const changedValue = new Date("2026-07-02T00:00:00.000Z");

    function Harness() {
      const [value, setValue] = useState(initialValue);
      useLayoutEffect(() => {
        if (value.getTime() === changedValue.getTime()) {
          layoutValidationResults.push(actionsRef.current?.validate() ?? false);
        }
      }, [value]);
      return (
        <>
          <button type="button" onClick={() => setValue(changedValue)}>
            Change value
          </button>
          <DatePicker.Root
            actionsRef={actionsRef}
            presets={[throwingPreset]}
            value={value}
          >
            <DatePicker.PresetSelect />
          </DatePicker.Root>
        </>
      );
    }

    render(<Harness />);
    choosePreset("Unsafe");
    expect(actionsRef.current?.validate()).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Change value" }));

    expect(layoutValidationResults).toEqual([true]);
    expect(
      screen.queryByText("This preset contains unavailable dates"),
    ).not.toBeInTheDocument();
  });

  it("uses the standard field error for invalid typed dates", () => {
    render(
      <DatePicker.Root
        defaultValue={new Date("2026-07-30T00:00:00.000Z")}
        timeZone="UTC"
      >
        <DatePicker.Header />
      </DatePicker.Root>,
    );

    const dateInput = screen.getByRole("textbox", { name: "Date" });
    fireEvent.change(dateInput, { target: { value: "02/31/2026" } });
    fireEvent.blur(dateInput);

    const error = screen.getByText("Enter a valid date");
    expect(error.tagName).toBe("DIV");
    expect(error).not.toHaveAttribute("role");
    expect(error.parentElement).toHaveAttribute("data-invalid", "");
    expect(dateInput).toHaveAttribute("aria-describedby", error.id);
    expect(screen.getAllByText("Enter a valid date")).toHaveLength(1);
  });

  it("replaces an invalid typed draft when a preset changes the value", () => {
    function Harness() {
      const [value, setValue] = useState<Date | DateRange | null>(
        new Date("2026-07-30T00:00:00.000Z"),
      );
      const [mode, setMode] = useState<DatePicker.DatePickerMode>("single");
      return (
        <DatePicker.Root
          mode={mode}
          onModeChange={setMode}
          value={value}
          onValueChange={setValue}
          presets={PRESETS}
          timeZone="UTC"
        >
          <DatePicker.PresetSelect />
          <DatePicker.Header />
        </DatePicker.Root>
      );
    }

    render(<Harness />);
    const dateInput = screen.getByRole("textbox", { name: "Date" });
    fireEvent.change(dateInput, { target: { value: "02/31/2026" } });
    fireEvent.blur(dateInput);
    expect(dateInput).toHaveAttribute("aria-invalid", "true");

    choosePreset("Today");

    expect(screen.getByRole("textbox", { name: "Date" })).not.toHaveAttribute(
      "aria-invalid",
    );
    expect(screen.queryByText("Enter a valid date")).not.toBeInTheDocument();
  });

  it("replaces an invalid typed draft when the calendar changes the value", () => {
    function Harness() {
      const [value, setValue] = useState<Date | null>(
        new Date("2026-07-30T00:00:00.000Z"),
      );
      return (
        <DatePicker.Root
          value={value}
          onValueChange={(nextValue) => setValue(nextValue as Date)}
          defaultMonth={new Date("2026-07-01T00:00:00.000Z")}
          timeZone="UTC"
        >
          <DatePicker.Header />
          <DatePicker.Grid />
        </DatePicker.Root>
      );
    }

    render(<Harness />);
    const dateInput = screen.getByRole("textbox", { name: "Date" });
    fireEvent.change(dateInput, { target: { value: "02/31/2026" } });
    fireEvent.blur(dateInput);
    expect(dateInput).toHaveAttribute("aria-invalid", "true");

    fireEvent.click(
      screen.getByRole("button", { name: "Wednesday, July 29, 2026" }),
    );

    expect(dateInput).toHaveValue("07/29/2026");
    expect(dateInput).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByText("Enter a valid date")).not.toBeInTheDocument();
  });
});

describe("DatePicker mode and granularity configuration", () => {
  it("shows UTC as a decorative suffix without changing the time value", () => {
    render(
      <DatePicker.Root granularity="date-time" timeZone="UTC">
        <DatePicker.Header />
      </DatePicker.Root>,
    );

    const input = screen.getByRole("textbox", { name: "Time (UTC)" });
    const suffix = screen.getByText("UTC");
    expect(suffix).toHaveAttribute("aria-hidden", "true");

    fireEvent.change(input, { target: { value: "12:30 PM" } });
    expect(input).toHaveValue("12:30 PM");
    expect(screen.queryByText("Times shown in UTC")).not.toBeInTheDocument();
  });

  it("omits UTC suffixes from date-only and local-time compositions", () => {
    const { rerender } = render(
      <DatePicker.Root granularity="date" timeZone="UTC">
        <DatePicker.Header />
      </DatePicker.Root>,
    );
    expect(screen.queryByText("UTC")).not.toBeInTheDocument();

    rerender(
      <DatePicker.Root granularity="date-time" timeZone="local">
        <DatePicker.Header />
      </DatePicker.Root>,
    );
    expect(screen.queryByText("UTC")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Time" })).toBeInTheDocument();
  });

  it("keeps includeTime as a date-time compatibility alias", () => {
    render(
      <DatePicker.Root includeTime>
        <DatePicker.Header />
      </DatePicker.Root>,
    );

    expect(screen.getByRole("textbox", { name: "Date" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Time" })).toHaveValue("");
  });

  it("supports uncontrolled mode and granularity without seeding values", () => {
    render(
      <DatePicker.Root defaultMode="range" defaultGranularity="date-time">
        <DatePicker.Header />
      </DatePicker.Root>,
    );

    expect(screen.getByRole("textbox", { name: "Start date" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "End date" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Start time" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "End time" })).toHaveValue("");
  });

  it("preserves ambient current time for the legacy includeTime path", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-31T17:34:45.000Z"));
    const onValueChange = vi.fn();
    render(
      <DatePicker.Root
        includeTime
        timeZone="UTC"
        defaultMonth={new Date("2026-02-01T00:00:00.000Z")}
        onValueChange={onValueChange}
      >
        <DatePicker.Grid />
      </DatePicker.Root>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Wednesday, February 11, 2026" }),
    );

    expect(onValueChange).toHaveBeenCalledWith(
      new Date("2026-02-11T17:34:00.000Z"),
    );
  });

  it("uses exact midnight when selecting the first date-time date", () => {
    const onValueChange = vi.fn();
    render(
      <DatePicker.Root
        granularity="date-time"
        timeZone="UTC"
        defaultMonth={new Date("2026-02-01T00:00:00.000Z")}
        onValueChange={onValueChange}
      >
        <DatePicker.Grid />
      </DatePicker.Root>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Wednesday, February 11, 2026" }),
    );

    expect(onValueChange).toHaveBeenCalledWith(
      new Date("2026-02-11T00:00:00.000Z"),
    );
  });
});

describe("DatePicker controlled partial preview", () => {
  function ControlledPartial({
    onRangeDraftChange = () => undefined,
  }: {
    onRangeDraftChange?: (draft: DateRangeDraft) => void;
  }) {
    return (
      <DatePicker.Root
        mode="range"
        rangeDraft={{
          start: new Date("2026-02-11T00:00:00.000Z"),
          end: null,
        }}
        onRangeDraftChange={onRangeDraftChange}
        defaultMonth={new Date("2026-02-01T00:00:00.000Z")}
        timeZone="UTC"
      >
        <DatePicker.Grid />
      </DatePicker.Root>
    );
  }

  function ControlledEndPartial({
    onRangeDraftChange = () => undefined,
  }: {
    onRangeDraftChange?: (draft: DateRangeDraft) => void;
  }) {
    return (
      <DatePicker.Root
        mode="range"
        rangeDraft={{
          start: null,
          end: new Date("2026-02-15T00:00:00.000Z"),
        }}
        onRangeDraftChange={onRangeDraftChange}
        defaultMonth={new Date("2026-02-01T00:00:00.000Z")}
        timeZone="UTC"
      >
        <DatePicker.Grid />
      </DatePicker.Root>
    );
  }

  it("previews a controlled partial range with the pointer", () => {
    render(<ControlledPartial />);

    fireEvent.mouseEnter(
      screen.getByRole("button", { name: "Sunday, February 15, 2026" }),
    );

    expect(
      screen.getByRole("button", { name: "Thursday, February 12, 2026" }),
    ).toHaveAttribute("data-in-range");
    expect(
      screen.getByRole("button", { name: "Wednesday, February 11, 2026" }),
    ).toHaveAttribute("data-range-start");
    expect(
      screen.getByRole("button", { name: "Sunday, February 15, 2026" }),
    ).toHaveAttribute("data-range-end");
  });

  it.each(["Enter", " "])(
    "previews and selects the keyboard endpoint with %s",
    (key) => {
      const onRangeDraftChange = vi.fn();
      render(<ControlledPartial onRangeDraftChange={onRangeDraftChange} />);
      const start = screen.getByRole("button", {
        name: "Wednesday, February 11, 2026",
      });
      start.focus();

      fireEvent.keyDown(start, { key: "ArrowRight" });
      expect(
        screen.getByRole("button", { name: "Thursday, February 12, 2026" }),
      ).toHaveAttribute("data-range-end");

      fireEvent.keyDown(document.activeElement!, { key });
      expect(onRangeDraftChange).toHaveBeenCalledWith({
        start: new Date("2026-02-11T00:00:00.000Z"),
        end: new Date("2026-02-12T00:00:00.000Z"),
      } satisfies DateRange);
    },
  );

  it("previews an end-only controlled draft with the pointer", () => {
    render(<ControlledEndPartial />);

    fireEvent.mouseEnter(
      screen.getByRole("button", { name: "Wednesday, February 11, 2026" }),
    );

    expect(
      screen.getByRole("button", { name: "Thursday, February 12, 2026" }),
    ).toHaveAttribute("data-in-range");
    expect(
      screen.getByRole("button", { name: "Wednesday, February 11, 2026" }),
    ).toHaveAttribute("data-range-start");
    expect(
      screen.getByRole("button", { name: "Sunday, February 15, 2026" }),
    ).toHaveAttribute("data-range-end");
  });

  it.each(["Enter", " "])(
    "orders an end-only controlled draft selected with %s",
    (key) => {
      const onRangeDraftChange = vi.fn();
      render(<ControlledEndPartial onRangeDraftChange={onRangeDraftChange} />);
      const end = screen.getByRole("button", {
        name: "Sunday, February 15, 2026",
      });
      end.focus();

      fireEvent.keyDown(end, { key: "ArrowLeft" });
      expect(
        screen.getByRole("button", { name: "Saturday, February 14, 2026" }),
      ).toHaveAttribute("data-range-start");

      fireEvent.keyDown(document.activeElement!, { key });
      expect(onRangeDraftChange).toHaveBeenCalledWith({
        start: new Date("2026-02-14T00:00:00.000Z"),
        end: new Date("2026-02-15T00:00:00.000Z"),
      } satisfies DateRange);
    },
  );
});
