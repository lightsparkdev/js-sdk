import { TextInput } from "@lightsparkdev/ui/src/components";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { type FocusEvent, useEffect, useRef } from "react";

dayjs.extend(customParseFormat);

interface BirthdayInputProps {
  date: string;
  invalidBirthdayError: string;
  setDate: (date: string) => void;
  dateFormat?: "US" | "INTL";
  onFocus?: (event: FocusEvent<HTMLInputElement, Element>) => void;
  onError?: (error: string) => void;
}

const DATE_FORMATS = {
  US: {
    format: "MM/DD/YYYY",
    placeholder: "MM / DD / YYYY",
    positions: { first: [0, 2], second: [2, 4], year: [4, 8] },
  },
  INTL: {
    format: "DD/MM/YYYY",
    placeholder: "DD / MM / YYYY",
    positions: { first: [0, 2], second: [2, 4], year: [4, 8] },
  },
} as const;

/**
 * Formats a birthday string.  Will return undefined if the birthday is not valid.
 * @param dayOrDate - The day or date to format
 * @param month - The month to format
 * @param year - The year to format
 * @param dateFormat - The format to use ("US" or "INTL")
 * @returns The formatted birthday string
 */
export function formatBirthday(
  dayOrDate: string,
  month?: string,
  year?: string,
  dateFormat: "US" | "INTL" = "US",
): string | undefined {
  let birthdayStr: string;
  if (month && year) {
    if (dateFormat === "INTL") {
      birthdayStr = `${dayOrDate}/${month}/${year}`;
    } else {
      birthdayStr = `${month}/${dayOrDate}/${year}`;
    }
  } else {
    birthdayStr = dayOrDate;
  }
  return isValidBirthday(birthdayStr, undefined, undefined, dateFormat)
    ? dayjs(birthdayStr, DATE_FORMATS[dateFormat].format)
        .startOf("day")
        .format("YYYY-MM-DD")
    : undefined;
}

/**
 * Valides a date string.  the required format is MM/DD/YYYY or DD/MM/YYYY, or the components can be passed in separately.
 * @param dayOrDate - The day or date to check
 * @param month - The month to check
 * @param year - The year to check
 * @param dateFormat - The format to use ("US" or "INTL")
 * @returns Whether the birthday is valid
 */
export function isValidBirthday(
  dayOrDate: string,
  month?: string,
  year?: string,
  dateFormat: "US" | "INTL" = "US",
): boolean {
  let birthdayStr: string;
  if (month && year) {
    if (dateFormat === "INTL") {
      birthdayStr = `${dayOrDate}/${month}/${year}`;
    } else {
      birthdayStr = `${month}/${dayOrDate}/${year}`;
    }
  } else {
    birthdayStr = dayOrDate;
  }

  const date = dayjs(birthdayStr, DATE_FORMATS[dateFormat].format, true);
  if (!date.isValid()) {
    return false;
  }

  const today = dayjs().startOf("day");

  // Reject dates before 1800 & after today
  return date.isBefore(today) && date.year() >= 1800;
}

export function formatDateToText(
  dateStr: string,
  dateFormat: "US" | "INTL" = "US",
): string {
  if (!dateStr.trim()) return "";

  const parts = dateStr.split("/");
  const first = parts[0];
  const second = parts[1];
  const year = parts[2];

  const month = dateFormat === "INTL" ? second : first;
  const day = dateFormat === "INTL" ? first : second;

  if (first && !second && !year) {
    if (first.length === 2) {
      const firstNum = parseInt(first);
      if (dateFormat === "US" && firstNum >= 1 && firstNum <= 12) {
        return dayjs()
          .month(firstNum - 1)
          .format("MMMM");
      }
    }
  }

  if (month && day && !year) {
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);

    if (monthNum >= 1 && monthNum <= 12) {
      const testDate = dayjs()
        .month(monthNum - 1)
        .date(dayNum);
      if (testDate.isValid() && testDate.date() === dayNum) {
        return `${testDate.format("MMMM")} ${day}`;
      }
    }
  }

  const date = dayjs(dateStr, DATE_FORMATS[dateFormat].format, true);
  return date.isValid() ? date.format("MMMM D, YYYY") : "";
}

function formatDateForDisplay(date: string): string {
  if (!date) return "";
  const parts = date.split("/");
  if (parts.length === 1) return parts[0];
  return parts.join(" / ");
}

export function BirthdayInput({
  date,
  setDate,
  invalidBirthdayError,
  dateFormat = "US",
  onFocus,
  onError,
}: BirthdayInputProps) {
  const formatConfig = DATE_FORMATS[dateFormat];
  const birthdayFieldBlurred = Boolean(date.trim());

  const isCompleteDate = date.length === 10;
  const isInvalid =
    isCompleteDate && !isValidBirthday(date, undefined, undefined, dateFormat);
  const showError = birthdayFieldBlurred && isInvalid;

  // Track previous error state to detect when error first appears
  const prevShowErrorRef = useRef(false);
  useEffect(() => {
    if (showError && !prevShowErrorRef.current && onError) {
      onError(invalidBirthdayError);
    }
    prevShowErrorRef.current = showError;
  }, [showError, onError, invalidBirthdayError]);

  const handleChange = (newValue: string): void => {
    let value = newValue;

    value = value.replace(/[^0-9]/g, "");
    let formattedValue = "";
    if (value.length > 0) {
      formattedValue = value.slice(0, 2);
    }
    if (value.length > 2) {
      formattedValue += "/" + value.slice(2, 4);
    }
    if (value.length > 4) {
      formattedValue += "/" + value.slice(4, 8);
    }

    setDate(formattedValue);
  };

  return (
    <>
      <TextInput
        maxLength={14}
        placeholder={formatConfig.placeholder}
        value={formatDateForDisplay(date)}
        onChange={handleChange}
        onFocus={onFocus}
        inputMode="numeric"
        typography={{
          size: "Large",
        }}
        hint={{
          text: formatDateToText(date, dateFormat),
          typography: {
            type: "Label",
            size: "Medium",
            color: "secondary",
          },
        }}
        error={showError ? invalidBirthdayError : undefined}
        borderRadius={16}
        borderWidth={0.5}
        paddingY={14}
      />
    </>
  );
}
