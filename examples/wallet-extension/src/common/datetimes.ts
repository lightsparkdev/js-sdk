import { Maybe } from "./types";
import day from "dayjs";
import utc from "dayjs/plugin/utc";

const NOT_APPLICABLE = "-";

day.extend(utc);

export const formatDateTime = (
  datetime: string,
  format: string,
  toUserTime: boolean = true
): string => {
  let time_val = day(datetime).utc();
  if (toUserTime) {
    time_val = day(time_val).local();
  }
  return time_val.format(format);
};

export const getFormattedDateTimeOrDefault = (
    datetime: Maybe<string>,
    format: string
  ): string => {
    return datetime === undefined || datetime === null || datetime === ""
      ? NOT_APPLICABLE
      : formatDateTime(datetime, format);
  };