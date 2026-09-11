import type * as React from "react";
import type { DateRange } from "./useDateRangeSelection";

export type DatePickerMode = "single" | "range";
export type DatePickerGranularity = "date" | "date-time";

export type DatePickerPresetResult =
  | {
      mode: "single";
      value: Date;
      granularity: DatePickerGranularity;
    }
  | {
      mode: "range";
      value: DateRange;
      granularity: DatePickerGranularity;
    };

export interface DatePickerPreset {
  /** Stable consumer-owned identity. */
  id: string;
  label: React.ReactNode;
  /** Accessible label and keyboard typeahead value. */
  textValue: string;
  /** Resolves relative dates from the interaction-time instant. */
  resolve: (now: Date) => DatePickerPresetResult;
  disabled?: boolean;
  /** Explanation rendered with a disabled option. */
  disabledReason?: React.ReactNode;
}
