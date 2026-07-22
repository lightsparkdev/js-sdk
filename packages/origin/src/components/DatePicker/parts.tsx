"use client";

import * as React from "react";
import clsx from "clsx";
import { CentralIcon } from "../Icon";
import { Input } from "../Input";
import { Fieldset } from "../Fieldset";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import styles from "./DatePicker.module.scss";
import {
  useDateRangeSelection,
  type DateRange,
  type DateRangeDraft,
} from "./useDateRangeSelection";
import {
  addCalendarDays,
  addCalendarMonths,
  createCalendarDate,
  getCalendarDate,
  getCalendarDay,
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

function isSameDay(a: Date, b: Date, timeZone: DatePickerTimeZone): boolean {
  return (
    getCalendarYear(a, timeZone) === getCalendarYear(b, timeZone) &&
    getCalendarMonth(a, timeZone) === getCalendarMonth(b, timeZone) &&
    getCalendarDate(a, timeZone) === getCalendarDate(b, timeZone)
  );
}

function isSameMonth(
  date: Date,
  year: number,
  month: number,
  timeZone: DatePickerTimeZone,
): boolean {
  return (
    getCalendarYear(date, timeZone) === year &&
    getCalendarMonth(date, timeZone) === month
  );
}

function isDateInRange(
  date: Date,
  start: Date,
  end: Date,
  timeZone: DatePickerTimeZone,
): boolean {
  const t = startOfCalendarDay(date, timeZone).getTime();
  return (
    t > startOfCalendarDay(start, timeZone).getTime() &&
    t < startOfCalendarDay(end, timeZone).getTime()
  );
}

function isDateBefore(a: Date, b: Date, timeZone: DatePickerTimeZone): boolean {
  return (
    startOfCalendarDay(a, timeZone).getTime() <
    startOfCalendarDay(b, timeZone).getTime()
  );
}

function getMonthGrid(
  year: number,
  month: number,
  weekStartsOn: 0 | 1,
  timeZone: DatePickerTimeZone,
): Date[][] {
  const firstDay = createCalendarDate(year, month, 1, timeZone);
  const offset = (getCalendarDay(firstDay, timeZone) - weekStartsOn + 7) % 7;
  const gridStart = addCalendarDays(firstDay, -offset, timeZone);

  const weeks: Date[][] = [];
  let current = new Date(gridStart);
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(current));
      current = addCalendarDays(current, 1, timeZone);
    }
    weeks.push(week);
  }
  return weeks;
}

const KNOWN_SUNDAY = new Date(2024, 0, 7); // Jan 7 2024 is a Sunday
const DAY_MS = 86_400_000;

const weekdayCache = new Map<string, { narrow: string; long: string }[]>();

function getWeekdayLabels(locale: string): { narrow: string; long: string }[] {
  const cached = weekdayCache.get(locale);
  if (cached) return cached;

  const longFmt = new Intl.DateTimeFormat(locale, { weekday: "long" });
  const narrowFmt = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
  const result = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(KNOWN_SUNDAY.getTime() + i * DAY_MS);
    return { narrow: narrowFmt.format(d), long: longFmt.format(d) };
  });
  weekdayCache.set(locale, result);
  return result;
}

interface DateFormatInfo {
  order: ("day" | "month" | "year")[];
  separator: string;
  placeholder: string;
}

const dateFormatCache = new Map<string, DateFormatInfo>();

function getDateFormat(locale: string): DateFormatInfo {
  const cached = dateFormatCache.get(locale);
  if (cached) return cached;

  const parts = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(new Date(2024, 11, 25));

  const order = parts
    .filter(
      (
        p,
      ): p is Intl.DateTimeFormatPart & {
        type: "day" | "month" | "year";
      } => p.type === "day" || p.type === "month" || p.type === "year",
    )
    .map((p) => p.type);

  const literal = parts.find((p) => p.type === "literal");
  const separator = literal?.value ?? "/";
  const labels: Record<string, string> = {
    day: "DD",
    month: "MM",
    year: "YYYY",
  };
  const placeholder = order.map((p) => labels[p]).join(separator);

  const result: DateFormatInfo = { order, separator, placeholder };
  dateFormatCache.set(locale, result);
  return result;
}

function getTimePlaceholder(locale: string): string {
  const resolved = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
  }).resolvedOptions();
  return resolved.hourCycle === "h12" || resolved.hourCycle === "h11"
    ? "12:00 PM"
    : "00:00";
}

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
}

const DEFAULT_LABELS: DatePickerLabels = {
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
};

export interface DayCellState {
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isOutsideMonth: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInRange: boolean;
}

export interface DatePickerRootProps
  extends React.ComponentPropsWithoutRef<"div"> {
  /** Selection mode. */
  mode?: "single" | "range";
  /** Whether time inputs are shown in the header. */
  includeTime?: boolean;
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

interface DatePickerContextValue {
  viewYear: number;
  viewMonth: number;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;

  mode: "single" | "range";
  includeTime: boolean;
  timeZone: DatePickerTimeZone;
  usesRangeDraftApi: boolean;
  singleValue: Date | null;
  rangeValue: DateRangeDraft | null;
  pendingStart: Date | null;
  hoveredDate: Date | null;

  focusedDate: Date;
  setFocusedDate: (date: Date) => void;

  selectDate: (date: Date) => void;
  setHoveredDate: (date: Date | null) => void;
  // In single mode, `which` is always 'start'.
  setDate: (which: "start" | "end", date: Date) => void;
  setTime: (which: "start" | "end", hours: number, minutes: number) => void;
  isDateDisabled: (date: Date) => boolean;
  min?: Date | undefined;
  max?: Date | undefined;

  locale: string;
  weekStartsOn: 0 | 1;
  labels: DatePickerLabels;
}

const DatePickerContext = React.createContext<
  DatePickerContextValue | undefined
>(undefined);

function useDatePickerContext() {
  const context = React.useContext(DatePickerContext);
  if (context === undefined) {
    throw new Error(
      "DatePicker parts must be placed within <DatePicker.Root>.",
    );
  }
  return context;
}

export const Root = React.forwardRef<HTMLDivElement, DatePickerRootProps>(
  function DatePickerRoot(props, forwardedRef) {
    const {
      className,
      children,
      mode: modeProp,
      includeTime: includeTimeProp,
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

    const mode = modeProp ?? "single";
    const includeTime = includeTimeProp ?? false;
    const labels = React.useMemo(
      () => ({ ...DEFAULT_LABELS, ...labelsProp }),
      [labelsProp],
    );

    const singleValue =
      mode === "single" && valueProp instanceof Date ? valueProp : null;
    const trackedSelect = useTrackedCallback(
      analyticsName,
      "DatePicker",
      "change",
      onValueChange,
      (val: Date | DateRange) => ({
        value: val instanceof Date ? val.toISOString() : undefined,
        start: val instanceof Date ? undefined : val.start.toISOString(),
        end: val instanceof Date ? undefined : val.end.toISOString(),
        mode,
      }),
    );
    const { rangeValue, emitRange, usesRangeDraftApi } = useDateRangeSelection({
      mode,
      value: valueProp,
      rangeDraft: rangeDraftProp,
      onRangeDraftChange,
      onCommit: trackedSelect,
      timeZone,
    });

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

    const isDateDisabled = React.useCallback(
      (date: Date): boolean => {
        if (disabled?.(date)) return true;
        if (min && isDateBefore(date, min, timeZone)) return true;
        if (max && isDateBefore(max, date, timeZone)) return true;
        return false;
      },
      [disabled, min, max, timeZone],
    );

    const selectDate = React.useCallback(
      (date: Date) => {
        if (isDateDisabled(date)) return;

        function applyTime(target: Date, source: Date | null): Date {
          if (!includeTime) return startOfCalendarDay(target, timeZone);
          const ref = source ?? new Date();
          return setCalendarTime(
            startOfCalendarDay(target, timeZone),
            getCalendarHours(ref, timeZone),
            getCalendarMinutes(ref, timeZone),
            timeZone,
          );
        }

        if (mode === "single") {
          trackedSelect(applyTime(date, singleValue));
          return;
        }

        // Range mode
        const draftStart =
          usesRangeDraftApi && rangeValue?.start && !rangeValue.end
            ? rangeValue.start
            : pendingStart;
        if (draftStart === null) {
          if (usesRangeDraftApi) {
            emitRange(
              !rangeValue?.start && rangeValue?.end
                ? {
                    start: applyTime(date, null),
                    end: new Date(rangeValue.end),
                  }
                : {
                    start: applyTime(date, rangeValue?.start ?? null),
                    end: null,
                  },
            );
          } else {
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
          emitRange({ start, end }, preferredRoleTimes);
          setPendingStart(null);
          setHoveredDate(null);
        }
      },
      [
        mode,
        includeTime,
        timeZone,
        pendingStart,
        usesRangeDraftApi,
        singleValue,
        rangeValue,
        isDateDisabled,
        emitRange,
        trackedSelect,
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
          trackedSelect(d);
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
          emitRange(newRange, preferredRoleTimes);
        }
      },
      [
        mode,
        includeTime,
        singleValue,
        rangeValue,
        trackedSelect,
        emitRange,
        timeZone,
      ],
    );

    const setTime = React.useCallback(
      (which: "start" | "end", hours: number, minutes: number) => {
        if (mode === "single") {
          const base = singleValue
            ? new Date(singleValue)
            : startOfCalendarDay(new Date(), timeZone);
          trackedSelect(setCalendarTime(base, hours, minutes, timeZone));
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
          emitRange(newRange);
        }
      },
      [mode, singleValue, rangeValue, trackedSelect, emitRange, timeZone],
    );

    const contextValue = React.useMemo<DatePickerContextValue>(
      () => ({
        viewYear,
        viewMonth,
        goToPreviousMonth,
        goToNextMonth,
        mode,
        includeTime,
        timeZone,
        usesRangeDraftApi,
        singleValue,
        rangeValue,
        pendingStart,
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
        includeTime,
        timeZone,
        usesRangeDraftApi,
        singleValue,
        rangeValue,
        pendingStart,
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

const FIELDSET_GAP = {
  "--fieldset-gap": "var(--spacing-2xs)",
} as React.CSSProperties;

function formatDateValue(
  date: Date | null,
  locale: string,
  timeZone: DatePickerTimeZone,
): string {
  if (!date) {
    return "";
  }
  return date.toLocaleDateString(locale, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    timeZone: timeZone === "UTC" ? "UTC" : undefined,
  });
}

function parseDateString(
  input: string,
  locale: string,
  timeZone: DatePickerTimeZone,
): Date | null {
  const s = input.trim().replace(/\.$/, "");
  if (!s) return null;

  const match = s.match(/^(\d{1,4})[/\-.\s]+(\d{1,4})[/\-.\s]+(\d{1,4})$/);
  if (!match) return null;

  const { order } = getDateFormat(locale);
  const raw = [
    parseInt(match[1], 10),
    parseInt(match[2], 10),
    parseInt(match[3], 10),
  ];

  const values: Record<string, number> = {};
  for (let i = 0; i < 3; i++) {
    values[order[i]] = raw[i];
  }

  const month = values.month;
  const day = values.day;
  const year = values.year;

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 100) {
    return null;
  }

  const date = createCalendarDate(year, month - 1, day, timeZone);
  if (
    getCalendarYear(date, timeZone) !== year ||
    getCalendarMonth(date, timeZone) !== month - 1 ||
    getCalendarDate(date, timeZone) !== day
  ) {
    return null;
  }

  return date;
}

function DateInput({
  date,
  label,
  which,
}: {
  date: Date | null;
  label: string;
  which: "start" | "end";
}) {
  const ctx = useDatePickerContext();
  const formatted = formatDateValue(date, ctx.locale, ctx.timeZone);
  const [draft, setDraft] = React.useState(formatted);
  const [hasFocus, setHasFocus] = React.useState(false);

  React.useEffect(() => {
    if (!hasFocus) setDraft(formatted);
  }, [formatted, hasFocus]);

  const { placeholder } = getDateFormat(ctx.locale);

  function commit() {
    if (draft === formatted) return;
    const parsed = parseDateString(draft, ctx.locale, ctx.timeZone);
    if (parsed && !ctx.isDateDisabled(parsed)) {
      ctx.setDate(which, parsed);
    } else {
      setDraft(formatted);
    }
  }

  return (
    <Input
      aria-label={label}
      value={draft}
      placeholder={placeholder}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setDraft(e.target.value);
      }}
      onFocus={() => setHasFocus(true)}
      onBlur={() => {
        setHasFocus(false);
        commit();
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          (e.target as HTMLInputElement).blur();
        }
      }}
    />
  );
}

function formatTimeValue(
  date: Date | null,
  locale: string,
  timeZone: DatePickerTimeZone,
): string {
  const d = date ?? new Date();
  return d.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timeZone === "UTC" ? "UTC" : undefined,
  });
}

function parseTimeString(
  input: string,
): { hours: number; minutes: number } | null {
  const s = input.trim();
  if (!s) return null;

  const match = s.match(/^(\d{1,2})[:.](\d{2})\s*(am|pm|a|p)?$/i);
  if (!match) return null;

  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const meridiem = match[3]?.toLowerCase();

  if (m < 0 || m > 59) return null;

  if (meridiem) {
    if (h < 1 || h > 12) return null;
    if (meridiem.startsWith("p") && h !== 12) h += 12;
    if (meridiem.startsWith("a") && h === 12) h = 0;
  } else {
    if (h < 0 || h > 23) return null;
  }

  return { hours: h, minutes: m };
}

function TimeInput({
  date,
  label,
  locale,
  timeZone,
  disabled,
  onTimeChange,
}: {
  date: Date | null;
  label: string;
  locale: string;
  timeZone: DatePickerTimeZone;
  disabled: boolean;
  onTimeChange: (hours: number, minutes: number) => void;
}) {
  const formatted =
    disabled && !date ? "" : formatTimeValue(date, locale, timeZone);
  const [draft, setDraft] = React.useState(formatted);
  const [hasFocus, setHasFocus] = React.useState(false);

  React.useEffect(() => {
    if (!hasFocus) setDraft(formatted);
  }, [formatted, hasFocus]);

  const placeholder = getTimePlaceholder(locale);

  function commit() {
    if (draft === formatted) return;
    const parsed = parseTimeString(draft);
    if (parsed) {
      onTimeChange(parsed.hours, parsed.minutes);
    } else {
      setDraft(formatted);
    }
  }

  return (
    <Input
      aria-label={label}
      value={draft}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setDraft(e.target.value);
      }}
      onFocus={() => setHasFocus(true)}
      onBlur={() => {
        setHasFocus(false);
        commit();
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          (e.target as HTMLInputElement).blur();
        }
      }}
    />
  );
}

function DateTimeRow({
  date,
  which,
  locale,
  timeZone,
  timeDisabled,
  onTimeChange,
  dateLabel,
  timeLabel,
  legendLabel,
}: {
  date: Date | null;
  which: "start" | "end";
  locale: string;
  timeZone: DatePickerTimeZone;
  timeDisabled: boolean;
  onTimeChange: (hours: number, minutes: number) => void;
  dateLabel: string;
  timeLabel: string;
  legendLabel: string;
}) {
  return (
    <Fieldset.Root orientation="horizontal" style={FIELDSET_GAP}>
      <Fieldset.Legend visuallyHidden>{legendLabel}</Fieldset.Legend>
      <DateInput date={date} label={dateLabel} which={which} />
      <TimeInput
        date={date}
        label={timeLabel}
        locale={locale}
        timeZone={timeZone}
        disabled={timeDisabled}
        onTimeChange={onTimeChange}
      />
    </Fieldset.Root>
  );
}

function HeaderAutoLayout() {
  const ctx = useDatePickerContext();
  const l = ctx.labels;

  if (ctx.mode === "single" && !ctx.includeTime) {
    return <DateInput date={ctx.singleValue} label={l.date} which="start" />;
  }

  if (ctx.mode === "range" && !ctx.includeTime) {
    return (
      <Fieldset.Root orientation="horizontal" style={FIELDSET_GAP}>
        <Fieldset.Legend visuallyHidden>{l.dateRange}</Fieldset.Legend>
        <DateInput
          date={ctx.rangeValue?.start ?? null}
          label={l.startDate}
          which="start"
        />
        <DateInput
          date={ctx.rangeValue?.end ?? null}
          label={l.endDate}
          which="end"
        />
      </Fieldset.Root>
    );
  }

  if (ctx.mode === "single" && ctx.includeTime) {
    return (
      <DateTimeRow
        date={ctx.singleValue}
        which="start"
        locale={ctx.locale}
        timeZone={ctx.timeZone}
        timeDisabled={false}
        onTimeChange={(h, m) => ctx.setTime("start", h, m)}
        dateLabel={l.date}
        timeLabel={l.time}
        legendLabel={l.dateAndTime}
      />
    );
  }

  // range + includeTime
  return (
    <>
      <DateTimeRow
        date={ctx.rangeValue?.start ?? null}
        which="start"
        locale={ctx.locale}
        timeZone={ctx.timeZone}
        timeDisabled={ctx.usesRangeDraftApi && !ctx.rangeValue?.start}
        onTimeChange={(h, m) => ctx.setTime("start", h, m)}
        dateLabel={l.startDate}
        timeLabel={l.startTime}
        legendLabel={l.startDateAndTime}
      />
      <DateTimeRow
        date={ctx.rangeValue?.end ?? null}
        which="end"
        locale={ctx.locale}
        timeZone={ctx.timeZone}
        timeDisabled={ctx.usesRangeDraftApi && !ctx.rangeValue?.end}
        onTimeChange={(h, m) => ctx.setTime("end", h, m)}
        dateLabel={l.endDate}
        timeLabel={l.endTime}
        legendLabel={l.endDateAndTime}
      />
    </>
  );
}

export interface DatePickerHeaderProps
  extends React.ComponentPropsWithoutRef<"div"> {}

export const Header = React.forwardRef<HTMLDivElement, DatePickerHeaderProps>(
  function DatePickerHeader({ className, children, ...props }, forwardedRef) {
    return (
      <div
        ref={forwardedRef}
        className={clsx(styles.header, className)}
        {...props}
      >
        {children ?? <HeaderAutoLayout />}
      </div>
    );
  },
);

export interface DatePickerNavigationProps
  extends React.ComponentPropsWithoutRef<"div"> {}

export const Navigation = React.forwardRef<
  HTMLDivElement,
  DatePickerNavigationProps
>(function DatePickerNavigation(props, forwardedRef) {
  const { className, ...elementProps } = props;
  const ctx = useDatePickerContext();
  const {
    viewYear,
    viewMonth,
    goToPreviousMonth,
    goToNextMonth,
    locale,
    labels,
  } = ctx;

  const monthLabel = createCalendarDate(
    viewYear,
    viewMonth,
    1,
    ctx.timeZone,
  ).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
    timeZone: ctx.timeZone === "UTC" ? "UTC" : undefined,
  });

  const isPrevDisabled = ctx.min
    ? isDateBefore(
        createCalendarDate(viewYear, viewMonth, 0, ctx.timeZone),
        ctx.min,
        ctx.timeZone,
      )
    : false;
  const isNextDisabled = ctx.max
    ? isDateBefore(
        ctx.max,
        createCalendarDate(viewYear, viewMonth + 1, 1, ctx.timeZone),
        ctx.timeZone,
      )
    : false;

  return (
    <div
      ref={forwardedRef}
      className={clsx(styles.nav, className)}
      {...elementProps}
    >
      <div className={styles.navTitle} aria-live="polite">
        {monthLabel}
      </div>
      <div className={styles.navButtons}>
        <button
          type="button"
          className={styles.navButton}
          onClick={goToPreviousMonth}
          aria-label={labels.previousMonth}
          disabled={isPrevDisabled}
        >
          <CentralIcon name="IconChevronLeft" size={16} />
        </button>
        <button
          type="button"
          className={styles.navButton}
          onClick={goToNextMonth}
          aria-label={labels.nextMonth}
          disabled={isNextDisabled}
        >
          <CentralIcon name="IconChevronRight" size={16} />
        </button>
      </div>
    </div>
  );
});

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

export interface DatePickerGridProps
  extends React.ComponentPropsWithoutRef<"table"> {
  /** Custom render function for day cell content. */
  renderDay?: (date: Date, state: DayCellState) => React.ReactNode;
}

export const Grid = React.forwardRef<HTMLTableElement, DatePickerGridProps>(
  function DatePickerGrid(props, forwardedRef) {
    const { className, renderDay, ...elementProps } = props;
    const ctx = useDatePickerContext();

    const gridRef = React.useRef<HTMLTableElement>(null);
    const mergedRef = React.useCallback(
      (node: HTMLTableElement | null) => {
        (gridRef as React.MutableRefObject<HTMLTableElement | null>).current =
          node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );

    const weeks = React.useMemo(
      () =>
        getMonthGrid(
          ctx.viewYear,
          ctx.viewMonth,
          ctx.weekStartsOn,
          ctx.timeZone,
        ),
      [ctx.viewYear, ctx.viewMonth, ctx.weekStartsOn, ctx.timeZone],
    );

    const today = React.useMemo(
      () => startOfCalendarDay(new Date(), ctx.timeZone),
      [ctx.timeZone],
    );

    const allWeekdays = React.useMemo(
      () => getWeekdayLabels(ctx.locale),
      [ctx.locale],
    );

    const weekdays = React.useMemo(() => {
      const days = [];
      for (let i = 0; i < 7; i++) {
        days.push(allWeekdays[(ctx.weekStartsOn + i) % 7]);
      }
      return days;
    }, [allWeekdays, ctx.weekStartsOn]);

    function getCellState(date: Date): DayCellState {
      const isToday = isSameDay(date, today, ctx.timeZone);
      const isOutsideMonth = !isSameMonth(
        date,
        ctx.viewYear,
        ctx.viewMonth,
        ctx.timeZone,
      );
      const isDisabled = ctx.isDateDisabled(date);

      let isSelected = false;
      let isRangeStart = false;
      let isRangeEnd = false;
      let isInRange = false;

      if (ctx.mode === "single" && ctx.singleValue) {
        isSelected = isSameDay(date, ctx.singleValue, ctx.timeZone);
      }

      if (ctx.mode === "range") {
        if (ctx.pendingStart) {
          if (ctx.hoveredDate) {
            const pStart = isDateBefore(
              ctx.hoveredDate,
              ctx.pendingStart,
              ctx.timeZone,
            )
              ? ctx.hoveredDate
              : ctx.pendingStart;
            const pEnd = isDateBefore(
              ctx.hoveredDate,
              ctx.pendingStart,
              ctx.timeZone,
            )
              ? ctx.pendingStart
              : ctx.hoveredDate;
            isRangeStart = isSameDay(date, pStart, ctx.timeZone);
            isRangeEnd = isSameDay(date, pEnd, ctx.timeZone);
            isInRange = isDateInRange(date, pStart, pEnd, ctx.timeZone);
          } else {
            isSelected = isSameDay(date, ctx.pendingStart, ctx.timeZone);
          }
        } else if (ctx.rangeValue?.start && ctx.rangeValue.end) {
          isRangeStart = isSameDay(date, ctx.rangeValue.start, ctx.timeZone);
          isRangeEnd = isSameDay(date, ctx.rangeValue.end, ctx.timeZone);
          isInRange = isDateInRange(
            date,
            ctx.rangeValue.start,
            ctx.rangeValue.end,
            ctx.timeZone,
          );
        } else if (ctx.rangeValue?.start || ctx.rangeValue?.end) {
          isSelected = isSameDay(
            date,
            ctx.rangeValue.start ?? ctx.rangeValue.end!,
            ctx.timeZone,
          );
        }
      }

      return {
        isToday,
        isOutsideMonth,
        isDisabled,
        isSelected,
        isRangeStart,
        isRangeEnd,
        isInRange,
      };
    }

    function handleKeyDown(event: React.KeyboardEvent) {
      let nextDate: Date | null;

      switch (event.key) {
        case "ArrowRight":
          nextDate = addCalendarDays(ctx.focusedDate, 1, ctx.timeZone);
          break;
        case "ArrowLeft":
          nextDate = addCalendarDays(ctx.focusedDate, -1, ctx.timeZone);
          break;
        case "ArrowDown":
          nextDate = addCalendarDays(ctx.focusedDate, 7, ctx.timeZone);
          break;
        case "ArrowUp":
          nextDate = addCalendarDays(ctx.focusedDate, -7, ctx.timeZone);
          break;
        case "PageDown":
          nextDate = event.shiftKey
            ? addCalendarMonths(ctx.focusedDate, 12, ctx.timeZone)
            : addCalendarMonths(ctx.focusedDate, 1, ctx.timeZone);
          break;
        case "PageUp":
          nextDate = event.shiftKey
            ? addCalendarMonths(ctx.focusedDate, -12, ctx.timeZone)
            : addCalendarMonths(ctx.focusedDate, -1, ctx.timeZone);
          break;
        case "Home": {
          const dayOfWeek = getCalendarDay(ctx.focusedDate, ctx.timeZone);
          const diff = (dayOfWeek - ctx.weekStartsOn + 7) % 7;
          nextDate = addCalendarDays(ctx.focusedDate, -diff, ctx.timeZone);
          break;
        }
        case "End": {
          const dayOfWeek = getCalendarDay(ctx.focusedDate, ctx.timeZone);
          const diff = (6 - dayOfWeek + ctx.weekStartsOn + 7) % 7;
          nextDate = addCalendarDays(ctx.focusedDate, diff, ctx.timeZone);
          break;
        }
        case "Enter":
        case " ":
          event.preventDefault();
          if (!ctx.isDateDisabled(ctx.focusedDate)) {
            ctx.selectDate(ctx.focusedDate);
          }
          return;
        default:
          return;
      }

      if (nextDate) {
        event.preventDefault();
        ctx.setFocusedDate(nextDate);
      }
    }

    // Keep DOM focus in sync with focusedDate when keyboard-navigating
    React.useEffect(() => {
      const grid = gridRef.current;
      if (!grid || !grid.contains(document.activeElement)) return;

      const focusTarget = grid.querySelector<HTMLButtonElement>(
        'button[tabindex="0"]',
      );
      focusTarget?.focus();
    }, [ctx.focusedDate]);

    const gridLabel = createCalendarDate(
      ctx.viewYear,
      ctx.viewMonth,
      1,
      ctx.timeZone,
    ).toLocaleDateString(ctx.locale, {
      month: "long",
      year: "numeric",
      timeZone: ctx.timeZone === "UTC" ? "UTC" : undefined,
    });

    return (
      <table
        ref={mergedRef}
        className={clsx(styles.grid, className)}
        role="grid"
        aria-label={gridLabel}
        onKeyDown={handleKeyDown}
        onMouseLeave={() => {
          if (ctx.mode === "range" && ctx.pendingStart) {
            ctx.setHoveredDate(null);
          }
        }}
        {...elementProps}
      >
        <thead>
          <tr>
            {weekdays.map((day, i) => (
              <th
                key={i}
                className={styles.weekdayCell}
                scope="col"
                abbr={day.long}
                aria-label={day.long}
              >
                {day.narrow}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi} className={styles.weekRow}>
              {week.map((date) => {
                const s = getCellState(date);
                const isFocused = isSameDay(
                  date,
                  ctx.focusedDate,
                  ctx.timeZone,
                );
                return (
                  <td key={date.getTime()} className={styles.dayCell}>
                    <button
                      type="button"
                      className={styles.dayButton}
                      tabIndex={isFocused ? 0 : -1}
                      data-today={s.isToday || undefined}
                      data-selected={s.isSelected || undefined}
                      data-range-start={s.isRangeStart || undefined}
                      data-range-end={s.isRangeEnd || undefined}
                      data-in-range={s.isInRange || undefined}
                      data-outside-month={s.isOutsideMonth || undefined}
                      data-disabled={s.isDisabled || undefined}
                      aria-selected={
                        s.isSelected ||
                        s.isRangeStart ||
                        s.isRangeEnd ||
                        s.isInRange ||
                        undefined
                      }
                      aria-disabled={s.isDisabled || undefined}
                      aria-label={date.toLocaleDateString(ctx.locale, {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        timeZone: ctx.timeZone === "UTC" ? "UTC" : undefined,
                      })}
                      onClick={() => {
                        if (!s.isDisabled) {
                          ctx.setFocusedDate(date);
                          ctx.selectDate(date);
                        }
                      }}
                      onMouseEnter={() => {
                        if (ctx.mode === "range" && ctx.pendingStart) {
                          ctx.setHoveredDate(date);
                        }
                      }}
                    >
                      {renderDay
                        ? renderDay(date, s)
                        : getCalendarDate(date, ctx.timeZone)}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Root.displayName = "DatePicker.Root";
  Header.displayName = "DatePicker.Header";
  Navigation.displayName = "DatePicker.Navigation";
  Grid.displayName = "DatePicker.Grid";
  Controls.displayName = "DatePicker.Controls";
  ControlItem.displayName = "DatePicker.ControlItem";
  Footer.displayName = "DatePicker.Footer";
}
