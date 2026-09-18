"use client";

import * as React from "react";
import type { DatePickerTimeZone } from "./dateTimeZone";
import type {
  DatePickerGranularity,
  DatePickerMode,
  DatePickerPreset,
} from "./types";
import type { DateRangeDraft } from "./useDateRangeSelection";

export interface DatePickerLabels {
  previousMonth: string;
  nextMonth: string;
  date: string;
  startDate: string;
  endDate: string;
  time: string;
  startTime: string;
  endTime: string;
  dateRange: string;
  dateAndTime: string;
  startDateAndTime: string;
  endDateAndTime: string;
  preset?: string;
  custom?: string;
  unavailablePreset?: string;
  invalidDate?: string;
  invalidTime?: string;
  requiredDate?: string;
  requiredDateRange?: string;
}

export interface DayCellState {
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isOutsideMonth: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInRange: boolean;
}

export interface DatePickerContextValue {
  viewYear: number;
  viewMonth: number;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  mode: DatePickerMode;
  setMode: (mode: DatePickerMode) => void;
  granularity: DatePickerGranularity;
  setGranularity: (granularity: DatePickerGranularity) => void;
  includeTime: boolean;
  presets: readonly DatePickerPreset[];
  presetId: string | null;
  selectPreset: (presetId: string | null) => void;
  presetError: string | null;
  required: boolean;
  requiredError: boolean;
  inputDraftResetRevision: number;
  clearRequiredError: () => void;
  setInputValidity: (inputId: string, isValid: boolean) => void;
  registerInvalidControl: (
    inputId: string,
    element: HTMLElement | null,
  ) => void;
  registerPresetControl: (element: HTMLElement | null) => void;
  timeZone: DatePickerTimeZone;
  usesRangeDraftApi: boolean;
  singleValue: Date | null;
  rangeValue: DateRangeDraft | null;
  pendingStart: Date | null;
  rangePreviewAnchor: Date | null;
  hoveredDate: Date | null;
  focusedDate: Date;
  setFocusedDate: (date: Date) => void;
  selectDate: (date: Date) => void;
  setHoveredDate: (date: Date | null) => void;
  setDate: (which: "start" | "end", date: Date) => void;
  setTime: (which: "start" | "end", hours: number, minutes: number) => void;
  isDateDisabled: (date: Date) => boolean;
  min?: Date | undefined;
  max?: Date | undefined;
  locale: string;
  weekStartsOn: 0 | 1;
  labels: Required<DatePickerLabels>;
}

export type DateRangeEndpoint = "start" | "end";

interface DatePickerInteractionContextValue {
  deferRangeEndpointInvalidCommit: (
    endpoint: DateRangeEndpoint,
    commit: () => void,
  ) => boolean;
  setRangeEndpointIntent: (endpoint: DateRangeEndpoint) => void;
}

export const DatePickerContext = React.createContext<
  DatePickerContextValue | undefined
>(undefined);

export const DatePickerInteractionContext = React.createContext<
  DatePickerInteractionContextValue | undefined
>(undefined);

export function useDatePickerContext(): DatePickerContextValue {
  const context = React.useContext(DatePickerContext);
  if (context === undefined) {
    throw new Error(
      "DatePicker parts must be placed within <DatePicker.Root>.",
    );
  }
  return context;
}

export function useDatePickerInteractionContext(): DatePickerInteractionContextValue {
  const context = React.useContext(DatePickerInteractionContext);
  if (context === undefined) {
    throw new Error(
      "DatePicker parts must be placed within <DatePicker.Root>.",
    );
  }
  return context;
}
