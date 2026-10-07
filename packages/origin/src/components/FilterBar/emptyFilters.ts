import {
  getDefaultFilterState,
  type FilterDescriptorTuple,
  type FilterState,
  type FilterStates,
} from "./filter-model";

/** Whether an applied filter has no value yet. */
export function isEmptyFilterState(state: FilterState): boolean {
  switch (state.type) {
    case "date":
      return state.start === null && state.end === null;
    case "string":
      return state.value === null;
    case "enum":
      return state.appliedValues.length === 0;
    default: {
      const exhaustiveCheck: never = state;
      throw new Error(`Unhandled filter type: ${String(exhaustiveCheck)}`);
    }
  }
}

/** The states with every applied-but-empty filter reset to its default. */
export function withoutEmptyFilters<
  const TDescriptors extends FilterDescriptorTuple,
>(
  descriptors: TDescriptors,
  states: FilterStates<TDescriptors>,
): FilterStates<TDescriptors> {
  const byId = states as Record<string, FilterState>;
  return Object.fromEntries(
    descriptors.map((descriptor) => {
      const state = byId[descriptor.id];
      return [
        descriptor.id,
        state?.isApplied && isEmptyFilterState(state)
          ? getDefaultFilterState(descriptor)
          : state,
      ];
    }),
  ) as FilterStates<TDescriptors>;
}
