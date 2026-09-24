"use client";

import * as React from "react";
import {
  getDefaultFilterStates,
  loadFilterStatesFromUrl,
  resolveAppliedFilterIds,
  saveFilterStatesToUrl,
  toEnumOptionValueArray,
  validateFilterUrlKeyOwnership,
  type FilterDescriptorTuple,
  type FilterId,
  type FilterStates,
} from "./filter-model";
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

    const snapshot = React.useMemo(() => {
      const current = new URLSearchParams(searchParams.search);
      const filterOrderSearchParam = config.filterOrdering?.searchParam;
      validateFilterUrlKeyOwnership(descriptors, filterOrderSearchParam);
      const preferredFilterIds =
        filterOrderSearchParam === undefined
          ? []
          : readFilterOrder(current, filterOrderSearchParam);
      const states = loadFilterStatesFromUrl(
        descriptors,
        current,
        getDefaultFilterStates(descriptors),
        preferredFilterIds,
      );
      return {
        states,
        appliedFilterIds: resolveAppliedFilterIds(
          descriptors,
          states,
          preferredFilterIds,
        ),
      };
    }, [descriptors, searchParams.search]);
    const onStatesChange = React.useCallback(
      (
        nextStates: FilterStates<TDescriptors>,
        appliedFilterIds?: readonly FilterId<TDescriptors>[],
      ) => {
        searchParamsRef.current.updateSearchParams(
          (current) => {
            const next = saveFilterStatesToUrl(
              descriptorsRef.current,
              new URLSearchParams(current),
              nextStates,
            );
            const filterOrderSearchParam = config.filterOrdering?.searchParam;
            if (filterOrderSearchParam !== undefined) {
              const resolvedAppliedFilterIds =
                appliedFilterIds ??
                resolveAppliedFilterIds(descriptorsRef.current, nextStates);
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
          { history: config.history },
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
    const filterOptions: UseFiltersOptions<TDescriptors> =
      config.filterOrdering === undefined
        ? {
            descriptors,
            states: snapshot.states,
            onStatesChange,
          }
        : {
            descriptors,
            states: snapshot.states,
            orderPolicy: "application",
            appliedFilterIds: snapshot.appliedFilterIds,
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
