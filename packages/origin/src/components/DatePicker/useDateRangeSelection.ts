import * as React from "react";
import {
  getCalendarHours,
  getCalendarMinutes,
  setCalendarTime,
  type DatePickerTimeZone,
} from "./dateTimeZone";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DateRangeDraft {
  start: Date | null;
  end: Date | null;
}

interface UseDateRangeSelectionOptions {
  mode: "single" | "range";
  value: Date | DateRange | null | undefined;
  rangeDraft: DateRangeDraft | null | undefined;
  onRangeDraftChange?: ((value: DateRangeDraft) => void) | undefined;
  onCommit: (value: DateRange) => void;
  timeZone: DatePickerTimeZone;
}

interface DateRangeSelection {
  rangeValue: DateRangeDraft | null;
  emitRange: (draft: DateRangeDraft, preferredRoleTimes?: DateRange) => void;
  usesRangeDraftApi: boolean;
}

/**
 * Owns the two intentionally independent range channels. `value` is the
 * committed complete range, while `rangeDraft` may contain either bound and
 * remains authoritative whenever it is controlled. Consumers that opt into
 * either draft prop get complete-range-only commits; without the draft API, a
 * first typed bound becomes a same-day commit for legacy compatibility.
 */
export function useDateRangeSelection({
  mode,
  value,
  rangeDraft,
  onRangeDraftChange,
  onCommit,
  timeZone,
}: UseDateRangeSelectionOptions): DateRangeSelection {
  const committedRangeValue =
    mode === "range" && value && !(value instanceof Date) ? value : null;
  const isRangeValueControlled = value !== undefined;
  const isRangeDraftControlled = rangeDraft !== undefined;
  const usesRangeDraftApi =
    isRangeDraftControlled || onRangeDraftChange !== undefined;
  const [internalRangeDraft, setInternalRangeDraft] =
    React.useState<DateRangeDraft | null>(null);
  const committedStartTime = committedRangeValue?.start.getTime() ?? null;
  const committedEndTime = committedRangeValue?.end.getTime() ?? null;

  React.useEffect(() => {
    if (!isRangeDraftControlled && isRangeValueControlled) {
      setInternalRangeDraft(null);
    }
  }, [
    committedStartTime,
    committedEndTime,
    isRangeDraftControlled,
    isRangeValueControlled,
  ]);

  const rangeValue =
    mode === "range"
      ? rangeDraft !== undefined
        ? rangeDraft
        : internalRangeDraft ?? committedRangeValue
      : null;

  const emitRange = React.useCallback(
    (draft: DateRangeDraft, preferredRoleTimes?: DateRange) => {
      const onlyBound =
        draft.start && !draft.end
          ? draft.start
          : draft.end && !draft.start
          ? draft.end
          : null;
      const compatibleDraft =
        !usesRangeDraftApi && onlyBound
          ? { start: new Date(onlyBound), end: new Date(onlyBound) }
          : draft;

      if (!compatibleDraft.start || !compatibleDraft.end) {
        onRangeDraftChange?.(compatibleDraft);
        if (!isRangeDraftControlled) {
          setInternalRangeDraft(compatibleDraft);
        }
        return;
      }

      const ordered = orderDateRange(
        { start: compatibleDraft.start, end: compatibleDraft.end },
        preferredRoleTimes,
        timeZone,
      );
      onRangeDraftChange?.(ordered);
      if (!isRangeDraftControlled) {
        if (isRangeValueControlled) {
          setInternalRangeDraft(null);
        } else {
          setInternalRangeDraft(ordered);
        }
      }
      onCommit(ordered);
    },
    [
      isRangeValueControlled,
      isRangeDraftControlled,
      onRangeDraftChange,
      onCommit,
      timeZone,
      usesRangeDraftApi,
    ],
  );

  return React.useMemo(
    () => ({ rangeValue, emitRange, usesRangeDraftApi }),
    [rangeValue, emitRange, usesRangeDraftApi],
  );
}

/**
 * Canonicalize a complete range by full instant. Date edits may provide the
 * previous role times: after swapping calendar bounds, keep start/end times
 * in their roles when that still produces an ordered range. Same-day
 * collapses fall back to swapping the full instants.
 */
function orderDateRange(
  range: DateRange,
  preferredRoleTimes?: DateRange,
  timeZone: DatePickerTimeZone = "local",
): DateRange {
  if (range.start.getTime() <= range.end.getTime()) {
    return range;
  }

  const swapped = {
    start: new Date(range.end),
    end: new Date(range.start),
  };
  if (!preferredRoleTimes) {
    return swapped;
  }

  const roleTimed = {
    start: setCalendarTime(
      swapped.start,
      getCalendarHours(preferredRoleTimes.start, timeZone),
      getCalendarMinutes(preferredRoleTimes.start, timeZone),
      timeZone,
    ),
    end: setCalendarTime(
      swapped.end,
      getCalendarHours(preferredRoleTimes.end, timeZone),
      getCalendarMinutes(preferredRoleTimes.end, timeZone),
      timeZone,
    ),
  };
  return roleTimed.start.getTime() <= roleTimed.end.getTime()
    ? roleTimed
    : swapped;
}
