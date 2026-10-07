"use client";

import * as React from "react";
import { isEmptyFilterState, withoutEmptyFilters } from "./emptyFilters";
import {
  getDefaultFilterStates,
  getFilterSignature,
  loadFilterStatesFromUrl,
  resolveAppliedFilterIds,
  saveFilterStatesToUrl,
  validateFilterUrlKeyOwnership,
  type FilterDescriptorTuple,
  type FilterId,
  type FilterState,
  type FilterStates,
} from "./filter-model";
import { toEnumOptionValueArray } from "./enumOptions";
import {
  useFilters,
  type FiltersModel,
  type UseFiltersResult,
  type UseFiltersOptions,
} from "./useFilters";

export type SearchParamHistoryMode = "push" | "replace";

export interface SearchParamsAdapter {
  readonly search: string;
  updateSearchParams(
    update: (current: URLSearchParams) => URLSearchParams,
    options: { history: SearchParamHistoryMode },
  ): void;
}

export type UseSearchParamsAdapter = () => SearchParamsAdapter;

/**
 * An action from the active registration snapshot. Callbacks retained from a
 * replaced snapshot are not guaranteed to remain actionable.
 */
export type RegisteredFilterAction =
  | { id: string; label: string; onSelect(): void; options?: never }
  | {
      id: string;
      label: string;
      options: readonly { label: string; onSelect(): void }[];
      onSelect?: never;
    };

export interface FilterActionRegistry {
  acquire: (actions: readonly RegisteredFilterAction[]) => {
    update: (actions: readonly RegisteredFilterAction[]) => void;
    release: () => void;
  };
}

export interface CreateUrlBackedFiltersHookConfig {
  useSearchParamsAdapter: UseSearchParamsAdapter;
  filterActionRegistry?: FilterActionRegistry;
  history: SearchParamHistoryMode;
  /**
   * See `UseFiltersOptions.discardEmptyFilters`. Value-less filters also stay
   * out of the URL until they get a value. Back then never lands on an empty
   * pill.
   */
  discardEmptyFilters?: boolean;
  /**
   * Opt into application-ordered pills and persist their order in one
   * consumer-named URL sidecar. Omit for backward-compatible descriptor order.
   */
  filterOrdering?: {
    searchParam: string;
  };
}

export interface UseUrlBackedFiltersOptions<
  TDescriptors extends FilterDescriptorTuple,
> {
  descriptors: TDescriptors;
  registerFilterActions?: boolean;
}

export interface UrlBackedFiltersHook {
  <const TDescriptors extends FilterDescriptorTuple>(
    options: UseUrlBackedFiltersOptions<TDescriptors>,
  ): UseFiltersResult<TDescriptors>;
}

const NOOP_REGISTRY: FilterActionRegistry = {
  acquire: () => ({ update: () => {}, release: () => {} }),
};

function getActionSemanticsKey(descriptors: FilterDescriptorTuple): string {
  return JSON.stringify(
    descriptors.map((descriptor) => ({
      id: descriptor.id,
      label: descriptor.label,
      type: descriptor.type,
      isMulti: descriptor.type === "enum" ? !!descriptor.isMulti : undefined,
      options:
        descriptor.type === "enum"
          ? descriptor.options.map((option) => ({
              label: option.label,
              value: toEnumOptionValueArray(option.value),
            }))
          : undefined,
    })),
  );
}

interface PendingEmptyFilters {
  /** Applied-but-empty states that the URL leaves out, keyed by filter id. */
  readonly states: ReadonlyMap<string, FilterState>;
  /** Every applied id in pill order when these filters were last changed. */
  readonly appliedFilterIds: readonly string[];
  /**
   * Filter signature of the URL these filters were added on. Back or Forward
   * to different filters drops them.
   */
  readonly urlSignature: string;
}

const NO_PENDING_EMPTY_FILTERS: PendingEmptyFilters = {
  states: new Map(),
  appliedFilterIds: [],
  urlSignature: "",
};

function getPendingEmptyFilters(
  descriptors: FilterDescriptorTuple,
  states: Record<string, FilterState>,
  appliedFilterIds: readonly string[] | undefined,
  urlSignature: string,
): PendingEmptyFilters {
  const ids =
    appliedFilterIds ??
    descriptors
      .map((descriptor) => descriptor.id)
      .filter((id) => states[id]?.isApplied);
  const pending = new Map<string, FilterState>();
  for (const id of ids) {
    const state = states[id];
    if (state?.isApplied && isEmptyFilterState(state)) {
      pending.set(id, state);
    }
  }
  return pending.size === 0
    ? NO_PENDING_EMPTY_FILTERS
    : { states: pending, appliedFilterIds: ids, urlSignature };
}

function withPendingEmptyFilters<
  const TDescriptors extends FilterDescriptorTuple,
>(
  urlStates: FilterStates<TDescriptors>,
  urlAppliedFilterIds: readonly FilterId<TDescriptors>[],
  pending: PendingEmptyFilters,
): {
  states: FilterStates<TDescriptors>;
  appliedFilterIds: readonly FilterId<TDescriptors>[];
} {
  const byId = urlStates as Record<string, FilterState>;
  const added = [...pending.states].filter(
    ([id]) => byId[id] !== undefined && !byId[id].isApplied,
  );
  if (added.length === 0) {
    return { states: urlStates, appliedFilterIds: urlAppliedFilterIds };
  }
  const states = { ...urlStates, ...Object.fromEntries(added) };
  const applied = new Set<string>([
    ...urlAppliedFilterIds,
    ...added.map(([id]) => id),
  ]);
  const ordered = pending.appliedFilterIds.filter((id) => applied.has(id));
  const unordered = [...applied].filter((id) => !ordered.includes(id));
  return {
    states,
    appliedFilterIds: [...ordered, ...unordered] as FilterId<TDescriptors>[],
  };
}

function readFilterOrder(
  searchParams: URLSearchParams,
  searchParam: string,
): readonly string[] {
  const value = searchParams.get(searchParam);
  if (value === null) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) &&
      parsed.every((id): id is string => typeof id === "string")
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function createUrlBackedFiltersHook(
  config: CreateUrlBackedFiltersHookConfig,
): UrlBackedFiltersHook {
  const useSearchParamsAdapter = config.useSearchParamsAdapter;

  return function useUrlBackedFilters<
    const TDescriptors extends FilterDescriptorTuple,
  >({
    descriptors,
    registerFilterActions = true,
  }: UseUrlBackedFiltersOptions<TDescriptors>): UseFiltersResult<TDescriptors> {
    const filterActionRegistry = config.filterActionRegistry ?? NOOP_REGISTRY;
    const searchParams = useSearchParamsAdapter();
    const searchParamsRef = React.useRef(searchParams);
    const descriptorsRef = React.useRef(descriptors);
    const modelRef = React.useRef<FiltersModel<TDescriptors> | null>(null);

    searchParamsRef.current = searchParams;
    descriptorsRef.current = descriptors;
    const statesRef = React.useRef<FilterStates<TDescriptors> | null>(null);

    const snapshot = React.useMemo(() => {
      const current = new URLSearchParams(searchParams.search);
      const filterOrderSearchParam = config.filterOrdering?.searchParam;
      validateFilterUrlKeyOwnership(descriptors, filterOrderSearchParam);
      const preferredFilterIds =
        filterOrderSearchParam === undefined
          ? []
          : readFilterOrder(current, filterOrderSearchParam);
      const loadedStates = loadFilterStatesFromUrl(
        descriptors,
        current,
        getDefaultFilterStates(descriptors),
        preferredFilterIds,
      );
      // Links saved before empty filters stayed out of the URL can still
      // carry one, such as `status=`.
      const states =
        config.discardEmptyFilters === true
          ? withoutEmptyFilters(descriptors, loadedStates)
          : loadedStates;
      return {
        states,
        appliedFilterIds: resolveAppliedFilterIds(
          descriptors,
          states,
          preferredFilterIds,
        ),
      };
    }, [descriptors, searchParams.search]);
    const urlAppliedFilterIdsRef = React.useRef(snapshot.appliedFilterIds);
    urlAppliedFilterIdsRef.current = snapshot.appliedFilterIds;
    const [pendingEmptyFilters, setPendingEmptyFilters] = React.useState(
      NO_PENDING_EMPTY_FILTERS,
    );
    const onStatesChange = React.useCallback(
      (
        nextStates: FilterStates<TDescriptors>,
        appliedFilterIds?: readonly FilterId<TDescriptors>[],
      ) => {
        const descriptorsNow = descriptorsRef.current;
        const currentStates = statesRef.current;
        let urlStates = nextStates;
        let urlAppliedFilterIds = appliedFilterIds;
        let changesOnlyEmptyFilters = false;
        if (config.discardEmptyFilters === true) {
          urlStates = withoutEmptyFilters(descriptorsNow, nextStates);
          urlAppliedFilterIds = appliedFilterIds?.filter(
            (id) => (urlStates as Record<string, FilterState>)[id]?.isApplied,
          );
          const nextSignature = getFilterSignature(descriptorsNow, urlStates);
          setPendingEmptyFilters(
            getPendingEmptyFilters(
              descriptorsNow,
              nextStates as Record<string, FilterState>,
              appliedFilterIds,
              nextSignature,
            ),
          );
          if (currentStates !== null) {
            const keepsUrlOrder =
              urlAppliedFilterIds === undefined ||
              urlAppliedFilterIds.join() ===
                urlAppliedFilterIdsRef.current.join();
            if (
              keepsUrlOrder &&
              getFilterSignature(descriptorsNow, currentStates) ===
                nextSignature
            ) {
              return;
            }
            changesOnlyEmptyFilters =
              getFilterSignature(
                descriptorsNow,
                withoutEmptyFilters(descriptorsNow, currentStates),
              ) === nextSignature;
          }
        }
        searchParamsRef.current.updateSearchParams(
          (current) => {
            const next = saveFilterStatesToUrl(
              descriptorsRef.current,
              new URLSearchParams(current),
              urlStates,
            );
            const filterOrderSearchParam = config.filterOrdering?.searchParam;
            if (filterOrderSearchParam !== undefined) {
              const resolvedAppliedFilterIds =
                urlAppliedFilterIds ??
                resolveAppliedFilterIds(descriptorsRef.current, urlStates);
              if (resolvedAppliedFilterIds.length === 0) {
                next.delete(filterOrderSearchParam);
              } else {
                next.set(
                  filterOrderSearchParam,
                  JSON.stringify(resolvedAppliedFilterIds),
                );
              }
            }
            return next;
          },
          { history: changesOnlyEmptyFilters ? "replace" : config.history },
        );
      },
      [],
    );
    const onApplicationStatesChange = React.useCallback(
      (
        nextStates: FilterStates<TDescriptors>,
        appliedFilterIds: readonly FilterId<TDescriptors>[],
      ) => onStatesChange(nextStates, appliedFilterIds),
      [onStatesChange],
    );
    statesRef.current = snapshot.states;
    const discardEmptyFilters = config.discardEmptyFilters === true;
    const urlSignature = React.useMemo(
      () => getFilterSignature(descriptors, snapshot.states),
      [descriptors, snapshot.states],
    );
    const pendingMatchesUrl = pendingEmptyFilters.urlSignature === urlSignature;
    React.useEffect(() => {
      if (!pendingMatchesUrl) {
        setPendingEmptyFilters(NO_PENDING_EMPTY_FILTERS);
      }
    }, [pendingMatchesUrl]);
    const displayed = React.useMemo(
      () =>
        discardEmptyFilters && pendingMatchesUrl
          ? withPendingEmptyFilters(
              snapshot.states,
              snapshot.appliedFilterIds,
              pendingEmptyFilters,
            )
          : snapshot,
      [discardEmptyFilters, pendingEmptyFilters, pendingMatchesUrl, snapshot],
    );
    const filterOptions: UseFiltersOptions<TDescriptors> =
      config.filterOrdering === undefined
        ? {
            descriptors,
            discardEmptyFilters,
            states: displayed.states,
            onStatesChange,
          }
        : {
            descriptors,
            discardEmptyFilters,
            states: displayed.states,
            orderPolicy: "application",
            appliedFilterIds: displayed.appliedFilterIds,
            onStatesChange: onApplicationStatesChange,
          };
    const model = useFilters(filterOptions);

    modelRef.current = model;

    const semanticsKey = getActionSemanticsKey(descriptors);
    const actions = React.useMemo<RegisteredFilterAction[]>(
      () =>
        descriptorsRef.current.map((descriptor) => {
          if (descriptor.type === "enum") {
            return {
              id: descriptor.id,
              label: descriptor.label,
              options: descriptor.options.map((option) => ({
                label: option.label,
                onSelect() {
                  modelRef.current?.addFilter(descriptor, {
                    enumValue: option,
                  });
                },
              })),
            };
          }

          return {
            id: descriptor.id,
            label: descriptor.label,
            onSelect() {
              modelRef.current?.addFilter(descriptor, { openEditor: true });
            },
          };
        }),
      // Descriptor identity alone must not churn registered callbacks.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [semanticsKey],
    );
    const actionsRef = React.useRef(actions);
    const semanticsKeyRef = React.useRef(semanticsKey);
    const leaseRef = React.useRef<{
      lease: ReturnType<FilterActionRegistry["acquire"]>;
      semanticsKey: string;
    } | null>(null);

    actionsRef.current = actions;
    semanticsKeyRef.current = semanticsKey;

    React.useEffect(() => {
      if (!registerFilterActions) {
        return;
      }

      const lease = filterActionRegistry.acquire(actionsRef.current);
      leaseRef.current = {
        lease,
        semanticsKey: semanticsKeyRef.current,
      };
      return () => {
        if (leaseRef.current?.lease === lease) {
          leaseRef.current = null;
        }
        lease.release();
      };
    }, [filterActionRegistry, registerFilterActions]);

    React.useEffect(() => {
      const current = leaseRef.current;
      if (current && current.semanticsKey !== semanticsKey) {
        current.semanticsKey = semanticsKey;
        current.lease.update(actions);
      }
    }, [actions, semanticsKey]);

    return model;
  };
}
