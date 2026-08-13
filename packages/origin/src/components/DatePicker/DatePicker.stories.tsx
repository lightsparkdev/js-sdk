import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import * as DatePicker from "./index";
import type {
  DatePickerLabels,
  DatePickerPreset,
  DateRangeDraft,
} from "./index";
import { Button } from "../Button";

function SingleCalendar() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <DatePicker.Root value={value} onValueChange={(v) => setValue(v as Date)}>
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <DatePicker.Header />
      <DatePicker.Footer>
        <Button variant="outline" size="compact" style={{ width: "100%" }}>
          Apply
        </Button>
      </DatePicker.Footer>
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
      disabled={(date) => date.getDay() === 0 || date.getDay() === 6}
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

const STORY_PRESETS = [
  {
    id: "today",
    label: "Today",
    textValue: "Today",
    resolve: (now) => ({
      value: {
        start: new Date(now),
        end: new Date(now),
      },
      mode: "range",
      granularity: "date-time",
    }),
  },
  {
    id: "previous-24-hours",
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
      value: {
        start: new Date(now),
        end: new Date(now),
      },
      mode: "range",
      granularity: "date-time",
    }),
  },
] as const satisfies readonly DatePickerPreset[];

function PresetsAndCustomCalendar() {
  const [presetId, setPresetId] = useState<string | null>(null);
  const [rangeDraft, setRangeDraft] = useState<DateRangeDraft>({
    start: null,
    end: null,
  });

  return (
    <DatePicker.Root
      mode="range"
      granularity="date-time"
      presets={STORY_PRESETS}
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

export const PresetsAndCustom: Story = {
  render: () => <PresetsAndCustomCalendar />,
};

export const Single: Story = {
  render: () => <SingleCalendar />,
};

export const Constrained: Story = {
  render: () => <ConstrainedCalendar />,
};

const LOCALIZED_PRESETS = [
  {
    id: "heute",
    label: "Heute",
    textValue: "Heute",
    resolve: (now: Date) => ({
      value: {
        start: new Date(now),
        end: new Date(now),
      },
      mode: "range" as const,
      granularity: "date-time" as const,
    }),
  },
  {
    id: "letzte-24-stunden",
    label: "Letzte 24 Stunden",
    textValue: "Letzte 24 Stunden",
    resolve: (now: Date) => ({
      value: {
        start: new Date(now.getTime() - 86_400_000),
        end: new Date(now),
      },
      mode: "range" as const,
      granularity: "date-time" as const,
    }),
  },
] satisfies readonly DatePickerPreset[];

const LOCALIZED_LABELS = {
  previousMonth: "Vorheriger Monat",
  nextMonth: "Nächster Monat",
  date: "Datum",
  startDate: "Startdatum",
  endDate: "Enddatum",
  time: "Uhrzeit",
  startTime: "Startzeit",
  endTime: "Endzeit",
  dateRange: "Datumsbereich",
  dateAndTime: "Datum und Uhrzeit",
  startDateAndTime: "Startdatum und Uhrzeit",
  endDateAndTime: "Enddatum und Uhrzeit",
  preset: "Zeitraum",
  custom: "Benutzerdefiniert",
  unavailablePreset: "Dieser Zeitraum enthält nicht verfügbare Tage",
  invalidDate: "Geben Sie ein gültiges Datum ein",
  invalidTime: "Geben Sie eine gültige Uhrzeit ein",
  requiredDate: "Wählen Sie ein Datum aus",
  requiredDateRange: "Wählen Sie einen Datumsbereich aus",
} satisfies Required<DatePickerLabels>;

function LocalizedCalendar() {
  const [presetId, setPresetId] = useState<string | null>(null);
  const [rangeDraft, setRangeDraft] = useState<DateRangeDraft>({
    start: null,
    end: null,
  });

  return (
    <DatePicker.Root
      mode="range"
      granularity="date-time"
      presets={LOCALIZED_PRESETS}
      presetId={presetId}
      onPresetIdChange={setPresetId}
      rangeDraft={rangeDraft}
      onRangeDraftChange={setRangeDraft}
      defaultMonth={new Date("2026-07-01T00:00:00.000Z")}
      timeZone="UTC"
      locale="de-DE"
      weekStartsOn={1}
      labels={LOCALIZED_LABELS}
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <DatePicker.PresetSelect />
      <DatePicker.Header />
      <DatePicker.Footer>
        <Button variant="outline" size="compact" style={{ width: "100%" }}>
          Anwenden
        </Button>
      </DatePicker.Footer>
    </DatePicker.Root>
  );
}

export const Localized: Story = {
  render: () => <LocalizedCalendar />,
};
