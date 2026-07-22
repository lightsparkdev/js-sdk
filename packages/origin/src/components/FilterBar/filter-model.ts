/**
 * Generic filter model for data-table screens: descriptor types, filter
 * state, URL codec, exclusivity policy, and the applied-filter signature
 * that feeds cursor pagination reset keys.
 *
 * Consumers own the descriptors (ids, labels, options, mutual exclusion)
 * and the mapping from applied states to query variables. This module owns
 * only the machinery — it has no query concepts and no router dependency:
 * the URL codec is pure `URLSearchParams` functions, and it validates
 * untrusted input (malformed dates, unknown enum values) so garbage from a
 * stale or hand-edited URL never reaches state.
 *
 * The URL format: params keyed by filter id, singular strings as one raw value,
 * enum values as repeated params, and dates as `"<startISO>,<endISO>"` with either side allowed
 * to be empty. Hydration merges: absent params leave the current state
 * untouched, while present-but-empty params hydrate as applied-but-empty
 * (`searchParams.has()` semantics), so an applied-but-empty pill
 * round-trips a save/reload.
 */

export interface EnumFilterOption {
  label: string;
  value: string | string[];
}

/**
 * An enum option's value(s) as an array (`value` allows a bare string for
 * the common single-value case). Shared with the pill label derivation in
 * `parts.tsx`, which must match applied values against array-valued
 * options the same way the transitions below do.
 */
export function toEnumOptionValueArray(value: string | string[]): string[] {
  return Array.isArray(value) ? value : [value];
}

interface FilterDescriptorBase<TId extends string> {
  /** URL param key and state key, unique within the descriptor set. */
  id: TId;
  label: string;
  /**
   * Consumer-owned mutual exclusion: applying this filter resets the
   * listed filters to their defaults.
   */
  conflictsWith?: readonly TId[];
}

/** A closed date range in UTC instants. */
export interface DateFilterRange {
  start: Date;
  end: Date;
}

export interface DateFilterDescriptor<TId extends string>
  extends FilterDescriptorBase<TId> {
  type: "date";
  /**
   * Starting position for the editor draft when the pill opens with no
   * committed value. Omitted, the editor opens empty. A function seeds a
   * range per filter and is evaluated at editor-open time, returning UTC
   * instants.
   *
   * The seed is only a starting position for editing: it never
   * auto-commits. Apply commits it like any user-entered range; dismissing
   * without Apply commits nothing. Editors opening on a committed value
   * keep that value.
   */
  defaultRange?: () => DateFilterRange;
  /**
   * Set false to constrain the calendar to today and earlier. Omitted or
   * true leaves future dates unbounded.
   */
  allowFuture?: boolean;
}

/** Resolve a date descriptor's optional editor-seed range at editor-open time. */
export function getDateFilterDefaultRange(
  descriptor: DateFilterDescriptor<string>,
): DateFilterRange | null {
  return descriptor.defaultRange?.() ?? null;
}

export interface EnumFilterDescriptor<TId extends string>
  extends FilterDescriptorBase<TId> {
  type: "enum";
  options: readonly EnumFilterOption[];
  isMulti?: boolean;
}

interface StringFilterDescriptorBase<TId extends string>
  extends FilterDescriptorBase<TId> {
  type: "string";
  /** Editor input placeholder. Omitted, the input shows no placeholder. */
  placeholder?: string;
}

export type StringFilterDescriptor<TId extends string> =
  StringFilterDescriptorBase<TId> &
    (
      | {
          /**
           * Normalize and validate editor and URL values. Return the normalized
           * value to accept it or `null` to reject it.
           */
          normalizeValue: (value: string) => string | null;
          /** Validation message shown when `normalizeValue` rejects an editor value. */
          errorMessage: string;
        }
      | {
          /** Omitted, string values are accepted without consumer-specific validation. */
          normalizeValue?: never;
          errorMessage?: string;
        }
    );

export type FilterDescriptor<TId extends string = string> =
  | DateFilterDescriptor<TId>
  | EnumFilterDescriptor<TId>
  | StringFilterDescriptor<TId>;

export type FilterDescriptorTuple = readonly FilterDescriptor<string>[];

export interface DateFilterState {
  type: "date";
  isApplied: boolean;
  start: Date | null;
  end: Date | null;
}

export interface EnumFilterState {
  type: "enum";
  isApplied: boolean;
  appliedValues: string[];
}

export interface StringFilterState {
  type: "string";
  isApplied: boolean;
  value: string | null;
}

export type FilterState = DateFilterState | EnumFilterState | StringFilterState;

/** The state variant implied by one descriptor's discriminant. */
export type FilterStateForDescriptor<
  TDescriptor extends FilterDescriptor<string>,
> = TDescriptor extends DateFilterDescriptor<string>
  ? DateFilterState
  : TDescriptor extends EnumFilterDescriptor<string>
  ? EnumFilterState
  : TDescriptor extends StringFilterDescriptor<string>
  ? StringFilterState
  : never;

export type FilterId<TDescriptors extends FilterDescriptorTuple> =
  TDescriptors[number]["id"];

export type FilterDescriptorForId<
  TDescriptors extends FilterDescriptorTuple,
  TId extends FilterId<TDescriptors>,
> = Extract<TDescriptors[number], { id: TId }>;

export type FilterStateForId<
  TDescriptors extends FilterDescriptorTuple,
  TId extends FilterId<TDescriptors>,
> = FilterStateForDescriptor<FilterDescriptorForId<TDescriptors, TId>>;

/**
 * Descriptor-aware state map. Preserve descriptor/id correlation by passing
 * the readonly descriptor tuple itself, not only its id union.
 */
export type FilterStates<TDescriptors extends FilterDescriptorTuple> = {
  [TDescriptor in TDescriptors[number] as TDescriptor["id"]]: FilterStateForDescriptor<TDescriptor>;
};

function getDefaultFilterStateValue(
  descriptor: FilterDescriptor<string>,
): FilterState {
  switch (descriptor.type) {
    case "date":
      return { type: "date", isApplied: false, start: null, end: null };
    case "enum":
      return { type: "enum", isApplied: false, appliedValues: [] };
    case "string":
      return { type: "string", isApplied: false, value: null };
    default: {
      const exhaustiveCheck: never = descriptor;
      throw new Error(`Unhandled filter type: ${String(exhaustiveCheck)}`);
    }
  }
}

export function getDefaultFilterState<
  TDescriptor extends FilterDescriptor<string>,
>(descriptor: TDescriptor): FilterStateForDescriptor<TDescriptor> {
  return getDefaultFilterStateValue(
    descriptor,
  ) as FilterStateForDescriptor<TDescriptor>;
}

export function getDefaultFilterStates<
  const TDescriptors extends FilterDescriptorTuple,
>(descriptors: TDescriptors): FilterStates<TDescriptors> {
  return Object.fromEntries(
    descriptors.map((descriptor) => [
      descriptor.id,
      getDefaultFilterState(descriptor),
    ]),
  ) as FilterStates<TDescriptors>;
}

/**
 * Initial state a filter gets when added without a value: string filters
 * apply empty (the pill editor collects a value), date filters
 * apply an open range, and enum filters apply empty (choosing a value goes
 * through `applyEnumFilterOption`).
 */
function getAddedFilterStateValue(
  descriptor: FilterDescriptor<string>,
): FilterState {
  switch (descriptor.type) {
    case "date":
      return { type: "date", isApplied: true, start: null, end: null };
    case "enum":
      return { type: "enum", isApplied: true, appliedValues: [] };
    case "string":
      return { type: "string", isApplied: true, value: null };
    default: {
      const exhaustiveCheck: never = descriptor;
      throw new Error(`Unhandled filter type: ${String(exhaustiveCheck)}`);
    }
  }
}

export function getAddedFilterState<
  TDescriptor extends FilterDescriptor<string>,
>(descriptor: TDescriptor): FilterStateForDescriptor<TDescriptor> {
  return getAddedFilterStateValue(
    descriptor,
  ) as FilterStateForDescriptor<TDescriptor>;
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

/**
 * The one enum-option transition every surface shares (add-menu submenu,
 * pill editor, external command surfaces): multi-select descriptors toggle
 * the option's value(s) in the applied set — unchecking the last value
 * leaves an applied-but-empty pill; exclusive descriptors replace the
 * selection with the chosen option.
 */
export function applyEnumFilterOption(
  descriptor: EnumFilterDescriptor<string>,
  state: FilterState | undefined,
  option: EnumFilterOption,
): EnumFilterState {
  const optionValues = toEnumOptionValueArray(option.value);
  if (!descriptor.isMulti) {
    return { type: "enum", isApplied: true, appliedValues: [...optionValues] };
  }
  const currentValues =
    state?.type === "enum" && state.isApplied ? state.appliedValues : [];
  const withoutOption = currentValues.filter(
    (value) => !optionValues.includes(value),
  );
  return {
    type: "enum",
    isApplied: true,
    appliedValues: isEnumFilterOptionApplied(state, option)
      ? withoutOption
      : [...withoutOption, ...optionValues],
  };
}

/**
 * Enforce descriptor-declared mutual exclusion: when `changedId` becomes
 * applied, every filter in its `conflictsWith` list resets to default.
 * `states` must already contain the new state for `changedId`.
 */
export function applyFilterConflicts<
  const TDescriptors extends FilterDescriptorTuple,
  TId extends FilterId<TDescriptors>,
>(
  descriptors: TDescriptors,
  changedId: TId,
  newState: FilterState,
  states: FilterStates<TDescriptors>,
): FilterStates<TDescriptors> {
  if (!newState.isApplied) {
    return states;
  }
  const descriptor = descriptors.find(
    (candidate) => candidate.id === changedId,
  );
  if (!descriptor?.conflictsWith?.length) {
    return states;
  }

  const nextStates: Record<string, FilterState> = {
    ...(states as Record<string, FilterState>),
  };
  for (const conflictingId of descriptor.conflictsWith) {
    const conflicting = descriptors.find(
      (candidate) => candidate.id === conflictingId,
    );
    if (conflicting) {
      nextStates[conflictingId] = getDefaultFilterState(conflicting);
    }
  }
  return nextStates as FilterStates<TDescriptors>;
}

function parseUrlDate(value: string): Date | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return null;
  }
  // The matching serializer is Date#toISOString, so accept only that
  // canonical representation. Exact round-tripping rejects calendar
  // rollovers (Feb 30), offsets, omitted milliseconds, and other valid but
  // non-canonical spellings rather than silently changing the URL value.
  return date.toISOString() === value ? date : null;
}

/**
 * URL hydration with merge semantics: absent params leave the current
 * state untouched; present-but-empty params hydrate as applied-but-empty,
 * matching both the `searchParams.has()` contract and what
 * `saveFilterStatesToUrl` writes for an applied-empty pill. Present params
 * apply conflict transitions in descriptor order, so later descriptors win
 * independently of query-string order.
 */
export function loadFilterStatesFromUrl<
  const TDescriptors extends FilterDescriptorTuple,
>(
  descriptors: TDescriptors,
  searchParams: URLSearchParams,
  currentStates: FilterStates<TDescriptors>,
): FilterStates<TDescriptors> {
  let nextStates: Record<string, FilterState> = {
    ...(currentStates as Record<string, FilterState>),
  };
  const applyHydratedState = (
    descriptor: TDescriptors[number],
    state: FilterState,
  ) => {
    nextStates[descriptor.id] = state;
    nextStates = applyFilterConflicts(
      descriptors,
      descriptor.id,
      state,
      nextStates as FilterStates<TDescriptors>,
    ) as Record<string, FilterState>;
  };

  for (const descriptor of descriptors) {
    const paramValues = searchParams.getAll(descriptor.id);
    if (paramValues.length === 0) {
      continue;
    }
    const paramValue = paramValues[0] ?? "";
    if (paramValue === "") {
      applyHydratedState(descriptor, getAddedFilterState(descriptor));
      continue;
    }

    switch (descriptor.type) {
      case "enum": {
        // Enum values typically reach typed query variables verbatim, so
        // unknown values from a stale or hand-edited URL
        // (`?displayStatus=GARBAGE`) would fail server-side validation and
        // error the whole query. Validate against the descriptor's
        // options: unknown values are dropped, and a param with no valid
        // values left falls back to the filter's default instead of
        // hydrating applied.
        const knownValues = new Set(
          descriptor.options.flatMap((option) =>
            toEnumOptionValueArray(option.value),
          ),
        );
        const requestedValues =
          paramValues.length > 1 || knownValues.has(paramValue)
            ? paramValues
            : paramValue.split(",");
        // Multi-select preserves every valid primitive in URL order.
        // Exclusive enums select exactly one option: the first URL value
        // that matches wins, with descriptor order breaking ties when
        // array-valued options overlap. Hydration expands that option to
        // its complete value array so state remains coherent with
        // applyEnumFilterOption and serialization.
        const exclusiveOption = descriptor.isMulti
          ? undefined
          : requestedValues
              .map((requestedValue) =>
                descriptor.options.find((option) =>
                  toEnumOptionValueArray(option.value).includes(requestedValue),
                ),
              )
              .find((option) => option !== undefined);
        const appliedValues = descriptor.isMulti
          ? requestedValues.filter((value) => knownValues.has(value))
          : exclusiveOption
          ? toEnumOptionValueArray(exclusiveOption.value)
          : [];
        applyHydratedState(
          descriptor,
          appliedValues.length > 0
            ? { type: "enum", isApplied: true, appliedValues }
            : getDefaultFilterState(descriptor),
        );
        break;
      }
      case "string": {
        const value = descriptor.normalizeValue
          ? descriptor.normalizeValue(paramValue)
          : paramValue;
        applyHydratedState(
          descriptor,
          value === null
            ? getDefaultFilterState(descriptor)
            : {
                type: "string",
                isApplied: true,
                value: value.trim() === "" ? null : value,
              },
        );
        break;
      }
      case "date": {
        const [startString = "", endString = ""] = paramValue.split(",");
        // Each side validates independently. A half-valid param (e.g.
        // `?createdAt=2026-01-01T00:00:00.000Z,garbage`) keeps its valid
        // side and drops the garbage side — an Invalid Date must never
        // reach state, where render-time `.toISOString()` and
        // `Intl.DateTimeFormat.format()` throw RangeError.
        let start = parseUrlDate(startString);
        let end = parseUrlDate(endString);
        if (start && end && start.getTime() > end.getTime()) {
          [start, end] = [end, start];
        }
        applyHydratedState(descriptor, {
          type: "date",
          isApplied: true,
          start,
          end,
        });
        break;
      }
      default: {
        const exhaustiveCheck: never = descriptor;
        throw new Error(`Unhandled filter type: ${String(exhaustiveCheck)}`);
      }
    }
  }

  return nextStates as FilterStates<TDescriptors>;
}

/**
 * Serialize applied filters onto `searchParams`. Non-applied filters have
 * their params removed; foreign params are left alone. Page position is
 * deliberately not part of this codec — pagination state is transient.
 */
export function saveFilterStatesToUrl<
  const TDescriptors extends FilterDescriptorTuple,
>(
  descriptors: TDescriptors,
  searchParams: URLSearchParams,
  states: FilterStates<TDescriptors>,
): URLSearchParams {
  for (const descriptor of descriptors) {
    searchParams.delete(descriptor.id);
  }

  for (const descriptor of descriptors) {
    const state = (states as Record<string, FilterState>)[descriptor.id];
    if (!state.isApplied) {
      continue;
    }

    switch (state.type) {
      case "date": {
        const startString = state.start ? state.start.toISOString() : "";
        const endString = state.end ? state.end.toISOString() : "";
        searchParams.set(descriptor.id, `${startString},${endString}`);
        break;
      }
      case "enum":
        if (state.appliedValues.length === 0) {
          searchParams.set(descriptor.id, "");
        } else {
          for (const value of state.appliedValues) {
            searchParams.append(descriptor.id, value);
          }
        }
        break;
      case "string":
        searchParams.set(descriptor.id, state.value ?? "");
        break;
      default: {
        const exhaustiveCheck: never = state;
        throw new Error(`Unhandled filter state: ${String(exhaustiveCheck)}`);
      }
    }
  }

  return searchParams;
}

/**
 * Stable serialization of the applied filter set, for cursor pagination reset
 * keys: any filter change invalidates the cursor space.
 */
export function getFilterSignature<
  const TDescriptors extends FilterDescriptorTuple,
>(descriptors: TDescriptors, states: FilterStates<TDescriptors>): string {
  return saveFilterStatesToUrl(
    descriptors,
    new URLSearchParams(),
    states,
  ).toString();
}

export function countAppliedFilters<TDescriptors extends FilterDescriptorTuple>(
  states: FilterStates<TDescriptors>,
): number {
  return Object.values(states as Record<string, FilterState>).reduce(
    (count, state) => (state.isApplied ? count + 1 : count),
    0,
  );
}
