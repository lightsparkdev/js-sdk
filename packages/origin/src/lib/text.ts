// Unicode "other" characters (control, format, surrogate, private use,
// unassigned), except the whitespace a text field can legitimately hold.
const INVISIBLE_PATTERN = /[^\P{C}\n\r\t]/gu;
// Unicode separators other than a plain space, e.g. a non-breaking space.
const EXOTIC_SPACE_PATTERN = /[^\P{Z} ]/gu;

/**
 * Remove the invisible characters that come along when text is pasted out of a
 * PDF or a spreadsheet.
 *
 * A zip code copied from a PDF arrives as "04814270\u202c", carrying a POP
 * DIRECTIONAL FORMATTING mark that renders as nothing. It looks correct in the
 * form, in our logs, and in the database, and only fails much later when a
 * banking partner rejects the value. Exotic spaces become plain spaces so that
 * words stay separated.
 *
 * Duplicated from @lightsparkdev/core on purpose: Origin does not depend on
 * other Lightspark packages.
 */
export function stripNonPrintable(value: string) {
  return value
    .replace(INVISIBLE_PATTERN, "")
    .replace(EXOTIC_SPACE_PATTERN, " ");
}
