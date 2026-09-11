import { useState } from "react";
import * as DatePicker from "./index";
import type {
  DatePickerGranularity,
  DatePickerMode,
  DatePickerPreset,
  DateRange,
  DateRangeDraft,
  DayCellState,
} from "./index";
import { Switch } from "../Switch";
import { Button } from "../Button";
import { Form } from "../Form";

function localDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function TestDefault() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      defaultMonth={new Date(2026, 1, 1)}
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <div data-testid="selected">
        {value ? value.toISOString().split("T")[0] : "none"}
      </div>
    </DatePicker.Root>
  );
}

export function TestWithValue() {
  const [value, setValue] = useState<Date | null>(new Date(2026, 1, 15));
  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      defaultMonth={new Date(2026, 1, 1)}
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <div data-testid="selected">
        {value ? value.toISOString().split("T")[0] : "none"}
      </div>
    </DatePicker.Root>
  );
}

export function TestRange() {
  const [value, setValue] = useState<DateRange | null>(null);
  return (
    <DatePicker.Root
      mode="range"
      value={value}
      onValueChange={(v) => setValue(v as DateRange)}
      defaultMonth={new Date(2026, 1, 1)}
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <div data-testid="range-start">
        {value ? value.start.toISOString().split("T")[0] : "none"}
      </div>
      <div data-testid="range-end">
        {value ? value.end.toISOString().split("T")[0] : "none"}
      </div>
    </DatePicker.Root>
  );
}

export function TestRangeWithValue() {
  const [value, setValue] = useState<DateRange | null>({
    start: new Date(2026, 1, 11),
    end: new Date(2026, 1, 15),
  });
  return (
    <DatePicker.Root
      mode="range"
      value={value}
      onValueChange={(v) => setValue(v as DateRange)}
      defaultMonth={new Date(2026, 1, 1)}
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
    </DatePicker.Root>
  );
}

export function TestDisabled() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      defaultMonth={new Date(2026, 1, 1)}
      disabled={(date) => date.getDay() === 0 || date.getDay() === 6}
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <div data-testid="selected">
        {value ? value.toISOString().split("T")[0] : "none"}
      </div>
    </DatePicker.Root>
  );
}

export function TestMinMax() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      defaultMonth={new Date(2026, 1, 1)}
      min={new Date(2026, 1, 5)}
      max={new Date(2026, 1, 25)}
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <div data-testid="selected">
        {value ? value.toISOString().split("T")[0] : "none"}
      </div>
    </DatePicker.Root>
  );
}

export function TestFullFeatured() {
  const [mode, setMode] = useState<"single" | "range">("range");
  const [includeTime, setIncludeTime] = useState(false);
  const [value, setValue] = useState<Date | DateRange | null>(null);
  const [applied, setApplied] = useState(false);

  const rangeValue = value && !(value instanceof Date) ? value : null;

  return (
    <DatePicker.Root
      mode={mode}
      includeTime={includeTime}
      value={value}
      onValueChange={setValue}
      defaultMonth={new Date(2026, 1, 1)}
    >
      <DatePicker.Header />
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <DatePicker.Controls>
        <DatePicker.ControlItem label="End date">
          <Switch
            size="sm"
            checked={mode === "range"}
            onCheckedChange={(v) => {
              setMode(v ? "range" : "single");
              setValue(null);
            }}
            data-testid="end-date-toggle"
          />
        </DatePicker.ControlItem>
        <DatePicker.ControlItem label="Include time">
          <Switch
            size="sm"
            checked={includeTime}
            onCheckedChange={setIncludeTime}
            data-testid="include-time-toggle"
          />
        </DatePicker.ControlItem>
      </DatePicker.Controls>
      <DatePicker.Footer>
        <Button
          variant="outline"
          size="compact"
          onClick={() => setApplied(true)}
          data-testid="apply-btn"
          style={{ width: "100%" }}
        >
          Apply
        </Button>
      </DatePicker.Footer>
      <div data-testid="applied">{applied ? "yes" : "no"}</div>
      <div data-testid="range-start">
        {rangeValue ? rangeValue.start.toISOString().split("T")[0] : "none"}
      </div>
      <div data-testid="range-end">
        {rangeValue ? rangeValue.end.toISOString().split("T")[0] : "none"}
      </div>
    </DatePicker.Root>
  );
}

const TEST_PRESETS = [
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
    id: "long-window",
    label: "Previous 24 hours with a deliberately long label",
    textValue: "Previous 24 hours with a deliberately long label",
    resolve: (now) => ({
      value: {
        start: new Date(now.getTime() - 86_400_000),
        end: new Date(now),
      },
      mode: "range",
      granularity: "date-time",
    }),
  },
  {
    id: "unavailable",
    label: "Unavailable period",
    textValue: "Unavailable period",
    disabled: true,
    disabledReason: "Requires historical data access",
    resolve: (now) => ({
      value: new Date(now),
      mode: "single",
      granularity: "date",
    }),
  },
  {
    id: "upcoming",
    label: "Upcoming period",
    textValue: "Upcoming period",
    resolve: (now) => ({
      value: new Date(now.getTime() + 86_400_000),
      mode: "single",
      granularity: "date",
    }),
  },
] as const satisfies readonly DatePickerPreset[];

export function TestPresets() {
  const [mode, setMode] = useState<DatePickerMode>("range");
  const [granularity, setGranularity] =
    useState<DatePickerGranularity>("date-time");
  const [presetId, setPresetId] = useState<string | null>(null);
  const [value, setValue] = useState<Date | DateRange | null>(null);
  const [rangeDraft, setRangeDraft] = useState<DateRangeDraft>({
    start: null,
    end: null,
  });

  return (
    <DatePicker.Root
      mode={mode}
      onModeChange={setMode}
      granularity={granularity}
      onGranularityChange={setGranularity}
      presets={TEST_PRESETS}
      presetId={presetId}
      onPresetIdChange={setPresetId}
      value={value}
      onValueChange={(nextValue) => {
        setValue(nextValue);
        if (!(nextValue instanceof Date)) {
          setRangeDraft(nextValue);
        }
      }}
      {...(mode === "range"
        ? { rangeDraft, onRangeDraftChange: setRangeDraft }
        : {})}
      defaultMonth={new Date(2026, 6, 1)}
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <DatePicker.PresetSelect />
      <DatePicker.Header />
      <div data-testid="preset-id">{presetId ?? "custom"}</div>
      <div data-testid="mode">{mode}</div>
      <div data-testid="granularity">{granularity}</div>
    </DatePicker.Root>
  );
}

export function TestRangeDateLayout() {
  return (
    <DatePicker.Root mode="range" granularity="date">
      <DatePicker.Header />
    </DatePicker.Root>
  );
}

export function TestSingleDateLayout() {
  return (
    <DatePicker.Root mode="single" granularity="date">
      <DatePicker.Header />
    </DatePicker.Root>
  );
}

const COMPACT_UTC_PRESETS = [
  {
    id: "previous-24-hours",
    label: "Previous 24 hours",
    textValue: "Previous 24 hours",
    resolve: (now: Date) => ({
      value: {
        start: new Date(now.getTime() - 86_400_000),
        end: new Date(now),
      },
      mode: "range" as const,
      granularity: "date-time" as const,
    }),
  },
];

export function TestCompactUtcPresetLayout() {
  const [presetId, setPresetId] = useState<string | null>(null);
  const [rangeDraft, setRangeDraft] = useState<DateRangeDraft>({
    start: new Date("2026-07-29T09:00:00.000Z"),
    end: new Date("2026-07-30T17:00:00.000Z"),
  });

  return (
    <DatePicker.Root
      mode="range"
      granularity="date-time"
      presets={COMPACT_UTC_PRESETS}
      presetId={presetId}
      onPresetIdChange={setPresetId}
      rangeDraft={rangeDraft}
      onRangeDraftChange={setRangeDraft}
      defaultMonth={new Date("2026-07-01T00:00:00.000Z")}
      timeZone="UTC"
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <DatePicker.PresetSelect />
      <DatePicker.Header />
      <DatePicker.Footer>
        <Button variant="outline" size="compact" style={{ width: "100%" }}>
          Apply
        </Button>
      </DatePicker.Footer>
    </DatePicker.Root>
  );
}

export function TestNativeFormValidation() {
  const [submitCount, setSubmitCount] = useState(0);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitCount((count) => count + 1);
      }}
    >
      <DatePicker.Root>
        <DatePicker.Header />
      </DatePicker.Root>
      <Button type="submit">Submit</Button>
      <div data-testid="submit-count">{submitCount}</div>
    </form>
  );
}

export function TestOriginFormValidation() {
  const [submitCount, setSubmitCount] = useState(0);
  return (
    <Form onFormSubmit={() => setSubmitCount((count) => count + 1)}>
      <DatePicker.Root mode="range">
        <DatePicker.Header />
      </DatePicker.Root>
      <Button type="submit">Submit</Button>
      <div data-testid="submit-count">{submitCount}</div>
    </Form>
  );
}

export function TestWithTime() {
  const [value, setValue] = useState<Date | null>(
    new Date(2026, 1, 11, 14, 30),
  );
  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      defaultMonth={new Date(2026, 1, 1)}
      includeTime
    >
      <DatePicker.Header />
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <div data-testid="selected-iso">
        {value ? value.toISOString() : "none"}
      </div>
      <div data-testid="selected-hours">{value ? value.getHours() : ""}</div>
      <div data-testid="selected-minutes">
        {value ? value.getMinutes() : ""}
      </div>
    </DatePicker.Root>
  );
}

export function TestModeSwitch() {
  const [mode, setMode] = useState<"single" | "range">("range");
  const [value, setValue] = useState<Date | DateRange | null>(null);
  return (
    <DatePicker.Root
      mode={mode}
      value={value}
      onValueChange={setValue}
      defaultMonth={new Date(2026, 1, 1)}
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <button
        data-testid="toggle-mode"
        onClick={() => {
          setMode((m) => (m === "range" ? "single" : "range"));
          setValue(null);
        }}
      >
        Toggle
      </button>
      <div data-testid="mode">{mode}</div>
      <div data-testid="selected">
        {value instanceof Date
          ? value.toISOString().split("T")[0]
          : value && !(value instanceof Date)
          ? `${value.start.toISOString().split("T")[0]}|${
              value.end.toISOString().split("T")[0]
            }`
          : "none"}
      </div>
    </DatePicker.Root>
  );
}

export function TestReverseRange() {
  const [value, setValue] = useState<DateRange | null>(null);
  return (
    <DatePicker.Root
      mode="range"
      value={value}
      onValueChange={(v) => setValue(v as DateRange)}
      defaultMonth={new Date(2026, 1, 1)}
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <div data-testid="range-start">
        {value ? value.start.toISOString().split("T")[0] : "none"}
      </div>
      <div data-testid="range-end">
        {value ? value.end.toISOString().split("T")[0] : "none"}
      </div>
    </DatePicker.Root>
  );
}

export function TestSameDayRange() {
  const [value, setValue] = useState<DateRange | null>(null);
  return (
    <DatePicker.Root
      mode="range"
      value={value}
      onValueChange={(v) => setValue(v as DateRange)}
      defaultMonth={new Date(2026, 1, 1)}
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <div data-testid="range-start">
        {value ? value.start.toISOString().split("T")[0] : "none"}
      </div>
      <div data-testid="range-end">
        {value ? value.end.toISOString().split("T")[0] : "none"}
      </div>
    </DatePicker.Root>
  );
}

export function TestDateInput() {
  const [value, setValue] = useState<Date | null>(new Date(2026, 1, 11));
  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      defaultMonth={new Date(2026, 1, 1)}
    >
      <DatePicker.Header />
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <div data-testid="selected">
        {value ? value.toISOString().split("T")[0] : "none"}
      </div>
    </DatePicker.Root>
  );
}

export function TestRangeWithTime() {
  const [value, setValue] = useState<DateRange | null>({
    start: new Date(2026, 1, 11, 9, 0),
    end: new Date(2026, 1, 15, 17, 30),
  });
  return (
    <DatePicker.Root
      mode="range"
      includeTime
      value={value}
      onValueChange={(v) => setValue(v as DateRange)}
      defaultMonth={new Date(2026, 1, 1)}
    >
      <DatePicker.Header />
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <div data-testid="start-hours">{value ? value.start.getHours() : ""}</div>
      <div data-testid="start-minutes">
        {value ? value.start.getMinutes() : ""}
      </div>
      <div data-testid="end-hours">{value ? value.end.getHours() : ""}</div>
      <div data-testid="end-minutes">{value ? value.end.getMinutes() : ""}</div>
      <div data-testid="range-start">
        {value ? value.start.toISOString().split("T")[0] : "none"}
      </div>
      <div data-testid="range-end">
        {value ? value.end.toISOString().split("T")[0] : "none"}
      </div>
    </DatePicker.Root>
  );
}

export function TestEmptyRangeWithTime() {
  const [value, setValue] = useState<DateRange | null>(null);
  const [changeCount, setChangeCount] = useState(0);

  return (
    <DatePicker.Root
      mode="range"
      includeTime
      value={value}
      onValueChange={(nextValue) => {
        setValue(nextValue as DateRange);
        setChangeCount((count) => count + 1);
      }}
      onRangeDraftChange={() => undefined}
      defaultMonth={new Date(2026, 1, 1)}
    >
      <DatePicker.Header />
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <div data-testid="change-count">{changeCount}</div>
      <div data-testid="range-start">
        {value ? value.start.toISOString().split("T")[0] : "none"}
      </div>
      <div data-testid="range-end">
        {value ? value.end.toISOString().split("T")[0] : "none"}
      </div>
    </DatePicker.Root>
  );
}

export function TestCallbackOnlyRangeDraft() {
  const [value, setValue] = useState<DateRange | null>(null);
  const [draftUpdates, setDraftUpdates] = useState<string[]>([]);

  return (
    <DatePicker.Root
      mode="range"
      value={value}
      onValueChange={(nextValue) => setValue(nextValue as DateRange)}
      onRangeDraftChange={(draft) => {
        setDraftUpdates((updates) => [
          ...updates,
          `${draft.start?.toISOString().split("T")[0] ?? "none"}|${
            draft.end?.toISOString().split("T")[0] ?? "none"
          }`,
        ]);
      }}
      defaultMonth={new Date(2026, 1, 1)}
    >
      <DatePicker.Header />
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <div data-testid="draft-updates">{draftUpdates.join(",")}</div>
      <div data-testid="completed-range">
        {value
          ? `${value.start.toISOString().split("T")[0]}|${
              value.end.toISOString().split("T")[0]
            }`
          : "none"}
      </div>
    </DatePicker.Root>
  );
}

export function TestControlledRangeDraft() {
  const [draftUpdate, setDraftUpdate] = useState("none");

  return (
    <DatePicker.Root
      mode="range"
      includeTime
      rangeDraft={{ start: new Date(2026, 1, 11), end: null }}
      onRangeDraftChange={(draft) => {
        setDraftUpdate(
          `${draft.start?.toISOString().split("T")[0] ?? "none"}|${
            draft.end?.toISOString().split("T")[0] ?? "none"
          }`,
        );
      }}
      defaultMonth={new Date(2026, 1, 1)}
    >
      <DatePicker.Header />
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <div data-testid="controlled-draft-update">{draftUpdate}</div>
    </DatePicker.Root>
  );
}

export function TestRejectingControlledRange() {
  const [value] = useState<DateRange>({
    start: new Date(2026, 1, 11),
    end: new Date(2026, 1, 15),
  });
  const [attemptedEnd, setAttemptedEnd] = useState("");

  return (
    <DatePicker.Root
      mode="range"
      value={value}
      onValueChange={(nextValue) => {
        setAttemptedEnd(
          (nextValue as DateRange).end.toISOString().split("T")[0],
        );
      }}
      defaultMonth={new Date(2026, 1, 1)}
    >
      <DatePicker.Header />
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <div data-testid="attempted-end">{attemptedEnd}</div>
    </DatePicker.Root>
  );
}

export function TestFixedControlledRange() {
  const [value] = useState<DateRange>({
    start: new Date(2026, 1, 11),
    end: new Date(2026, 1, 15),
  });

  return (
    <DatePicker.Root
      mode="range"
      value={value}
      defaultMonth={new Date(2026, 1, 1)}
    >
      <DatePicker.Header />
      <DatePicker.Navigation />
      <DatePicker.Grid />
    </DatePicker.Root>
  );
}

export function TestUncontrolledRangeWithTime() {
  const [emittedRange, setEmittedRange] = useState<DateRange | null>(null);

  return (
    <DatePicker.Root
      mode="range"
      includeTime
      onValueChange={(nextValue) => setEmittedRange(nextValue as DateRange)}
      defaultMonth={new Date(2026, 1, 1)}
    >
      <DatePicker.Header />
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <div data-testid="emitted-start">
        {emittedRange ? emittedRange.start.toISOString().split("T")[0] : "none"}
      </div>
      <div data-testid="emitted-end">
        {emittedRange ? emittedRange.end.toISOString().split("T")[0] : "none"}
      </div>
      <div data-testid="emitted-local-start">
        {emittedRange ? localDateKey(emittedRange.start) : "none"}
      </div>
      <div data-testid="today-date">{localDateKey(new Date())}</div>
    </DatePicker.Root>
  );
}

export function TestSameDayRangeWithTime() {
  const [value, setValue] = useState<DateRange | null>({
    start: new Date(2026, 1, 15, 9, 0),
    end: new Date(2026, 1, 15, 17, 30),
  });
  return (
    <DatePicker.Root
      mode="range"
      includeTime
      value={value}
      onValueChange={(v) => setValue(v as DateRange)}
      defaultMonth={new Date(2026, 1, 1)}
    >
      <DatePicker.Header />
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <div data-testid="start-hours">{value ? value.start.getHours() : ""}</div>
      <div data-testid="start-minutes">
        {value ? value.start.getMinutes() : ""}
      </div>
      <div data-testid="end-hours">{value ? value.end.getHours() : ""}</div>
      <div data-testid="end-minutes">{value ? value.end.getMinutes() : ""}</div>
    </DatePicker.Root>
  );
}

export function TestYearBoundary() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      defaultMonth={new Date(2026, 11, 1)}
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <div data-testid="selected">
        {value ? value.toISOString().split("T")[0] : "none"}
      </div>
    </DatePicker.Root>
  );
}

export function TestLeapYear() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      defaultMonth={new Date(2028, 1, 1)}
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <div data-testid="selected">
        {value ? value.toISOString().split("T")[0] : "none"}
      </div>
    </DatePicker.Root>
  );
}

export function TestMondayStart() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      defaultMonth={new Date(2026, 1, 1)}
      weekStartsOn={1}
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
    </DatePicker.Root>
  );
}

export function TestMinEqualsMax() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      defaultMonth={new Date(2026, 1, 1)}
      min={new Date(2026, 1, 15)}
      max={new Date(2026, 1, 15)}
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <div data-testid="selected">
        {value ? value.toISOString().split("T")[0] : "none"}
      </div>
    </DatePicker.Root>
  );
}

export function TestLocaleDE() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      defaultMonth={new Date(2026, 1, 1)}
      locale="de-DE"
      labels={{ date: "Datum", startDate: "Startdatum", endDate: "Enddatum" }}
    >
      <DatePicker.Header />
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <div data-testid="selected">
        {value ? value.toISOString().split("T")[0] : "none"}
      </div>
    </DatePicker.Root>
  );
}

export function TestLocaleJA() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      defaultMonth={new Date(2026, 1, 1)}
      locale="ja-JP"
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
    </DatePicker.Root>
  );
}

export function TestControlledMonth() {
  const [value, setValue] = useState<Date | null>(null);
  const [month, setMonth] = useState(new Date(2026, 1, 1));
  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      month={month}
      onMonthChange={setMonth}
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <button
        data-testid="jump-to-june"
        onClick={() => setMonth(new Date(2026, 5, 1))}
      >
        Jump to June
      </button>
      <div data-testid="view-month">{month.getMonth()}</div>
      <div data-testid="view-year">{month.getFullYear()}</div>
      <div data-testid="selected">
        {value ? value.toISOString().split("T")[0] : "none"}
      </div>
    </DatePicker.Root>
  );
}

export function TestOnMonthChange() {
  const [value, setValue] = useState<Date | null>(null);
  const [monthLog, setMonthLog] = useState<string[]>([]);
  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      defaultMonth={new Date(2026, 1, 1)}
      onMonthChange={(m) => {
        setMonthLog((prev) => [...prev, `${m.getFullYear()}-${m.getMonth()}`]);
      }}
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <div data-testid="month-log">{monthLog.join(",")}</div>
    </DatePicker.Root>
  );
}

export function TestCustomLabels() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      defaultMonth={new Date(2026, 1, 1)}
      labels={{
        previousMonth: "Vorheriger Monat",
        nextMonth: "Nächster Monat",
      }}
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
    </DatePicker.Root>
  );
}

export function TestRenderDay() {
  const [value, setValue] = useState<Date | null>(null);
  const specialDates = [5, 14, 20];
  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      defaultMonth={new Date(2026, 1, 1)}
    >
      <DatePicker.Navigation />
      <DatePicker.Grid
        renderDay={(date: Date, state: DayCellState) => (
          <span>
            {date.getDate()}
            {!state.isOutsideMonth && specialDates.includes(date.getDate()) && (
              <span data-testid={`dot-${date.getDate()}`} aria-hidden="true">
                *
              </span>
            )}
          </span>
        )}
      />
      <div data-testid="selected">
        {value ? value.toISOString().split("T")[0] : "none"}
      </div>
    </DatePicker.Root>
  );
}

export function TestDateInputMinMax() {
  const [value, setValue] = useState<Date | null>(new Date(2026, 1, 11));
  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      defaultMonth={new Date(2026, 1, 1)}
      min={new Date(2026, 1, 5)}
      max={new Date(2026, 1, 25)}
    >
      <DatePicker.Header />
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <div data-testid="selected">
        {value ? value.toISOString().split("T")[0] : "none"}
      </div>
    </DatePicker.Root>
  );
}

export function TestLocaleWithTime() {
  const [value, setValue] = useState<Date | null>(
    new Date(2026, 1, 11, 14, 30),
  );
  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      defaultMonth={new Date(2026, 1, 1)}
      locale="de-DE"
      includeTime
      labels={{ date: "Datum", time: "Uhrzeit" }}
    >
      <DatePicker.Header />
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <div data-testid="selected-hours">{value ? value.getHours() : ""}</div>
      <div data-testid="selected-minutes">
        {value ? value.getMinutes() : ""}
      </div>
    </DatePicker.Root>
  );
}
