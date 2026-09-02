import type { DatePickerPreset } from "../DatePicker";

export const DATE_PICKER_PRESETS = [
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
    id: "window",
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
    id: "invalid",
    label: "Invalid window",
    textValue: "Invalid window",
    resolve: () => ({
      value: {
        start: new Date(Number.NaN),
        end: new Date(Number.NaN),
      },
      mode: "range",
      granularity: "date-time",
    }),
  },
] as const satisfies readonly DatePickerPreset[];
