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
import { isEmptyFilterState } from "./emptyFilters";

interface UseFiltersOptionsBase<TDescriptors extends FilterDescriptorTuple> {
  /** Filter descriptors. Must be referentially stable (a module constant). */
  descriptors: TDescriptors;
  /**
   * Remove a filter left without a value: when its pill editor closes, or
   * when the add menu unchecks its last value.
   */
  discardEmptyFilters?: boolean;
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
  /**
   * Whether the filter bar removes filters left without a value. Removal when
   * an editor closes is part of `useFilters`. A model built another way only
   * gets the removals the filter bar makes itself. See
   * `UseFiltersOptions.discardEmptyFilters`.
   */
  discardsEmptyFilters?: boolean;
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
    discardEmptyFilters = false,
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

  const [openEditorId, setOpenEditorIdState] =
    React.useState<FilterId<TDescriptors> | null>(null);
  const openEditorIdRef = React.useRef(openEditorId);
  const setOpenEditor = React.useCallback(
    (id: FilterId<TDescriptors> | null) => {
      openEditorIdRef.current = id;
      setOpenEditorIdState(id);
    },
    [],
  );
  const statesRef = React.useRef(states);
  statesRef.current = states;
  // An editor's latest commit can still be on its way to a controlled
  // consumer when the editor closes. It must not read as an empty filter.
  // Once the filter's state changes, such as on Back, the state wins.
  const committedRef = React.useRef(
    new Map<
      FilterId<TDescriptors>,
      { state: FilterState; baseline: FilterState | undefined }
    >(),
  );
  const recordCommit = React.useCallback(
    (id: FilterId<TDescriptors>, state: FilterState) => {
      if (openEditorIdRef.current === id) {
        committedRef.current.set(id, {
          state,
          baseline: (statesRef.current as Record<string, FilterState>)[id],
        });
      }
    },
    [],
  );
  const descriptorsById = React.useMemo(
    () =>
      new Map<string, TDescriptors[number]>(
        descriptors.map((descriptor) => [descriptor.id, descriptor]),
      ),
    [descriptors],
  );

  /**
   * `base` with the filter reset when its editor closes with no value. Clears
   * the editor's commit record.
   */
  const withEditorClosed = React.useCallback(
    (
      base: FilterStates<TDescriptors>,
      id: FilterId<TDescriptors>,
    ): FilterStates<TDescriptors> => {
      const currentState = (statesRef.current as Record<string, FilterState>)[
        id
      ];
      const commit = committedRef.current.get(id);
      committedRef.current.delete(id);
      const finalState =
        commit && commit.baseline === currentState
          ? commit.state
          : currentState;
      const descriptor = descriptorsById.get(id);
      if (
        !discardEmptyFilters ||
        !descriptor ||
        !finalState?.isApplied ||
        !isEmptyFilterState(finalState)
      ) {
        return base;
      }
      return { ...base, [id]: getDefaultFilterState(descriptor) };
    },
    [descriptorsById, discardEmptyFilters],
  );

  /**
   * Opens `id`'s editor and closes any other. Returns `base` with the closed
   * editor's empty filter removed.
   */
  const switchEditor = React.useCallback(
    (
      id: FilterId<TDescriptors>,
      base: FilterStates<TDescriptors>,
    ): FilterStates<TDescriptors> => {
      const previousId = openEditorIdRef.current;
      if (previousId === id) {
        return base;
      }
      committedRef.current.delete(id);
      setOpenEditor(id);
      return previousId === null ? base : withEditorClosed(base, previousId);
    },
    [setOpenEditor, withEditorClosed],
  );

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

  const openEditor = React.useCallback(
    (id: FilterId<TDescriptors>) => {
      const nextStates = switchEditor(id, states);
      if (nextStates !== states) {
        applyTransition(nextStates);
      }
    },
    [applyTransition, states, switchEditor],
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
        openEditor(descriptor.id);
        return;
      }
      const addedState =
        descriptor.type === "enum" && options?.enumValue
          ? applyEnumFilterOption(descriptor, currentState, options.enumValue)
          : getAddedFilterState(descriptor);
      // Opening this editor closes any other one. An empty filter left in that
      // editor is removed in the same transition. Two separate transitions
      // would lose one of the changes.
      const baseStates = options?.openEditor
        ? switchEditor(descriptor.id, states)
        : states;
      recordCommit(descriptor.id, addedState);
      applyTransition(
        applyFilterConflicts(descriptors, descriptor.id, addedState, {
          ...baseStates,
          [descriptor.id]: addedState,
        }),
        descriptor.id,
      );
    },
    [
      applyTransition,
      descriptors,
      openEditor,
      recordCommit,
      states,
      switchEditor,
    ],
  );

  const updateFilter = React.useCallback(
    function updateFilter<TId extends FilterId<TDescriptors>>(
      id: TId,
      newState: FilterStateForId<TDescriptors, TId>,
    ) {
      recordCommit(id, newState);
      applyTransition(
        applyFilterConflicts(descriptors, id, newState, {
          ...states,
          [id]: newState,
        }),
        id,
      );
    },
    [applyTransition, descriptors, recordCommit, states],
  );

  const removeFilter = React.useCallback(
    (id: FilterId<TDescriptors>) => {
      const descriptor = descriptorsById.get(id);
      if (!descriptor) {
        return;
      }
      committedRef.current.delete(id);
      applyTransition({
        ...states,
        [id]: getDefaultFilterState(descriptor),
      });
      if (openEditorIdRef.current === id) {
        setOpenEditor(null);
      }
    },
    [applyTransition, descriptorsById, setOpenEditor, states],
  );

  const clearFilters = React.useCallback(() => {
    committedRef.current.clear();
    applyStates(getDefaultFilterStates(descriptors), []);
    setOpenEditor(null);
  }, [applyStates, descriptors, setOpenEditor]);

  const setEditorOpen = React.useCallback(
    (id: FilterId<TDescriptors>, open: boolean) => {
      if (open) {
        openEditor(id);
        return;
      }
      if (openEditorIdRef.current !== id) {
        return;
      }
      setOpenEditor(null);
      const nextStates = withEditorClosed(states, id);
      if (nextStates !== states) {
        applyTransition(nextStates);
      }
    },
    [applyTransition, openEditor, setOpenEditor, states, withEditorClosed],
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
      discardsEmptyFilters: discardEmptyFilters,
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
      discardEmptyFilters,
      addFilter,
      updateFilter,
      removeFilter,
      clearFilters,
      openEditorId,
      setEditorOpen,
    ],
  );
}
