import type { EnumFilterOption, FilterState } from "./filter-model";

/**
 * An enum option's value(s) as an array (`value` allows a bare string for
 * the common single-value case). Every surface must match applied values
 * against array-valued options this same way.
 */
export function toEnumOptionValueArray(value: string | string[]): string[] {
  return Array.isArray(value) ? value : [value];
}

/** Whether an option's label, value(s), or keywords contain `query`. */
export function matchesEnumFilterOption(
  option: EnumFilterOption,
  query: string,
): boolean {
  const needle = query.trim().toLowerCase();
  return (
    needle === "" ||
    [
      option.label,
      ...toEnumOptionValueArray(option.value),
      ...(option.keywords ?? []),
    ].some((text) => text.toLowerCase().includes(needle))
  );
}

/**
 * Whether an option's value(s) are all present in an applied enum state —
 * the checked/selected binding for every value-choosing surface (add-menu
 * checked items, pill editor, external command surfaces).
 */
export function isEnumFilterOptionApplied(
  state: FilterState | undefined,
  option: EnumFilterOption,
): boolean {
  if (state?.type !== "enum" || !state.isApplied) {
    return false;
  }
  return toEnumOptionValueArray(option.value).every((value) =>
    state.appliedValues.includes(value),
  );
}
