const SECOND = 1000; // milliseconds
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

export enum TimeGranularity {
  Minutes = "minutes",
  Hours = "hours",
  Days = "days",
}

const GRANULARITY_TO_MILLIS: { [key in TimeGranularity]: number } = {
  [TimeGranularity.Minutes]: MINUTE,
  [TimeGranularity.Hours]: HOUR,
  [TimeGranularity.Days]: DAY,
};

export const MAX_DATE = new Date("3000-01-01");
export const MIN_DATE = new Date("1900-01-01");

export const subtractTime = (
  date: Date,
  value: number,
  granularity: TimeGranularity,
) => {
  return new Date(date.getTime() - value * GRANULARITY_TO_MILLIS[granularity]);
};

export const startOfDay = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const endOfDay = (date: Date) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

export enum DateRangeOperation {
  IsInTheLast = "is in the last",
  IsEqualTo = "is equal to",
  IsBetween = "is between",
  IsAfter = "is after",
  IsBefore = "is before",
}

interface CustomDateRangeDataBase {
  type: DateRangeOperation;
}

export interface IsInTheLastData extends CustomDateRangeDataBase {
  type: DateRangeOperation.IsInTheLast;
  value: number;
  granularity: TimeGranularity;
}

export interface IsEqualToData extends CustomDateRangeDataBase {
  type: DateRangeOperation.IsEqualTo;
  date: Date;
}

export interface IsBetweenData extends CustomDateRangeDataBase {
  type: DateRangeOperation.IsBetween;
  start: Date;
  end: Date;
}

export interface IsAfterData extends CustomDateRangeDataBase {
  type: DateRangeOperation.IsAfter;
  date: Date;
}

export interface IsBeforeData extends CustomDateRangeDataBase {
  type: DateRangeOperation.IsBefore;
  date: Date;
}

export type CustomDateRangeData =
  | IsInTheLastData
  | IsEqualToData
  | IsBetweenData
  | IsAfterData
  | IsBeforeData;
