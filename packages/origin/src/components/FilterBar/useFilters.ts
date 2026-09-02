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
  resolveAppliedFilterIds,
  type EnumFilterOption,
  type FilterDescriptorTuple,
  type FilterId,
  type FilterState,
  type FilterStateForId,
  type FilterStates,
} from "./filter-model";

interface UseFiltersOptionsBase<TDescriptors extends FilterDescriptorTuple> {
  /** Filter descriptors. Must be referentially stable (a module constant). */
  descriptors: TDescriptors;
}

interface DescriptorOrderOptions<TDescriptors extends FilterDescriptorTuple> {
  /**
   * Controlled mode: the current filter states. Provide together with
   * `onStatesChange` when the consumer owns persistence (e.g. a product
   * binding that hydrates from and writes back to the URL). Omit both for
   * uncontrolled mode, where the hook owns the states internally.
   */
  states?: FilterStates<TDescriptors>;
  /** Descriptor order is the backward-compatible default. */
  orderPolicy?: "descriptor";
  appliedFilterIds?: never;
  /**
   * Controlled mode: called with the next states whenever a seam operation
   * (add/update/remove/clear) produces a transition. The consumer applies
   * (and may persist) the new states.
   */
  onStatesChange?: (states: FilterStates<TDescriptors>) => void;
}

type ApplicationOrderOptions<TDescriptors extends FilterDescriptorTuple> = {
  /** Application order tracks when each currently applied filter entered the set. */
  orderPolicy: "application";
  /**
   * Called with both the next states and their normalized application order.
   */
  onStatesChange?: (
    states: FilterStates<TDescriptors>,
    appliedFilterIds: readonly FilterId<TDescriptors>[],
  ) => void;
} & (
  | {
      /** Uncontrolled mode: the hook owns the coherent state/order snapshot. */
      states?: never;
      appliedFilterIds?: never;
    }
  | {
      /** Controlled mode: current filter states and application order. */
      states: FilterStates<TDescriptors>;
      /**
       * Invalid, duplicate, unapplied, and stale ids are normalized; applied
       * ids missing here append in descriptor order.
       */
      appliedFilterIds: readonly FilterId<TDescriptors>[];
    }
);

export type UseFiltersOptions<TDescriptors extends FilterDescriptorTuple> =
  UseFiltersOptionsBase<TDescriptors> &
    (
      | DescriptorOrderOptions<TDescriptors>
      | ApplicationOrderOptions<TDescriptors>
    );

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
  /**
   * Applied filter ids in the order FilterBar.Pills renders them. Legacy
   * structural models may omit this, in which case FilterBar uses descriptor
   * order.
   */
  appliedFilterIds?: readonly FilterId<TDescriptors>[];
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

export interface UseFiltersResult<
  TDescriptors extends FilterDescriptorTuple = FilterDescriptorTuple,
> extends FiltersModel<TDescriptors> {
  appliedFilterIds: readonly FilterId<TDescriptors>[];
}

/**
 * Descriptor-driven filter state with controlled and uncontrolled modes.
 * Query-variable derivation remains consumer-owned.
 */
export function useFilters<const TDescriptors extends FilterDescriptorTuple>(
  options: UseFiltersOptions<TDescriptors>,
): UseFiltersResult<TDescriptors> {
  const {
    descriptors,
    states: controlledStates,
    orderPolicy = "descriptor",
    appliedFilterIds: controlledAppliedFilterIds,
  } = options;
  const onDescriptorStatesChange =
    options.orderPolicy === "application" ? undefined : options.onStatesChange;
  const onApplicationStatesChange =
    options.orderPolicy === "application" ? options.onStatesChange : undefined;
  const isControlled = controlledStates !== undefined;
  const [uncontrolledSnapshot, setUncontrolledSnapshot] = React.useState(() => {
    const states = controlledStates ?? getDefaultFilterStates(descriptors);
    return {
      states,
      applicationOrder: resolveAppliedFilterIds(
        descriptors,
        states,
        controlledAppliedFilterIds,
      ),
    };
  });
  const states = controlledStates ?? uncontrolledSnapshot.states;
  const applicationOrder = React.useMemo(
    () =>
      isControlled
        ? resolveAppliedFilterIds(
            descriptors,
            states,
            controlledAppliedFilterIds,
          )
        : resolveAppliedFilterIds(
            descriptors,
            states,
            uncontrolledSnapshot.applicationOrder,
          ),
    [
      controlledAppliedFilterIds,
      descriptors,
      isControlled,
      states,
      uncontrolledSnapshot.applicationOrder,
    ],
  );
  const appliedFilterIds = React.useMemo(
    () =>
      resolveAppliedFilterIds(
        descriptors,
        states,
        orderPolicy === "application" ? applicationOrder : [],
      ),
    [applicationOrder, descriptors, orderPolicy, states],
  );

  const wasControlledRef = React.useRef(isControlled);
  if (process.env.NODE_ENV !== "production") {
    if (isControlled && !options.onStatesChange) {
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
    (
      nextStates: FilterStates<TDescriptors>,
      preferredAppliedFilterIds: readonly FilterId<TDescriptors>[],
    ) => {
      const nextAppliedFilterIds = resolveAppliedFilterIds(
        descriptors,
        nextStates,
        preferredAppliedFilterIds,
      );
      if (!isControlled) {
        setUncontrolledSnapshot({
          states: nextStates,
          applicationOrder: nextAppliedFilterIds,
        });
      }
      if (orderPolicy === "application") {
        onApplicationStatesChange?.(nextStates, nextAppliedFilterIds);
      } else {
        onDescriptorStatesChange?.(nextStates);
      }
    },
    [
      descriptors,
      isControlled,
      onApplicationStatesChange,
      onDescriptorStatesChange,
      orderPolicy,
    ],
  );

  const applyTransition = React.useCallback(
    (
      nextStates: FilterStates<TDescriptors>,
      changedId?: FilterId<TDescriptors>,
    ) => {
      const preferredAppliedFilterIds = applicationOrder.filter(
        (id) =>
          (nextStates as Record<string, FilterState>)[id]?.isApplied ?? false,
      );
      if (
        changedId !== undefined &&
        !(states as Record<string, FilterState>)[changedId]?.isApplied &&
        (nextStates as Record<string, FilterState>)[changedId]?.isApplied
      ) {
        preferredAppliedFilterIds.push(changedId);
      }
      applyStates(nextStates, preferredAppliedFilterIds);
    },
    [applicationOrder, applyStates, states],
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
      applyTransition(
        applyFilterConflicts(descriptors, descriptor.id, addedState, {
          ...states,
          [descriptor.id]: addedState,
        }),
        descriptor.id,
      );
      if (options?.openEditor) {
        setOpenEditorId(descriptor.id);
      }
    },
    [applyTransition, descriptors, states],
  );

  const updateFilter = React.useCallback(
    function updateFilter<TId extends FilterId<TDescriptors>>(
      id: TId,
      newState: FilterStateForId<TDescriptors, TId>,
    ) {
      applyTransition(
        applyFilterConflicts(descriptors, id, newState, {
          ...states,
          [id]: newState,
        }),
        id,
      );
    },
    [applyTransition, descriptors, states],
  );

  const removeFilter = React.useCallback(
    (id: FilterId<TDescriptors>) => {
      const descriptor = descriptors.find((candidate) => candidate.id === id);
      if (!descriptor) {
        return;
      }
      applyTransition({
        ...states,
        [id]: getDefaultFilterState(descriptor),
      });
      setOpenEditorId((current) => (current === id ? null : current));
    },
    [applyTransition, descriptors, states],
  );

  const clearFilters = React.useCallback(() => {
    applyStates(getDefaultFilterStates(descriptors), []);
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
      appliedFilterIds,
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
      appliedFilterIds,
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
