export interface HumanizeIdentifierOptions {
  capitalization?: "sentence" | "title";
}

export function humanizeIdentifier(
  value: string,
  { capitalization = "sentence" }: HumanizeIdentifierOptions = {},
): string {
  const words = value.replaceAll("_", " ").toLowerCase();
  if (capitalization === "title") {
    return words.replace(/\b\w/g, (character) => character.toUpperCase());
  }
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function formatDateTime(
  value: string | number | Date,
  locales?: Intl.LocalesArgument,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(locales, options).format(new Date(value));
}
