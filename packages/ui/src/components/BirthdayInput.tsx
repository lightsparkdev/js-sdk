import { TextInput } from "@lightsparkdev/ui/src/components";
import { InputSubtext } from "@lightsparkdev/ui/src/styles/fields";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { useState } from "react";

dayjs.extend(customParseFormat);

interface BirthdayInputProps {
  date: string;
  invalidBirthdayError: string;
  setDate: (date: string) => void;
}

/**
 * Formats a birthday string.  Will return undefined if the birthday is not valid.
 * @param dayOrDate - The day or date to format
 * @param month - The month to format
 * @param year - The year to format
 * @returns The formatted birthday string
 */
export function formatBirthday(
  dayOrDate: string,
  month?: string,
  year?: string,
): string | undefined {
  let birthdayStr: string;
  if (month && year) {
    birthdayStr = `${month}/${dayOrDate}/${year}`;
  } else {
    birthdayStr = dayOrDate;
  }
  return isValidBirthday(birthdayStr)
    ? dayjs(birthdayStr).startOf("day").format("YYYY-MM-DD")
    : undefined;
}
/**
 * Valides a date string.  the required format is MM/DD/YYYY, or the components can be passed in separately.
 * @param dayOrDate - The day or date to check
 * @param month - The month to check
 * @param year - The year to check
 * @returns Whether the birthday is valid
 */
export function isValidBirthday(
  dayOrDate: string,
  month?: string,
  year?: string,
): boolean {
  let birthdayStr: string;
  if (month && year) {
    birthdayStr = `${month}/${dayOrDate}/${year}`;
  } else {
    birthdayStr = dayOrDate;
  }
  return dayjs(birthdayStr, "MM/DD/YYYY", true).isValid();
}

export function BirthdayInput({
  date,
  setDate,
  invalidBirthdayError,
}: BirthdayInputProps) {
  const [birthdayValid, setBirthdayValid] = useState(isValidBirthday(date));

  const birthdayFieldBlurred = Boolean(date.trim());

  const handleChange = (newValue: string): void => {
    let value = newValue;

    value = value.replace(/[^0-9/]/g, "");

    if (value.length > 2 && value.charAt(2) !== "/") {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }
    if (value.length > 5 && value.charAt(5) !== "/") {
      value = value.slice(0, 5) + "/" + value.slice(5);
    }
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    setBirthdayValid(isValidBirthday(value));

    setDate(value);
  };

  return (
    <>
      <TextInput
        maxLength={10}
        placeholder="MM/DD/YYYY"
        value={date}
        onChange={handleChange}
        inputMode="numeric"
        typography={{
          size: "Medium",
          color: "text",
        }}
      />
      <InputSubtext
        text={
          !birthdayValid && birthdayFieldBlurred ? invalidBirthdayError : ""
        }
        hasError={!birthdayValid && birthdayFieldBlurred}
      />
    </>
  );
}
