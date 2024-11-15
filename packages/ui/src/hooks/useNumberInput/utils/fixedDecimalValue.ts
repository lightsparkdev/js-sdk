export function fixedDecimalValue(
  value: string,
  decimalSeparator: string,
  fixedDecimalLength?: number,
): string {
  // Validate that decimalSeparator is a single character
  if (decimalSeparator.length !== 1) {
    throw new Error("decimalSeparator must be a single character.");
  }

  // Find the position of the decimal separator
  const decimalIndex = value.indexOf(decimalSeparator);

  // If fixedDecimalLength is undefined, return the value as-is
  if (fixedDecimalLength === undefined) {
    return value;
  }

  // If the decimal separator is not found, append it with target decimals
  if (decimalIndex === -1) {
    const paddedDecimals = "0".repeat(fixedDecimalLength);
    return `${value}${decimalSeparator}${paddedDecimals}`;
  }

  // Split the string into integer and decimal parts
  const integerPart = value.substring(0, decimalIndex);
  let decimalPart = value.substring(decimalIndex + 1);

  // Handle cases where decimal is at the end (e.g., "10.")
  if (decimalPart === "") {
    decimalPart = "0".repeat(fixedDecimalLength);
    return `${integerPart}${decimalSeparator}${decimalPart}`;
  }

  // Determine the number of digits in the decimal part
  const currentDecimalLength = decimalPart.length;

  if (currentDecimalLength < fixedDecimalLength) {
    // Pad with '0's to reach the target decimal length
    const paddingLength = fixedDecimalLength - currentDecimalLength;
    const paddedDecimal = decimalPart + "0".repeat(paddingLength);
    return `${integerPart}${decimalSeparator}${paddedDecimal}`;
  } else if (currentDecimalLength > fixedDecimalLength) {
    // Trim the decimal part to match the target decimal length
    const trimmedDecimal = decimalPart.substring(0, fixedDecimalLength);
    return `${integerPart}${decimalSeparator}${trimmedDecimal}`;
  } else {
    // Decimal length matches the target; return the original string
    return value;
  }
}
