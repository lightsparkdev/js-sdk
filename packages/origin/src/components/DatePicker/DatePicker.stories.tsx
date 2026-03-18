import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import * as DatePicker from "./index";
import type { DateRange, DayCellState } from "./index";
import { Switch } from "../Switch";
import { Button } from "../Button";

function SingleCalendar() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <DatePicker.Root value={value} onValueChange={(v) => setValue(v as Date)}>
      <DatePicker.Header />
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <DatePicker.Footer>
        <Button variant="outline" size="compact" style={{ width: "100%" }}>
          Apply
        </Button>
      </DatePicker.Footer>
    </DatePicker.Root>
  );
}

function RangeCalendar() {
  const [mode, setMode] = useState<"single" | "range">("range");
  const [includeTime, setIncludeTime] = useState(false);
  const [value, setValue] = useState<Date | DateRange | null>(null);

  return (
    <DatePicker.Root
      mode={mode}
      includeTime={includeTime}
      value={value}
      onValueChange={setValue}
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
          />
        </DatePicker.ControlItem>
        <DatePicker.ControlItem label="Include time">
          <Switch
            size="sm"
            checked={includeTime}
            onCheckedChange={setIncludeTime}
          />
        </DatePicker.ControlItem>
      </DatePicker.Controls>
      <DatePicker.Footer>
        <Button variant="outline" size="compact" style={{ width: "100%" }}>
          Apply
        </Button>
      </DatePicker.Footer>
    </DatePicker.Root>
  );
}

function WithTimeCalendar() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      includeTime
    >
      <DatePicker.Header />
      <DatePicker.Navigation />
      <DatePicker.Grid />
    </DatePicker.Root>
  );
}

function RangeWithTimeCalendar() {
  const [value, setValue] = useState<DateRange | null>(null);
  return (
    <DatePicker.Root
      mode="range"
      includeTime
      value={value}
      onValueChange={(v) => setValue(v as DateRange)}
    >
      <DatePicker.Header />
      <DatePicker.Navigation />
      <DatePicker.Grid />
    </DatePicker.Root>
  );
}

function ConstrainedCalendar() {
  const [value, setValue] = useState<Date | null>(null);
  const today = new Date();
  const max = new Date(today);
  max.setMonth(max.getMonth() + 3);

  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      min={today}
      max={max}
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
    </DatePicker.Root>
  );
}

function WeekdaysOnlyCalendar() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      disabled={(date) => date.getDay() === 0 || date.getDay() === 6}
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
    </DatePicker.Root>
  );
}

function MondayStartCalendar() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      weekStartsOn={1}
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
    </DatePicker.Root>
  );
}

const meta: Meta = {
  title: "Components/DatePicker",
  parameters: { layout: "centered" },
};

export default meta;

type Story = StoryObj;

export const Single: Story = {
  render: () => <SingleCalendar />,
};

export const Range: Story = {
  render: () => <RangeCalendar />,
};

export const WithTime: Story = {
  render: () => <WithTimeCalendar />,
};

export const RangeWithTime: Story = {
  render: () => <RangeWithTimeCalendar />,
};

export const Constrained: Story = {
  render: () => <ConstrainedCalendar />,
};

export const WeekdaysOnly: Story = {
  render: () => <WeekdaysOnlyCalendar />,
};

export const MondayStart: Story = {
  render: () => <MondayStartCalendar />,
};

function GermanCalendar() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      locale="de-DE"
      weekStartsOn={1}
      labels={{
        previousMonth: "Vorheriger Monat",
        nextMonth: "Nächster Monat",
        date: "Datum",
      }}
    >
      <DatePicker.Header />
      <DatePicker.Navigation />
      <DatePicker.Grid />
    </DatePicker.Root>
  );
}

export const LocaleGerman: Story = {
  render: () => <GermanCalendar />,
};

function JapaneseCalendar() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <DatePicker.Root
      value={value}
      onValueChange={(v) => setValue(v as Date)}
      locale="ja-JP"
    >
      <DatePicker.Header />
      <DatePicker.Navigation />
      <DatePicker.Grid />
    </DatePicker.Root>
  );
}

export const LocaleJapanese: Story = {
  render: () => <JapaneseCalendar />,
};

function EventDotsCalendar() {
  const [value, setValue] = useState<Date | null>(null);
  const eventDays = new Set([3, 7, 14, 21, 28]);

  return (
    <DatePicker.Root value={value} onValueChange={(v) => setValue(v as Date)}>
      <DatePicker.Navigation />
      <DatePicker.Grid
        renderDay={(date: Date, state: DayCellState) => (
          <span style={{ position: "relative" }}>
            {date.getDate()}
            {!state.isOutsideMonth && eventDays.has(date.getDate()) && (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  bottom: -2,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  backgroundColor: "var(--color-accent)",
                }}
              />
            )}
          </span>
        )}
      />
    </DatePicker.Root>
  );
}

export const EventDots: Story = {
  render: () => <EventDotsCalendar />,
};
