export type DatePickerTimeZone = "local" | "UTC";

export function getCalendarYear(
  date: Date,
  timeZone: DatePickerTimeZone,
): number {
  return timeZone === "UTC" ? date.getUTCFullYear() : date.getFullYear();
}

export function getCalendarMonth(
  date: Date,
  timeZone: DatePickerTimeZone,
): number {
  return timeZone === "UTC" ? date.getUTCMonth() : date.getMonth();
}

export function getCalendarDate(
  date: Date,
  timeZone: DatePickerTimeZone,
): number {
  return timeZone === "UTC" ? date.getUTCDate() : date.getDate();
}

export function getCalendarDay(
  date: Date,
  timeZone: DatePickerTimeZone,
): number {
  return timeZone === "UTC" ? date.getUTCDay() : date.getDay();
}

export function getCalendarHours(
  date: Date,
  timeZone: DatePickerTimeZone,
): number {
  return timeZone === "UTC" ? date.getUTCHours() : date.getHours();
}

export function getCalendarMinutes(
  date: Date,
  timeZone: DatePickerTimeZone,
): number {
  return timeZone === "UTC" ? date.getUTCMinutes() : date.getMinutes();
}

export function createCalendarDate(
  year: number,
  month: number,
  day: number,
  timeZone: DatePickerTimeZone,
  hours = 0,
  minutes = 0,
): Date {
  return timeZone === "UTC"
    ? new Date(Date.UTC(year, month, day, hours, minutes))
    : new Date(year, month, day, hours, minutes);
}

export function startOfCalendarDay(
  date: Date,
  timeZone: DatePickerTimeZone,
): Date {
  return createCalendarDate(
    getCalendarYear(date, timeZone),
    getCalendarMonth(date, timeZone),
    getCalendarDate(date, timeZone),
    timeZone,
  );
}

export function setCalendarTime(
  date: Date,
  hours: number,
  minutes: number,
  timeZone: DatePickerTimeZone,
): Date {
  const next = new Date(date);
  if (timeZone === "UTC") {
    next.setUTCHours(hours, minutes, 0, 0);
  } else {
    next.setHours(hours, minutes, 0, 0);
  }
  return next;
}

export function addCalendarDays(
  date: Date,
  days: number,
  timeZone: DatePickerTimeZone,
): Date {
  const next = new Date(date);
  if (timeZone === "UTC") {
    next.setUTCDate(next.getUTCDate() + days);
  } else {
    next.setDate(next.getDate() + days);
  }
  return next;
}

export function addCalendarMonths(
  date: Date,
  months: number,
  timeZone: DatePickerTimeZone,
): Date {
  const next = new Date(date);
  const currentMonth = getCalendarMonth(next, timeZone);
  const targetMonth = currentMonth + months;
  if (timeZone === "UTC") {
    next.setUTCMonth(targetMonth);
    if (next.getUTCMonth() !== ((targetMonth % 12) + 12) % 12) {
      next.setUTCDate(0);
    }
  } else {
    next.setMonth(targetMonth);
    if (next.getMonth() !== ((targetMonth % 12) + 12) % 12) {
      next.setDate(0);
    }
  }
  return next;
}
