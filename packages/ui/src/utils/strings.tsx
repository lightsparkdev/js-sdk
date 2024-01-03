// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type Maybe } from "../types/utils.js";

export const capitalize = (str: string): string => {
  if (str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const makeEnumPretty = (
  enumValue: string,
  capitalizeAllWords: boolean = true,
): string => {
  let formatted = enumValue.toLowerCase().split("_");
  if (capitalizeAllWords) {
    formatted = formatted.map((word) => capitalize(word));
  } else if (formatted.length > 0) {
    formatted[0] = capitalize(formatted[0]);
  }
  return formatted.join(" ");
};

// Keep the first and optionally last characters of a long string with
// elispses in the middle.
export const elide = (
  s: Maybe<string>,
  first: number,
  last?: number,
): Maybe<string> => {
  if (s === undefined || s === null) return s;
  return s.substring(0, first) + "..." + s.substring(s.length - (last ?? 0));
};

export function removeChars(
  value: string,
  beginIndex: number,
  endIndex?: number,
): string {
  return value.slice(0, beginIndex) + value.slice(endIndex || beginIndex + 1);
}

export function isString(str: unknown): str is string {
  return typeof str === "string";
}

export function removeCommas(value: string): string {
  return value.replace(/,/g, "");
}

export function addCommasToDigits(value: string | number): string {
  if (typeof value === "number") {
    value = value.toString();
  }
  const existingCommasRemoved = removeCommas(value);
  const [int, decimal] = existingCommasRemoved.split(".");
  const intWithCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimal ? `${intWithCommas}.${decimal}` : intWithCommas;
}

export function removeLeadingZeros(value: string): string {
  if (value.length > 1) {
    return value.replace(/^0+(?=\d)/, "");
  }

  return value;
}
