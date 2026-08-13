"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./DatePicker.module.scss";
import {
  DatePickerContext,
  type DatePickerContextValue,
  type DatePickerLabels,
} from "./datePickerContext";
import type { DateRange, DateRangeDraft } from "./useDateRangeSelection";
import { useDatePickerController } from "./useDatePickerController";
import type {
  DatePickerGranularity,
  DatePickerMode,
  DatePickerPreset,
} from "./types";
import {
  addCalendarMonths,
  createCalendarDate,
  getCalendarDate,
  getCalendarHours,
  getCalendarMinutes,
  getCalendarMonth,
  getCalendarYear,
  setCalendarTime,
  startOfCalendarDay,
  type DatePickerTimeZone,
} from "./dateTimeZone";

export type { DateRange, DateRangeDraft } from "./useDateRangeSelection";
export type { DatePickerTimeZone } from "./dateTimeZone";
export {
  useDatePickerContext,
  type DatePickerLabels,
  type DayCellState,
} from "./datePickerContext";
export { Header, type DatePickerHeaderProps } from "./headerParts";
export {
  Grid,
  Navigation,
  type DatePickerGridProps,
  type DatePickerNavigationProps,
} from "./calendarParts";
export type {
  DatePickerGranularity,
  DatePickerMode,
  DatePickerPreset,
  DatePickerPresetResult,
} from "./types";

function isDateBefore(a: Date, b: Date, timeZone: DatePickerTimeZone): boolean {
  return (
    startOfCalendarDay(a, timeZone).getTime() <
    startOfCalendarDay(b, timeZone).getTime()
  );
}

const DEFAULT_LABELS: Required<DatePickerLabels> = {
  previousMonth: "Previous month",
  nextMonth: "Next month",
  date: "Date",
  startDate: "Start date",
  endDate: "End date",
  time: "Time",
  startTime: "Start time",
  endTime: "End time",
  dateRange: "Date range",
  dateAndTime: "Date and time",
  startDateAndTime: "Start date and time",
  endDateAndTime: "End date and time",
  preset: "Date preset",
  custom: "Custom",
  unavailablePreset: "This preset contains unavailable dates",
  invalidDate: "Enter a valid date",
  invalidTime: "Enter a valid time",
  requiredDate: "Select a date",
  requiredDateRange: "Select a date range",
};

export interface DatePickerRootProps
  extends React.ComponentPropsWithoutRef<"div"> {
  /** Imperative validation actions for composed Apply boundaries. */
  actionsRef?: React.RefObject<DatePickerActions | null>;
  /** Controlled selection mode. */
  mode?: DatePickerMode;
  /** Initial selection mode for an uncontrolled Root. */
  defaultMode?: DatePickerMode;
  /** Called when the selection mode changes, including from a preset. */
  onModeChange?: (mode: DatePickerMode) => void;
  /**
   * Compatibility alias for `granularity="date-time"`. When `granularity`
   * is supplied it is authoritative.
   */
  includeTime?: boolean;
  /** Controlled editing granularity. */
  granularity?: DatePickerGranularity;
  /** Initial editing granularity for an uncontrolled Root. */
  defaultGranularity?: DatePickerGranularity;
  /** Called when editing granularity changes, including from a preset. */
  onGranularityChange?: (granularity: DatePickerGranularity) => void;
  /** Consumer-defined relative or absolute date presets. */
  presets?: readonly DatePickerPreset[];
  /** Controlled selected preset identity. `null` represents Custom. */
  presetId?: string | null;
  /** Initial selected preset identity for an uncontrolled Root. */
  defaultPresetId?: string | null;
  /** Called after named selection or when a manual edit becomes Custom. */
  onPresetIdChange?: (presetId: string | null) => void;
  /** Reports whether every visible draft and selected preset is valid. */
  onValidityChange?: (isValid: boolean) => void;
  /** Require at least one selected date when `actionsRef.validate()` runs. */
  required?: boolean;
  /**
   * Calendar field interpretation. `local` preserves the default behavior;
   * `UTC` reads and edits Date fields with UTC accessors so UTC wall-clock
   * values remain independent of the browser's daylight-saving transitions.
   */
  timeZone?: DatePickerTimeZone;
  /**
   * Selected date in single mode, or the committed complete range in range
   * mode. In-progress partial range edits are owned independently by
   * `rangeDraft` when the draft API is used.
   */
  value?: Date | DateRange | null;
  /**
   * Called for single-date changes and complete range commits. With either
   * draft prop, partial edits emit only through `onRangeDraftChange`. Without
   * the draft API, typing the first range bound commits a same-day range for
   * compatibility with the original DatePicker contract.
   */
  onValueChange?: (value: Date | DateRange) => void;
  /**
   * Independent controlled editor draft for range mode. Either bound may be
   * absent; when provided, this channel remains authoritative even when
   * `value` contains a committed range.
   */
  rangeDraft?: DateRangeDraft | null;
  /**
   * Called after every range-mode date or time edit. Complete drafts also
   * commit through `onValueChange`. Opting into the draft API requires a
   * bound's date before its time can be edited; legacy consumers without the
   * draft API retain time-first today synthesis.
   */
  onRangeDraftChange?: (value: DateRangeDraft) => void;
  /** Controlled visible month. When provided, the consumer drives navigation. */
  month?: Date;
  /** Initial month to display (uncontrolled). Defaults to selected date or current month. */
  defaultMonth?: Date;
  /** Called when the visible month changes. */
  onMonthChange?: (month: Date) => void;
  /** Earliest selectable date. */
  min?: Date;
  /** Latest selectable date. */
  max?: Date;
  /** Custom disable function. */
  disabled?: (date: Date) => boolean;
  /** BCP 47 locale tag (e.g. "en-US", "de-DE", "ja-JP"). Defaults to "en-US". */
  locale?: string;
  /** First day of week: 0 = Sunday, 1 = Monday. */
  weekStartsOn?: 0 | 1;
  /** Override accessibility labels for navigation and inputs. */
  labels?: Partial<DatePickerLabels>;
  /** Analytics tracking name. */
  analyticsName?: string;
}

export interface DatePickerActions {
  /** Validates the current editor state and reveals deferred errors. */
  validate: () => boolean;
  /** Focuses the first invalid registered control in document order. */
  focusFirstInvalidControl: () => boolean;
}

export const Root = React.forwardRef<HTMLDivElement, DatePickerRootProps>(
  function DatePickerRoot(props, forwardedRef) {
    const {
      className,
      children,
      mode: modeProp,
      defaultMode = "single",
      onModeChange,
      includeTime: includeTimeProp,
      granularity: granularityProp,
      defaultGranularity,
      onGranularityChange,
      presets = [],
      presetId: presetIdProp,
      defaultPresetId = null,
      onPresetIdChange,
      onValidityChange,
      required = false,
      timeZone = "local",
      value: valueProp,
      onValueChange,
      rangeDraft: rangeDraftProp,
      onRangeDraftChange,
      month: monthProp,
      defaultMonth,
      onMonthChange,
      min,
      max,
      disabled,
      locale = "en-US",
      weekStartsOn = 0,
      labels: labelsProp,
      analyticsName,
      actionsRef,
      ...elementProps
    } = props;

    if (process.env.NODE_ENV !== "production") {
      if (monthProp !== undefined && !onMonthChange) {
        console.warn(
          "DatePicker: `month` prop provided without `onMonthChange`. " +
            "The date picker will navigate internally but the controlled prop will become stale.",
        );
      }
    }

    const labels = React.useMemo<Required<DatePickerLabels>>(
      () => ({ ...DEFAULT_LABELS, ...labelsProp }),
      [labelsProp],
    );
    const usesLegacyIncludeTime =
      includeTimeProp !== undefined &&
      granularityProp === undefined &&
      defaultGranularity === undefined;
    const isDateDisabled = React.useCallback(
      (date: Date): boolean => {
        if (disabled?.(date)) return true;
        if (min && isDateBefore(date, min, timeZone)) return true;
        if (max && isDateBefore(max, date, timeZone)) return true;
        return false;
      },
      [disabled, min, max, timeZone],
    );
    const controller = useDatePickerController({
      mode: modeProp,
      defaultMode,
      onModeChange,
      includeTime: includeTimeProp,
      granularity: granularityProp,
      defaultGranularity,
      onGranularityChange,
      presets,
      presetId: presetIdProp,
      defaultPresetId,
      onPresetIdChange,
      onValidityChange,
      value: valueProp,
      onValueChange,
      rangeDraft: rangeDraftProp,
      onRangeDraftChange,
      required,
      timeZone,
      isDateDisabled,
      unavailablePresetLabel: labels.unavailablePreset,
      analyticsName,
    });
    const {
      mode,
      updateMode,
      granularity,
      updateGranularity,
      includeTime,
      presetId,
      presetError,
      requiredError,
      inputDraftResetRevision,
      clearRequiredError,
      setInputValidity,
      registerInvalidControl,
      registerPresetControl,
      focusFirstInvalidControl,
      validate,
      selectPreset: selectPresetTransition,
      clearPresetIdentity,
      applyTransition,
      singleValue,
      rangeValue,
      usesRangeDraftApi,
    } = controller;
    React.useImperativeHandle(
      actionsRef,
      () => ({ focusFirstInvalidControl, validate }),
      [focusFirstInvalidControl, validate],
    );

    // View state
    const initialMonth = React.useMemo(() => {
      if (monthProp) return monthProp;
      if (defaultMonth) return defaultMonth;
      if (singleValue) return singleValue;
      if (rangeValue?.start) return rangeValue.start;
      if (rangeValue?.end) return rangeValue.end;
      return new Date();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [viewDate, setViewDate] = React.useState(() =>
      createCalendarDate(
        getCalendarYear(initialMonth, timeZone),
        getCalendarMonth(initialMonth, timeZone),
        1,
        timeZone,
      ),
    );

    // Controlled month: sync external prop to internal state
    React.useEffect(() => {
      if (monthProp !== undefined) {
        setViewDate(
          createCalendarDate(
            getCalendarYear(monthProp, timeZone),
            getCalendarMonth(monthProp, timeZone),
            1,
            timeZone,
          ),
        );
      }
    }, [monthProp, timeZone]);

    // Fire onMonthChange when view changes
    const onMonthChangeRef = React.useRef(onMonthChange);
    React.useEffect(() => {
      onMonthChangeRef.current = onMonthChange;
    });
    const prevViewRef = React.useRef(viewDate);
    React.useEffect(() => {
      if (viewDate.getTime() !== prevViewRef.current.getTime()) {
        onMonthChangeRef.current?.(viewDate);
        prevViewRef.current = viewDate;
      }
    }, [viewDate]);

    // Focus state
    const [focusedDate, setFocusedDateState] = React.useState<Date>(() => {
      if (singleValue) return startOfCalendarDay(singleValue, timeZone);
      if (rangeValue?.start)
        return startOfCalendarDay(rangeValue.start, timeZone);
      if (rangeValue?.end) return startOfCalendarDay(rangeValue.end, timeZone);
      const today = startOfCalendarDay(new Date(), timeZone);
      if (
        getCalendarYear(today, timeZone) ===
          getCalendarYear(initialMonth, timeZone) &&
        getCalendarMonth(today, timeZone) ===
          getCalendarMonth(initialMonth, timeZone)
      ) {
        return today;
      }
      return createCalendarDate(
        getCalendarYear(initialMonth, timeZone),
        getCalendarMonth(initialMonth, timeZone),
        1,
        timeZone,
      );
    });

    // Range selection state
    const [pendingStart, setPendingStart] = React.useState<Date | null>(null);
    const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null);

    React.useEffect(() => {
      setPendingStart(null);
      setHoveredDate(null);
    }, [mode]);

    const viewYear = getCalendarYear(viewDate, timeZone);
    const viewMonth = getCalendarMonth(viewDate, timeZone);

    React.useEffect(() => {
      const isVisible = (date: Date) =>
        getCalendarYear(date, timeZone) === viewYear &&
        getCalendarMonth(date, timeZone) === viewMonth;
      if (isVisible(focusedDate) && !isDateDisabled(focusedDate)) {
        return;
      }

      const selectedDate =
        mode === "single"
          ? singleValue
          : rangeValue?.start ?? rangeValue?.end ?? null;
      if (
        selectedDate &&
        isVisible(selectedDate) &&
        !isDateDisabled(selectedDate)
      ) {
        setFocusedDateState(startOfCalendarDay(selectedDate, timeZone));
        return;
      }

      const lastDay = getCalendarDate(
        createCalendarDate(viewYear, viewMonth + 1, 0, timeZone),
        timeZone,
      );
      for (let day = 1; day <= lastDay; day += 1) {
        const candidate = createCalendarDate(
          viewYear,
          viewMonth,
          day,
          timeZone,
        );
        if (!isDateDisabled(candidate)) {
          setFocusedDateState(candidate);
          return;
        }
      }

      const fallbackDate = createCalendarDate(viewYear, viewMonth, 1, timeZone);
      if (focusedDate.getTime() !== fallbackDate.getTime()) {
        setFocusedDateState(fallbackDate);
      }
    }, [
      focusedDate,
      isDateDisabled,
      mode,
      rangeValue,
      singleValue,
      timeZone,
      viewMonth,
      viewYear,
    ]);

    const setFocusedDate = React.useCallback(
      (date: Date) => {
        const normalized = startOfCalendarDay(date, timeZone);
        setFocusedDateState(normalized);
        setViewDate(
          createCalendarDate(
            getCalendarYear(normalized, timeZone),
            getCalendarMonth(normalized, timeZone),
            1,
            timeZone,
          ),
        );
      },
      [timeZone],
    );

    const goToMonth = React.useCallback(
      (offset: number) => {
        setViewDate((prev) => addCalendarMonths(prev, offset, timeZone));
        setFocusedDateState((prev) => {
          const target = addCalendarMonths(prev, offset, timeZone);
          const targetYear = getCalendarYear(target, timeZone);
          const targetMonth = getCalendarMonth(target, timeZone);
          const lastDay = getCalendarDate(
            createCalendarDate(targetYear, targetMonth + 1, 0, timeZone),
            timeZone,
          );
          return createCalendarDate(
            targetYear,
            targetMonth,
            Math.min(getCalendarDate(prev, timeZone), lastDay),
            timeZone,
          );
        });
      },
      [timeZone],
    );

    const goToPreviousMonth = React.useCallback(
      () => goToMonth(-1),
      [goToMonth],
    );
    const goToNextMonth = React.useCallback(() => goToMonth(1), [goToMonth]);

    const selectDate = React.useCallback(
      (date: Date) => {
        if (isDateDisabled(date)) return;

        function applyTime(target: Date, source: Date | null): Date {
          if (!includeTime) {
            return startOfCalendarDay(target, timeZone);
          }
          const reference =
            source ?? (usesLegacyIncludeTime ? new Date() : null);
          if (!reference) return startOfCalendarDay(target, timeZone);
          return setCalendarTime(
            startOfCalendarDay(target, timeZone),
            getCalendarHours(reference, timeZone),
            getCalendarMinutes(reference, timeZone),
            timeZone,
          );
        }

        if (mode === "single") {
          applyTransition({
            source: "manual",
            mode,
            value: applyTime(date, singleValue),
            granularity,
            presetId: null,
          });
          return;
        }

        const draftStart =
          usesRangeDraftApi && rangeValue?.start && !rangeValue.end
            ? rangeValue.start
            : pendingStart;
        if (draftStart === null) {
          if (usesRangeDraftApi) {
            applyTransition({
              source: "manual",
              mode,
              value:
                !rangeValue?.start && rangeValue?.end
                  ? {
                      start: applyTime(date, null),
                      end: new Date(rangeValue.end),
                    }
                  : {
                      start: applyTime(date, rangeValue?.start ?? null),
                      end: null,
                    },
              granularity,
              presetId: null,
            });
          } else {
            clearPresetIdentity();
            clearRequiredError();
            setPendingStart(startOfCalendarDay(date, timeZone));
          }
        } else {
          const reversed = isDateBefore(date, draftStart, timeZone);
          const startDate = reversed ? date : draftStart;
          const endDate = reversed ? draftStart : date;
          const start = applyTime(startDate, rangeValue?.start ?? null);
          const end = applyTime(endDate, rangeValue?.end ?? null);
          const preferredRoleTimes =
            rangeValue?.start && rangeValue.end
              ? { start: rangeValue.start, end: rangeValue.end }
              : undefined;
          applyTransition({
            source: "manual",
            mode,
            value: { start, end },
            granularity,
            presetId: null,
            ...(preferredRoleTimes ? { preferredRoleTimes } : {}),
          });
          setPendingStart(null);
          setHoveredDate(null);
        }
      },
      [
        mode,
        granularity,
        includeTime,
        usesLegacyIncludeTime,
        timeZone,
        pendingStart,
        usesRangeDraftApi,
        singleValue,
        rangeValue,
        isDateDisabled,
        applyTransition,
        clearPresetIdentity,
        clearRequiredError,
      ],
    );

    const setDate = React.useCallback(
      (which: "start" | "end", date: Date) => {
        setViewDate(
          createCalendarDate(
            getCalendarYear(date, timeZone),
            getCalendarMonth(date, timeZone),
            1,
            timeZone,
          ),
        );

        if (mode === "single") {
          const d =
            includeTime && singleValue
              ? setCalendarTime(
                  date,
                  getCalendarHours(singleValue, timeZone),
                  getCalendarMinutes(singleValue, timeZone),
                  timeZone,
                )
              : new Date(date);
          applyTransition({
            source: "manual",
            mode,
            value: d,
            granularity,
            presetId: null,
          });
        } else {
          const current = rangeValue ?? { start: null, end: null };
          const existing = which === "start" ? current.start : current.end;
          const d =
            includeTime && existing
              ? setCalendarTime(
                  date,
                  getCalendarHours(existing, timeZone),
                  getCalendarMinutes(existing, timeZone),
                  timeZone,
                )
              : new Date(date);
          const newRange: DateRangeDraft = {
            start:
              which === "start"
                ? d
                : current.start
                ? new Date(current.start)
                : null,
            end:
              which === "end" ? d : current.end ? new Date(current.end) : null,
          };
          const preferredRoleTimes =
            current.start && current.end
              ? { start: current.start, end: current.end }
              : undefined;
          applyTransition({
            source: "manual",
            mode,
            value: newRange,
            granularity,
            presetId: null,
            ...(preferredRoleTimes ? { preferredRoleTimes } : {}),
          });
        }
      },
      [
        mode,
        granularity,
        includeTime,
        singleValue,
        rangeValue,
        applyTransition,
        timeZone,
      ],
    );

    const setTime = React.useCallback(
      (which: "start" | "end", hours: number, minutes: number) => {
        if (mode === "single") {
          const base = singleValue
            ? new Date(singleValue)
            : startOfCalendarDay(new Date(), timeZone);
          applyTransition({
            source: "manual",
            mode,
            value: setCalendarTime(base, hours, minutes, timeZone),
            granularity,
            presetId: null,
          });
        } else {
          const today = startOfCalendarDay(new Date(), timeZone);
          const current = rangeValue ?? { start: null, end: null };
          const newRange = {
            start: current.start ? new Date(current.start) : null,
            end: current.end ? new Date(current.end) : null,
          };
          const target =
            (which === "start" ? newRange.start : newRange.end) ??
            new Date(today);
          const timedTarget = setCalendarTime(target, hours, minutes, timeZone);
          if (which === "start") {
            newRange.start = timedTarget;
          } else {
            newRange.end = timedTarget;
          }
          applyTransition({
            source: "manual",
            mode,
            value: newRange,
            granularity,
            presetId: null,
          });
        }
      },
      [mode, granularity, singleValue, rangeValue, applyTransition, timeZone],
    );

    const selectPreset = React.useCallback(
      (nextPresetId: string | null) => {
        const selectedDate = selectPresetTransition(nextPresetId);
        if (selectedDate) {
          setViewDate(
            createCalendarDate(
              getCalendarYear(selectedDate, timeZone),
              getCalendarMonth(selectedDate, timeZone),
              1,
              timeZone,
            ),
          );
        }
      },
      [selectPresetTransition, timeZone],
    );

    const rangePreviewAnchor =
      pendingStart ??
      (usesRangeDraftApi && rangeValue && (!rangeValue.start || !rangeValue.end)
        ? rangeValue.start ?? rangeValue.end
        : null);

    const contextValue = React.useMemo<DatePickerContextValue>(
      () => ({
        viewYear,
        viewMonth,
        goToPreviousMonth,
        goToNextMonth,
        mode,
        setMode: updateMode,
        granularity,
        setGranularity: updateGranularity,
        includeTime,
        presets,
        presetId,
        selectPreset,
        presetError,
        required,
        requiredError,
        inputDraftResetRevision,
        clearRequiredError,
        setInputValidity,
        registerInvalidControl,
        registerPresetControl,
        timeZone,
        usesRangeDraftApi,
        singleValue,
        rangeValue,
        pendingStart,
        rangePreviewAnchor,
        hoveredDate,
        focusedDate,
        setFocusedDate,
        selectDate,
        setHoveredDate,
        setDate,
        setTime,
        isDateDisabled,
        min,
        max,
        locale,
        weekStartsOn,
        labels,
      }),
      [
        viewYear,
        viewMonth,
        goToPreviousMonth,
        goToNextMonth,
        mode,
        updateMode,
        granularity,
        updateGranularity,
        includeTime,
        presets,
        presetId,
        selectPreset,
        presetError,
        required,
        requiredError,
        inputDraftResetRevision,
        clearRequiredError,
        setInputValidity,
        registerInvalidControl,
        registerPresetControl,
        timeZone,
        usesRangeDraftApi,
        singleValue,
        rangeValue,
        pendingStart,
        rangePreviewAnchor,
        hoveredDate,
        focusedDate,
        setFocusedDate,
        selectDate,
        setHoveredDate,
        setDate,
        setTime,
        isDateDisabled,
        min,
        max,
        locale,
        weekStartsOn,
        labels,
      ],
    );

    return (
      <DatePickerContext.Provider value={contextValue}>
        <div
          ref={forwardedRef}
          className={clsx(styles.root, className)}
          {...elementProps}
        >
          {children}
        </div>
      </DatePickerContext.Provider>
    );
  },
);

export interface DatePickerControlsProps
  extends React.ComponentPropsWithoutRef<"div"> {}

export const Controls = React.forwardRef<
  HTMLDivElement,
  DatePickerControlsProps
>(function DatePickerControls({ className, children, ...props }, forwardedRef) {
  return (
    <div
      ref={forwardedRef}
      className={clsx(styles.controls, className)}
      {...props}
    >
      {children}
    </div>
  );
});

export interface DatePickerControlItemProps
  extends React.ComponentPropsWithoutRef<"div"> {
  /** Text label for the control. */
  label: string;
}

export const ControlItem = React.forwardRef<
  HTMLDivElement,
  DatePickerControlItemProps
>(function DatePickerControlItem(
  { className, label, children, ...props },
  forwardedRef,
) {
  return (
    <div
      ref={forwardedRef}
      className={clsx(styles.controlItem, className)}
      {...props}
    >
      <span className={styles.controlLabel}>{label}</span>
      {children}
    </div>
  );
});

export interface DatePickerFooterProps
  extends React.ComponentPropsWithoutRef<"div"> {}

export const Footer = React.forwardRef<HTMLDivElement, DatePickerFooterProps>(
  function DatePickerFooter({ className, children, ...props }, forwardedRef) {
    return (
      <div
        ref={forwardedRef}
        className={clsx(styles.footer, className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Root.displayName = "DatePicker.Root";
  Controls.displayName = "DatePicker.Controls";
  ControlItem.displayName = "DatePicker.ControlItem";
  Footer.displayName = "DatePicker.Footer";
}
