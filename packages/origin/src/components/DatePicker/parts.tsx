"use client";

import * as React from "react";
import clsx from "clsx";
import { CentralIcon } from "../Icon";
import { Input } from "../Input";
import { Fieldset } from "../Fieldset";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import styles from "./DatePicker.module.scss";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month;
}

function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const t = startOfDay(date).getTime();
  return t > startOfDay(start).getTime() && t < startOfDay(end).getTime();
}

function isDateBefore(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const targetMonth = d.getMonth() + months;
  d.setMonth(targetMonth);
  // Clamp day if overflowed (e.g. Jan 31 + 1 month → Mar 3 → clamp to Feb 28)
  if (d.getMonth() !== ((targetMonth % 12) + 12) % 12) {
    d.setDate(0); // last day of previous month
  }
  return d;
}

function getMonthGrid(
  year: number,
  month: number,
  weekStartsOn: 0 | 1,
): Date[][] {
  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() - weekStartsOn + 7) % 7;
  const gridStart = addDays(firstDay, -offset);

  const weeks: Date[][] = [];
  let current = new Date(gridStart);
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(current));
      current = addDays(current, 1);
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

export interface DateRange {
  start: Date;
  end: Date;
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
  /** Selected date (single) or range (range mode). */
  value?: Date | DateRange | null;
  /** Called when selection changes. Receives Date in single mode, DateRange in range mode. */
  onValueChange?: (value: Date | DateRange) => void;
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
  singleValue: Date | null;
  rangeValue: DateRange | null;
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
  min?: Date;
  max?: Date;

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
      value: valueProp,
      onValueChange,
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
    const rangeValue =
      mode === "range" && valueProp && !(valueProp instanceof Date)
        ? valueProp
        : null;

    // View state
    const initialMonth = React.useMemo(() => {
      if (monthProp) return monthProp;
      if (defaultMonth) return defaultMonth;
      if (singleValue) return singleValue;
      if (rangeValue) return rangeValue.start;
      return new Date();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [viewDate, setViewDate] = React.useState(
      () => new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1),
    );

    // Controlled month: sync external prop to internal state
    React.useEffect(() => {
      if (monthProp !== undefined) {
        setViewDate(new Date(monthProp.getFullYear(), monthProp.getMonth(), 1));
      }
    }, [monthProp]);

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
      if (singleValue) return startOfDay(singleValue);
      if (rangeValue) return startOfDay(rangeValue.start);
      const today = startOfDay(new Date());
      if (
        today.getFullYear() === initialMonth.getFullYear() &&
        today.getMonth() === initialMonth.getMonth()
      ) {
        return today;
      }
      return new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1);
    });

    // Range selection state
    const [pendingStart, setPendingStart] = React.useState<Date | null>(null);
    const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null);

    React.useEffect(() => {
      setPendingStart(null);
      setHoveredDate(null);
    }, [mode]);

    const viewYear = viewDate.getFullYear();
    const viewMonth = viewDate.getMonth();

    const setFocusedDate = React.useCallback((date: Date) => {
      const normalized = startOfDay(date);
      setFocusedDateState(normalized);
      setViewDate(new Date(normalized.getFullYear(), normalized.getMonth(), 1));
    }, []);

    const goToMonth = React.useCallback((offset: number) => {
      setViewDate((prev) => addMonths(prev, offset));
      setFocusedDateState((prev) => {
        const target = addMonths(prev, offset);
        const lastDay = new Date(
          target.getFullYear(),
          target.getMonth() + 1,
          0,
        ).getDate();
        return new Date(
          target.getFullYear(),
          target.getMonth(),
          Math.min(prev.getDate(), lastDay),
        );
      });
    }, []);

    const goToPreviousMonth = React.useCallback(
      () => goToMonth(-1),
      [goToMonth],
    );
    const goToNextMonth = React.useCallback(() => goToMonth(1), [goToMonth]);

    const isDateDisabled = React.useCallback(
      (date: Date): boolean => {
        if (disabled?.(date)) return true;
        if (min && isDateBefore(date, min)) return true;
        if (max && isDateBefore(max, date)) return true;
        return false;
      },
      [disabled, min, max],
    );

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

    const selectDate = React.useCallback(
      (date: Date) => {
        if (isDateDisabled(date)) return;

        function applyTime(target: Date, source: Date | null): Date {
          if (!includeTime) return startOfDay(target);
          const d = new Date(target);
          d.setHours(0, 0, 0, 0);
          const ref = source ?? new Date();
          d.setHours(ref.getHours(), ref.getMinutes());
          return d;
        }

        if (mode === "single") {
          trackedSelect(applyTime(date, singleValue));
          return;
        }

        // Range mode
        if (pendingStart === null) {
          setPendingStart(startOfDay(date));
        } else {
          const reversed = isDateBefore(date, pendingStart);
          const startDate = reversed ? date : pendingStart;
          const endDate = reversed ? pendingStart : date;
          const start = applyTime(startDate, rangeValue?.start ?? null);
          const end = applyTime(endDate, rangeValue?.end ?? null);
          trackedSelect({ start, end });
          setPendingStart(null);
          setHoveredDate(null);
        }
      },
      [
        mode,
        includeTime,
        pendingStart,
        singleValue,
        rangeValue,
        isDateDisabled,
        trackedSelect,
      ],
    );

    const setDate = React.useCallback(
      (which: "start" | "end", date: Date) => {
        setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));

        if (mode === "single") {
          const d = new Date(date);
          if (includeTime && singleValue) {
            d.setHours(singleValue.getHours(), singleValue.getMinutes(), 0, 0);
          }
          trackedSelect(d);
        } else {
          const current = rangeValue ?? { start: date, end: date };
          const newRange = {
            start: new Date(current.start),
            end: new Date(current.end),
          };
          const d = new Date(date);
          const existing = which === "start" ? current.start : current.end;
          if (includeTime) {
            d.setHours(existing.getHours(), existing.getMinutes(), 0, 0);
          }
          if (which === "start") newRange.start = d;
          else newRange.end = d;
          const swapped = isDateBefore(newRange.end, newRange.start);
          if (swapped) {
            const tmp = newRange.start;
            newRange.start = newRange.end;
            newRange.end = tmp;
          }
          if (swapped && includeTime) {
            newRange.start.setHours(
              current.start.getHours(),
              current.start.getMinutes(),
              0,
              0,
            );
            newRange.end.setHours(
              current.end.getHours(),
              current.end.getMinutes(),
              0,
              0,
            );
          }
          trackedSelect(newRange);
        }
      },
      [mode, includeTime, singleValue, rangeValue, trackedSelect],
    );

    const setTime = React.useCallback(
      (which: "start" | "end", hours: number, minutes: number) => {
        if (mode === "single") {
          const base = singleValue
            ? new Date(singleValue)
            : startOfDay(new Date());
          base.setHours(hours, minutes, 0, 0);
          trackedSelect(base);
        } else {
          const today = startOfDay(new Date());
          const current = rangeValue ?? {
            start: new Date(today),
            end: new Date(today),
          };
          const newRange = {
            start: new Date(current.start),
            end: new Date(current.end),
          };
          const target = which === "start" ? newRange.start : newRange.end;
          target.setHours(hours, minutes, 0, 0);
          trackedSelect(newRange);
        }
      },
      [mode, singleValue, rangeValue, trackedSelect],
    );

    const contextValue = React.useMemo<DatePickerContextValue>(
      () => ({
        viewYear,
        viewMonth,
        goToPreviousMonth,
        goToNextMonth,
        mode,
        includeTime,
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

function formatDateValue(date: Date | null, locale: string): string {
  const d = date ?? new Date();
  return d.toLocaleDateString(locale, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

function parseDateString(input: string, locale: string): Date | null {
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

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
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
  const formatted = formatDateValue(date, ctx.locale);
  const [draft, setDraft] = React.useState(formatted);
  const [hasFocus, setHasFocus] = React.useState(false);

  React.useEffect(() => {
    if (!hasFocus) setDraft(formatted);
  }, [formatted, hasFocus]);

  const { placeholder } = getDateFormat(ctx.locale);

  function commit() {
    if (draft === formatted) return;
    const parsed = parseDateString(draft, ctx.locale);
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

function formatTimeValue(date: Date | null, locale: string): string {
  const d = date ?? new Date();
  return d.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
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
  onTimeChange,
}: {
  date: Date | null;
  label: string;
  locale: string;
  onTimeChange: (hours: number, minutes: number) => void;
}) {
  const formatted = formatTimeValue(date, locale);
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
  onTimeChange,
  dateLabel,
  timeLabel,
  legendLabel,
}: {
  date: Date | null;
  which: "start" | "end";
  locale: string;
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
        onTimeChange={(h, m) => ctx.setTime("start", h, m)}
        dateLabel={l.startDate}
        timeLabel={l.startTime}
        legendLabel={l.startDateAndTime}
      />
      <DateTimeRow
        date={ctx.rangeValue?.end ?? null}
        which="end"
        locale={ctx.locale}
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

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    locale,
    { month: "long", year: "numeric" },
  );

  const isPrevDisabled = ctx.min
    ? isDateBefore(new Date(viewYear, viewMonth, 0), ctx.min)
    : false;
  const isNextDisabled = ctx.max
    ? isDateBefore(ctx.max, new Date(viewYear, viewMonth + 1, 1))
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
      () => getMonthGrid(ctx.viewYear, ctx.viewMonth, ctx.weekStartsOn),
      [ctx.viewYear, ctx.viewMonth, ctx.weekStartsOn],
    );

    const today = React.useMemo(() => startOfDay(new Date()), []);

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
      const isToday = isSameDay(date, today);
      const isOutsideMonth = !isSameMonth(date, ctx.viewYear, ctx.viewMonth);
      const isDisabled = ctx.isDateDisabled(date);

      let isSelected = false;
      let isRangeStart = false;
      let isRangeEnd = false;
      let isInRange = false;

      if (ctx.mode === "single" && ctx.singleValue) {
        isSelected = isSameDay(date, ctx.singleValue);
      }

      if (ctx.mode === "range") {
        if (ctx.pendingStart) {
          if (ctx.hoveredDate) {
            const pStart = isDateBefore(ctx.hoveredDate, ctx.pendingStart)
              ? ctx.hoveredDate
              : ctx.pendingStart;
            const pEnd = isDateBefore(ctx.hoveredDate, ctx.pendingStart)
              ? ctx.pendingStart
              : ctx.hoveredDate;
            isRangeStart = isSameDay(date, pStart);
            isRangeEnd = isSameDay(date, pEnd);
            isInRange = isDateInRange(date, pStart, pEnd);
          } else {
            isSelected = isSameDay(date, ctx.pendingStart);
          }
        } else if (ctx.rangeValue) {
          isRangeStart = isSameDay(date, ctx.rangeValue.start);
          isRangeEnd = isSameDay(date, ctx.rangeValue.end);
          isInRange = isDateInRange(
            date,
            ctx.rangeValue.start,
            ctx.rangeValue.end,
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
          nextDate = addDays(ctx.focusedDate, 1);
          break;
        case "ArrowLeft":
          nextDate = addDays(ctx.focusedDate, -1);
          break;
        case "ArrowDown":
          nextDate = addDays(ctx.focusedDate, 7);
          break;
        case "ArrowUp":
          nextDate = addDays(ctx.focusedDate, -7);
          break;
        case "PageDown":
          nextDate = event.shiftKey
            ? addMonths(ctx.focusedDate, 12)
            : addMonths(ctx.focusedDate, 1);
          break;
        case "PageUp":
          nextDate = event.shiftKey
            ? addMonths(ctx.focusedDate, -12)
            : addMonths(ctx.focusedDate, -1);
          break;
        case "Home": {
          const dayOfWeek = ctx.focusedDate.getDay();
          const diff = (dayOfWeek - ctx.weekStartsOn + 7) % 7;
          nextDate = addDays(ctx.focusedDate, -diff);
          break;
        }
        case "End": {
          const dayOfWeek = ctx.focusedDate.getDay();
          const diff = (6 - dayOfWeek + ctx.weekStartsOn + 7) % 7;
          nextDate = addDays(ctx.focusedDate, diff);
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

    const gridLabel = new Date(
      ctx.viewYear,
      ctx.viewMonth,
      1,
    ).toLocaleDateString(ctx.locale, { month: "long", year: "numeric" });

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
                const isFocused = isSameDay(date, ctx.focusedDate);
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
                      {renderDay ? renderDay(date, s) : date.getDate()}
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
