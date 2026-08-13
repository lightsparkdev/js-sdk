"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import type { BaseUIEvent } from "@base-ui/react/types";
import clsx from "clsx";
import { CentralIcon } from "../Icon";
import styles from "./DatePicker.module.scss";
import { type DayCellState, useDatePickerContext } from "./datePickerContext";
import {
  addCalendarDays,
  addCalendarMonths,
  createCalendarDate,
  getCalendarDate,
  getCalendarDay,
  getCalendarMonth,
  getCalendarYear,
  startOfCalendarDay,
  type DatePickerTimeZone,
} from "./dateTimeZone";

const MAX_KEYBOARD_NAVIGATION_SEARCH_DAYS = 366 * 10;
const KNOWN_SUNDAY = new Date(2024, 0, 7);
const DAY_MS = 86_400_000;
const weekdayCache = new Map<string, { narrow: string; long: string }[]>();

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
  const timestamp = startOfCalendarDay(date, timeZone).getTime();
  return (
    timestamp > startOfCalendarDay(start, timeZone).getTime() &&
    timestamp < startOfCalendarDay(end, timeZone).getTime()
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
  for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
    const week: Date[] = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      week.push(new Date(current));
      current = addCalendarDays(current, 1, timeZone);
    }
    weeks.push(week);
  }
  return weeks;
}

function getWeekdayLabels(locale: string): { narrow: string; long: string }[] {
  const cached = weekdayCache.get(locale);
  if (cached) return cached;

  const longFormatter = new Intl.DateTimeFormat(locale, { weekday: "long" });
  const narrowFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "narrow",
  });
  const result = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(KNOWN_SUNDAY.getTime() + index * DAY_MS);
    return {
      narrow: narrowFormatter.format(date),
      long: longFormatter.format(date),
    };
  });
  weekdayCache.set(locale, result);
  return result;
}

export interface DatePickerNavigationProps
  extends React.ComponentPropsWithoutRef<"div"> {}

export const Navigation = React.forwardRef<
  HTMLDivElement,
  DatePickerNavigationProps
>(function DatePickerNavigation(props, forwardedRef) {
  const { className, ...elementProps } = props;
  const context = useDatePickerContext();
  const {
    viewYear,
    viewMonth,
    goToPreviousMonth,
    goToNextMonth,
    locale,
    labels,
  } = context;

  const monthLabel = createCalendarDate(
    viewYear,
    viewMonth,
    1,
    context.timeZone,
  ).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
    timeZone: context.timeZone === "UTC" ? "UTC" : undefined,
  });

  const isPreviousDisabled = context.min
    ? isDateBefore(
        createCalendarDate(viewYear, viewMonth, 0, context.timeZone),
        context.min,
        context.timeZone,
      )
    : false;
  const isNextDisabled = context.max
    ? isDateBefore(
        context.max,
        createCalendarDate(viewYear, viewMonth + 1, 1, context.timeZone),
        context.timeZone,
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
          disabled={isPreviousDisabled}
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

export interface DatePickerGridProps
  extends Omit<
    React.ComponentPropsWithoutRef<"table">,
    "onKeyDown" | "onMouseLeave"
  > {
  /** Custom render function for day cell content. */
  renderDay?: (date: Date, state: DayCellState) => React.ReactNode;
  onKeyDown?: (
    event: BaseUIEvent<React.KeyboardEvent<HTMLTableElement>>,
  ) => void;
  onMouseLeave?: (
    event: BaseUIEvent<React.MouseEvent<HTMLTableElement>>,
  ) => void;
}

export const Grid = React.forwardRef<HTMLTableElement, DatePickerGridProps>(
  function DatePickerGrid(props, forwardedRef) {
    const { className, renderDay, ...elementProps } = props;
    const context = useDatePickerContext();

    const gridRef = React.useRef<HTMLTableElement>(null);
    const restoreGridFocus = React.useRef(false);
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
          context.viewYear,
          context.viewMonth,
          context.weekStartsOn,
          context.timeZone,
        ),
      [
        context.viewYear,
        context.viewMonth,
        context.weekStartsOn,
        context.timeZone,
      ],
    );

    const today = React.useMemo(
      () => startOfCalendarDay(new Date(), context.timeZone),
      [context.timeZone],
    );

    const allWeekdays = React.useMemo(
      () => getWeekdayLabels(context.locale),
      [context.locale],
    );

    const weekdays = React.useMemo(() => {
      const days = [];
      for (let index = 0; index < 7; index++) {
        days.push(allWeekdays[(context.weekStartsOn + index) % 7]);
      }
      return days;
    }, [allWeekdays, context.weekStartsOn]);

    function getCellState(date: Date): DayCellState {
      const isToday = isSameDay(date, today, context.timeZone);
      const isOutsideMonth = !isSameMonth(
        date,
        context.viewYear,
        context.viewMonth,
        context.timeZone,
      );
      const isDisabled = context.isDateDisabled(date);

      let isSelected = false;
      let isRangeStart = false;
      let isRangeEnd = false;
      let isInRange = false;

      if (context.mode === "single" && context.singleValue) {
        isSelected = isSameDay(date, context.singleValue, context.timeZone);
      }

      if (context.mode === "range") {
        if (context.rangePreviewAnchor) {
          if (context.hoveredDate) {
            const previewStart = isDateBefore(
              context.hoveredDate,
              context.rangePreviewAnchor,
              context.timeZone,
            )
              ? context.hoveredDate
              : context.rangePreviewAnchor;
            const previewEnd = isDateBefore(
              context.hoveredDate,
              context.rangePreviewAnchor,
              context.timeZone,
            )
              ? context.rangePreviewAnchor
              : context.hoveredDate;
            isRangeStart = isSameDay(date, previewStart, context.timeZone);
            isRangeEnd = isSameDay(date, previewEnd, context.timeZone);
            isInRange = isDateInRange(
              date,
              previewStart,
              previewEnd,
              context.timeZone,
            );
          } else {
            isSelected = isSameDay(
              date,
              context.rangePreviewAnchor,
              context.timeZone,
            );
          }
        } else if (context.rangeValue?.start && context.rangeValue.end) {
          isRangeStart = isSameDay(
            date,
            context.rangeValue.start,
            context.timeZone,
          );
          isRangeEnd = isSameDay(
            date,
            context.rangeValue.end,
            context.timeZone,
          );
          isInRange = isDateInRange(
            date,
            context.rangeValue.start,
            context.rangeValue.end,
            context.timeZone,
          );
        } else if (context.rangeValue?.start || context.rangeValue?.end) {
          isSelected = isSameDay(
            date,
            context.rangeValue.start ?? context.rangeValue.end!,
            context.timeZone,
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

    function findEnabledDate(
      start: Date,
      direction: 1 | -1,
      maxSteps = MAX_KEYBOARD_NAVIGATION_SEARCH_DAYS,
    ): Date | null {
      let candidate = start;
      for (let step = 0; step <= maxSteps; step += 1) {
        const isBeforeMin =
          context.min && isDateBefore(candidate, context.min, context.timeZone);
        const isAfterMax =
          context.max && isDateBefore(context.max, candidate, context.timeZone);
        if (
          (isBeforeMin && direction === -1) ||
          (isAfterMax && direction === 1)
        ) {
          return null;
        }
        if (!isBeforeMin && !isAfterMax && !context.isDateDisabled(candidate)) {
          return candidate;
        }
        candidate = addCalendarDays(candidate, direction, context.timeZone);
      }
      return null;
    }

    function findNearestEnabledInMonth(target: Date): Date | null {
      const targetYear = getCalendarYear(target, context.timeZone);
      const targetMonth = getCalendarMonth(target, context.timeZone);
      const lastDay = getCalendarDate(
        createCalendarDate(targetYear, targetMonth + 1, 0, context.timeZone),
        context.timeZone,
      );
      for (let distance = 0; distance < lastDay; distance += 1) {
        const forward = addCalendarDays(target, distance, context.timeZone);
        if (
          isSameMonth(forward, targetYear, targetMonth, context.timeZone) &&
          !context.isDateDisabled(forward)
        ) {
          return forward;
        }
        if (distance > 0) {
          const backward = addCalendarDays(target, -distance, context.timeZone);
          if (
            isSameMonth(backward, targetYear, targetMonth, context.timeZone) &&
            !context.isDateDisabled(backward)
          ) {
            return backward;
          }
        }
      }
      return null;
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLTableElement>) {
      if (event.defaultPrevented) return;
      let nextDate: Date | null;

      switch (event.key) {
        case "ArrowRight":
          nextDate = findEnabledDate(
            addCalendarDays(context.focusedDate, 1, context.timeZone),
            1,
          );
          break;
        case "ArrowLeft":
          nextDate = findEnabledDate(
            addCalendarDays(context.focusedDate, -1, context.timeZone),
            -1,
          );
          break;
        case "ArrowDown":
          nextDate = findEnabledDate(
            addCalendarDays(context.focusedDate, 7, context.timeZone),
            1,
          );
          break;
        case "ArrowUp":
          nextDate = findEnabledDate(
            addCalendarDays(context.focusedDate, -7, context.timeZone),
            -1,
          );
          break;
        case "PageDown":
          nextDate = findNearestEnabledInMonth(
            addCalendarMonths(
              context.focusedDate,
              event.shiftKey ? 12 : 1,
              context.timeZone,
            ),
          );
          break;
        case "PageUp":
          nextDate = findNearestEnabledInMonth(
            addCalendarMonths(
              context.focusedDate,
              event.shiftKey ? -12 : -1,
              context.timeZone,
            ),
          );
          break;
        case "Home": {
          const dayOfWeek = getCalendarDay(
            context.focusedDate,
            context.timeZone,
          );
          const difference = (dayOfWeek - context.weekStartsOn + 7) % 7;
          nextDate = findEnabledDate(
            addCalendarDays(context.focusedDate, -difference, context.timeZone),
            1,
            6,
          );
          break;
        }
        case "End": {
          const dayOfWeek = getCalendarDay(
            context.focusedDate,
            context.timeZone,
          );
          const difference = (6 - dayOfWeek + context.weekStartsOn + 7) % 7;
          nextDate = findEnabledDate(
            addCalendarDays(context.focusedDate, difference, context.timeZone),
            -1,
            6,
          );
          break;
        }
        case "Enter":
        case " ":
          event.preventDefault();
          if (!context.isDateDisabled(context.focusedDate)) {
            context.selectDate(context.focusedDate);
          }
          return;
        default:
          return;
      }

      event.preventDefault();
      if (nextDate) {
        restoreGridFocus.current = true;
        context.setFocusedDate(nextDate);
        if (context.mode === "range" && context.rangePreviewAnchor) {
          context.setHoveredDate(nextDate);
        }
      }
    }

    function handleMouseLeave(event: React.MouseEvent<HTMLTableElement>) {
      if (event.defaultPrevented) return;
      if (context.mode === "range" && context.rangePreviewAnchor) {
        context.setHoveredDate(null);
      }
    }

    React.useEffect(() => {
      const grid = gridRef.current;
      if (
        !grid ||
        (!restoreGridFocus.current && !grid.contains(document.activeElement))
      ) {
        return;
      }

      const focusTarget = grid.querySelector<HTMLButtonElement>(
        'button[tabindex="0"]',
      );
      focusTarget?.focus();
      restoreGridFocus.current = false;
    }, [context.focusedDate, context.viewMonth, context.viewYear]);

    const gridLabel = createCalendarDate(
      context.viewYear,
      context.viewMonth,
      1,
      context.timeZone,
    ).toLocaleDateString(context.locale, {
      month: "long",
      year: "numeric",
      timeZone: context.timeZone === "UTC" ? "UTC" : undefined,
    });
    const mergedEventHandlers = mergeProps<"table">(
      {
        onKeyDown: handleKeyDown,
        onMouseLeave: handleMouseLeave,
      },
      {
        onKeyDown: elementProps.onKeyDown,
        onMouseLeave: elementProps.onMouseLeave,
      },
    );

    return (
      <table
        ref={mergedRef}
        className={clsx(styles.grid, className)}
        role="grid"
        aria-label={gridLabel}
        {...elementProps}
        onKeyDown={mergedEventHandlers.onKeyDown}
        onMouseLeave={mergedEventHandlers.onMouseLeave}
      >
        <thead>
          <tr>
            {weekdays.map((day, index) => (
              <th
                key={index}
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
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex} className={styles.weekRow}>
              {week.map((date) => {
                const state = getCellState(date);
                const isFocused = isSameDay(
                  date,
                  context.focusedDate,
                  context.timeZone,
                );
                return (
                  <td key={date.getTime()} className={styles.dayCell}>
                    <button
                      type="button"
                      className={styles.dayButton}
                      tabIndex={isFocused ? 0 : -1}
                      data-today={state.isToday || undefined}
                      data-selected={state.isSelected || undefined}
                      data-range-start={state.isRangeStart || undefined}
                      data-range-end={state.isRangeEnd || undefined}
                      data-in-range={state.isInRange || undefined}
                      data-outside-month={state.isOutsideMonth || undefined}
                      data-disabled={state.isDisabled || undefined}
                      aria-current={state.isToday ? "date" : undefined}
                      aria-selected={
                        state.isSelected ||
                        state.isRangeStart ||
                        state.isRangeEnd ||
                        state.isInRange ||
                        undefined
                      }
                      aria-disabled={state.isDisabled || undefined}
                      aria-label={date.toLocaleDateString(context.locale, {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        timeZone:
                          context.timeZone === "UTC" ? "UTC" : undefined,
                      })}
                      onClick={() => {
                        if (!state.isDisabled) {
                          context.setFocusedDate(date);
                          context.selectDate(date);
                        }
                      }}
                      onMouseEnter={() => {
                        if (
                          context.mode === "range" &&
                          context.rangePreviewAnchor
                        ) {
                          context.setHoveredDate(date);
                        }
                      }}
                    >
                      {renderDay
                        ? renderDay(date, state)
                        : getCalendarDate(date, context.timeZone)}
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
  Navigation.displayName = "DatePicker.Navigation";
  Grid.displayName = "DatePicker.Grid";
}
