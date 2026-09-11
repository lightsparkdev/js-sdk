import type { DateRangeEndpoint } from "./datePickerContext";
import {
  getCalendarHours,
  getCalendarMinutes,
  setCalendarTime,
  type DatePickerTimeZone,
} from "./dateTimeZone";
import type { DateRange, DateRangeDraft } from "./useDateRangeSelection";

export function replaceRangeEndpoint({
  current,
  date,
  defaultTime,
  endpoint,
  includeTime,
  timeZone,
}: {
  current: DateRangeDraft;
  date: Date;
  defaultTime?: Date | null;
  endpoint: DateRangeEndpoint;
  includeTime: boolean;
  timeZone: DatePickerTimeZone;
}): { value: DateRangeDraft; preferredRoleTimes?: DateRange } {
  const existing = endpoint === "start" ? current.start : current.end;
  const timeSource = existing ?? defaultTime;
  const nextDate =
    includeTime && timeSource
      ? setCalendarTime(
          date,
          getCalendarHours(timeSource, timeZone),
          getCalendarMinutes(timeSource, timeZone),
          timeZone,
        )
      : new Date(date);
  const value = {
    start:
      endpoint === "start"
        ? nextDate
        : current.start
        ? new Date(current.start)
        : null,
    end:
      endpoint === "end"
        ? nextDate
        : current.end
        ? new Date(current.end)
        : null,
  };
  const preferredRoleTimes =
    current.start && current.end
      ? { start: current.start, end: current.end }
      : undefined;
  return {
    value,
    ...(preferredRoleTimes ? { preferredRoleTimes } : {}),
  };
}
