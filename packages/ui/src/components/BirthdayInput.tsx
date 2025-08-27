import { TextInput } from "@lightsparkdev/ui/src/components";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

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

  const date = dayjs(birthdayStr, "MM/DD/YYYY", true);
  if (!date.isValid()) {
    return false;
  }

  const today = dayjs().startOf("day");

  // Reject dates before 1800 & after today
  return date.isBefore(today) && date.year() >= 1800;
}

export function formatDateToText(dateStr: string): string {
  if (!dateStr.trim()) return "";

  const parts = dateStr.split("/");
  const month = parts[0];
  const day = parts[1];
  const year = parts[2];
  if (month && !day && !year) {
    if (month.length === 2) {
      const monthNum = parseInt(month);
      if (monthNum >= 1 && monthNum <= 12) {
        return dayjs()
          .month(monthNum - 1)
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

  const date = dayjs(dateStr, "MM/DD/YYYY", true);
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
}: BirthdayInputProps) {
  const birthdayFieldBlurred = Boolean(date.trim());

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

  const isCompleteDate = date.length === 10;
  const isInvalid = isCompleteDate && !isValidBirthday(date);

  return (
    <>
      <TextInput
        maxLength={14}
        placeholder="MM / DD / YYYY"
        value={formatDateForDisplay(date)}
        onChange={handleChange}
        inputMode="numeric"
        typography={{
          size: "Large",
        }}
        hint={{
          text: formatDateToText(date),
          typography: {
            type: "Label",
            size: "Medium",
            color: "secondary",
          },
        }}
        error={
          birthdayFieldBlurred && isInvalid ? invalidBirthdayError : undefined
        }
        borderRadius={16}
        borderWidth={0.5}
        paddingY={14}
      />
    </>
  );
}
