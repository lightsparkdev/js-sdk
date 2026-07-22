"use client";

import * as React from "react";
import { devWarnOnce } from "../../lib/dev-warn";
import {
  applyEnumFilterOption,
  applyFilterConflicts,
  countAppliedFilters,
  getAddedFilterState,
  getDefaultFilterState,
  getDefaultFilterStates,
  getFilterSignature,
  type EnumFilterOption,
  type FilterDescriptorTuple,
  type FilterId,
  type FilterState,
  type FilterStateForId,
  type FilterStates,
} from "./filter-model";

export interface UseFiltersOptions<TDescriptors extends FilterDescriptorTuple> {
  /** Filter descriptors. Must be referentially stable (a module constant). */
  descriptors: TDescriptors;
  /**
   * Controlled mode: the current filter states. Provide together with
   * `onStatesChange` when the consumer owns persistence (e.g. a product
   * binding that hydrates from and writes back to the URL). Omit both for
   * uncontrolled mode, where the hook owns the states internally.
   */
  states?: FilterStates<TDescriptors>;
  /**
   * Controlled mode: called with the next states whenever a seam operation
   * (add/update/remove/clear) produces a transition. The consumer applies
   * (and may persist) the new states.
   */
  onStatesChange?: (states: FilterStates<TDescriptors>) => void;
}

export interface AddFilterOptions {
  /**
   * Apply this enum option immediately (enum descriptors only). Without
   * it, enum filters add applied-but-empty like every other type. Follows
   * `applyEnumFilterOption` semantics against the current state:
   * multi-select descriptors toggle the value; exclusive descriptors
   * replace the selection — so every surface (add-menu, pill editor,
   * external command surfaces) produces the same transitions.
   */
  enumValue?: EnumFilterOption;
  /**
   * Open the new pill's value editor after adding, so the caller can hand
   * the user straight to value entry.
   */
  openEditor?: boolean;
}

export type UpdateFilter<TDescriptors extends FilterDescriptorTuple> = <
  TId extends FilterId<TDescriptors>,
>(
  id: TId,
  state: FilterStateForId<TDescriptors, TId>,
) => void;

export interface FiltersModel<
  TDescriptors extends FilterDescriptorTuple = FilterDescriptorTuple,
> {
  descriptors: TDescriptors;
  states: FilterStates<TDescriptors>;
  appliedCount: number;
  /** Stable applied-filter serialization for cursor pagination reset keys. */
  signature: string;
  addFilter: (
    descriptor: TDescriptors[number],
    options?: AddFilterOptions,
  ) => void;
  updateFilter: UpdateFilter<TDescriptors>;
  removeFilter: (id: FilterId<TDescriptors>) => void;
  clearFilters: () => void;
  /**
   * Pill-editor open state, lifted to the model so any caller — pill
   * trigger clicks, `addFilter({ openEditor: true })`, future surfaces —
   * drives the same controlled Popover/Menu state. At most one editor is
   * open at a time; `null` means all closed.
   */
  openEditorId: FilterId<TDescriptors> | null;
  /** Open or close a pill's value editor (controlled, see openEditorId). */
  setEditorOpen: (id: FilterId<TDescriptors>, open: boolean) => void;
}

/**
 * Descriptor-driven filter state with controlled and uncontrolled modes.
 * Query-variable derivation remains consumer-owned.
 */
export function useFilters<const TDescriptors extends FilterDescriptorTuple>({
  descriptors,
  states: controlledStates,
  onStatesChange,
}: UseFiltersOptions<TDescriptors>): FiltersModel<TDescriptors> {
  const isControlled = controlledStates !== undefined;
  const [uncontrolledStates, setUncontrolledStates] = React.useState<
    FilterStates<TDescriptors>
  >(() => controlledStates ?? getDefaultFilterStates(descriptors));
  const states = controlledStates ?? uncontrolledStates;

  const wasControlledRef = React.useRef(isControlled);
  if (process.env.NODE_ENV !== "production") {
    if (isControlled && !onStatesChange) {
      devWarnOnce(
        "useFilters received `states` without `onStatesChange`; the filter bar will be read-only.",
      );
    }
    if (wasControlledRef.current !== isControlled) {
      devWarnOnce(
        "useFilters is changing between controlled and uncontrolled `states`. Decide the mode for the lifetime of the hook.",
      );
      wasControlledRef.current = isControlled;
    }
  }

  const [openEditorId, setOpenEditorId] =
    React.useState<FilterId<TDescriptors> | null>(null);

  const applyStates = React.useCallback(
    (nextStates: FilterStates<TDescriptors>) => {
      if (!isControlled) {
        setUncontrolledStates(nextStates);
      }
      onStatesChange?.(nextStates);
    },
    [isControlled, onStatesChange],
  );

  const addFilter = React.useCallback(
    (descriptor: TDescriptors[number], options?: AddFilterOptions) => {
      const currentState = (states as Record<string, FilterState>)[
        descriptor.id
      ];
      if (
        descriptor.type !== "enum" &&
        currentState.isApplied &&
        options?.openEditor
      ) {
        setOpenEditorId(descriptor.id);
        return;
      }
      const addedState =
        descriptor.type === "enum" && options?.enumValue
          ? applyEnumFilterOption(descriptor, currentState, options.enumValue)
          : getAddedFilterState(descriptor);
      applyStates(
        applyFilterConflicts(descriptors, descriptor.id, addedState, {
          ...states,
          [descriptor.id]: addedState,
        }),
      );
      if (options?.openEditor) {
        setOpenEditorId(descriptor.id);
      }
    },
    [applyStates, descriptors, states],
  );

  const updateFilter = React.useCallback(
    function updateFilter<TId extends FilterId<TDescriptors>>(
      id: TId,
      newState: FilterStateForId<TDescriptors, TId>,
    ) {
      applyStates(
        applyFilterConflicts(descriptors, id, newState, {
          ...states,
          [id]: newState,
        }),
      );
    },
    [applyStates, descriptors, states],
  );

  const removeFilter = React.useCallback(
    (id: FilterId<TDescriptors>) => {
      const descriptor = descriptors.find((candidate) => candidate.id === id);
      if (!descriptor) {
        return;
      }
      applyStates({ ...states, [id]: getDefaultFilterState(descriptor) });
      setOpenEditorId((current) => (current === id ? null : current));
    },
    [applyStates, descriptors, states],
  );

  const clearFilters = React.useCallback(() => {
    applyStates(getDefaultFilterStates(descriptors));
    setOpenEditorId(null);
  }, [applyStates, descriptors]);

  const setEditorOpen = React.useCallback(
    (id: FilterId<TDescriptors>, open: boolean) => {
      setOpenEditorId((current) => {
        if (open) {
          return id;
        }
        return current === id ? null : current;
      });
    },
    [],
  );

  const signature = React.useMemo(
    () => getFilterSignature(descriptors, states),
    [descriptors, states],
  );
  const appliedCount = React.useMemo(
    () => countAppliedFilters(states),
    [states],
  );

  return React.useMemo(
    () => ({
      descriptors,
      states,
      appliedCount,
      signature,
      addFilter,
      updateFilter,
      removeFilter,
      clearFilters,
      openEditorId,
      setEditorOpen,
    }),
    [
      descriptors,
      states,
      appliedCount,
      signature,
      addFilter,
      updateFilter,
      removeFilter,
      clearFilters,
      openEditorId,
      setEditorOpen,
    ],
  );
}
