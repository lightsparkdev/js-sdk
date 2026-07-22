"use client";

import * as React from "react";
import {
  getDefaultFilterStates,
  loadFilterStatesFromUrl,
  saveFilterStatesToUrl,
  toEnumOptionValueArray,
  type FilterDescriptorTuple,
  type FilterStates,
} from "./filter-model";
import { useFilters, type FiltersModel } from "./useFilters";

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
  ): FiltersModel<TDescriptors>;
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

export function createUrlBackedFiltersHook(
  config: CreateUrlBackedFiltersHookConfig,
): UrlBackedFiltersHook {
  const useSearchParamsAdapter = config.useSearchParamsAdapter;

  return function useUrlBackedFilters<
    const TDescriptors extends FilterDescriptorTuple,
  >({
    descriptors,
    registerFilterActions = true,
  }: UseUrlBackedFiltersOptions<TDescriptors>): FiltersModel<TDescriptors> {
    const filterActionRegistry = config.filterActionRegistry ?? NOOP_REGISTRY;
    const searchParams = useSearchParamsAdapter();
    const searchParamsRef = React.useRef(searchParams);
    const descriptorsRef = React.useRef(descriptors);
    const modelRef = React.useRef<FiltersModel<TDescriptors> | null>(null);

    searchParamsRef.current = searchParams;
    descriptorsRef.current = descriptors;

    const states = React.useMemo(
      () =>
        loadFilterStatesFromUrl(
          descriptors,
          new URLSearchParams(searchParams.search),
          getDefaultFilterStates(descriptors),
        ),
      [descriptors, searchParams.search],
    );
    const onStatesChange = React.useCallback(
      (nextStates: FilterStates<TDescriptors>) => {
        searchParamsRef.current.updateSearchParams(
          (current) =>
            saveFilterStatesToUrl(
              descriptorsRef.current,
              new URLSearchParams(current),
              nextStates,
            ),
          { history: config.history },
        );
      },
      [],
    );
    const model = useFilters({
      descriptors,
      states,
      onStatesChange,
    });

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
