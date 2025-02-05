// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

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

export function removeNonDigit(value: string): string {
  // Remove any non-digit characters (including decimal point)
  const numericValue = value.replace(/[^\d]/g, "");
  // Remove leading zeros
  return numericValue.replace(/^0+/, "") || "0";
}

export function addCommasToVariableDecimal(
  value: string | number,
  decimals: number,
): string {
  const val = removeNonDigit(value.toString());
  return decimals === 0
    ? addCommasToDigits(val)
    : addCommasToDigits(
        val.padStart(decimals + 1, "0").slice(0, -decimals) +
          "." +
          val.padStart(decimals + 1, "0").slice(-decimals),
      );
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

export type ElideObjArgs = {
  maxChars: number;
  ellipsisPosition?: "start" | "middle" | "end" | number;
};
export type ElideArgs = number | ElideObjArgs;

export function elide(value: string, elideArgs: ElideArgs = 5): string {
  const args =
    typeof elideArgs === "number"
      ? { maxChars: elideArgs, ellipsisPosition: "middle" }
      : elideArgs;
  let displayValue = value;
  if (value.length > args.maxChars) {
    if (typeof args.ellipsisPosition === "number") {
      displayValue = `${value.substr(
        0,
        args.ellipsisPosition,
      )}...${value.substr(value.length - args.ellipsisPosition, value.length)}`;
    } else if (args.ellipsisPosition === "start") {
      displayValue = `...${value.substr(
        value.length - args.maxChars,
        value.length,
      )}`;
    } else if (args.ellipsisPosition === "middle") {
      const half = Math.floor(args.maxChars / 2);
      displayValue = `${value.substr(0, half)}...${value.substr(
        value.length - half,
        value.length,
      )}`;
    } else {
      displayValue = `${value.substr(0, args.maxChars)}...`;
    }
  }
  return displayValue;
}
