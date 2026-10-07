"use client";

import * as React from "react";
import { isEmptyFilterState } from "./emptyFilters";
import type {
  FilterDescriptor,
  FilterDescriptorTuple,
  FilterState,
} from "./filter-model";
import type { FiltersModel } from "./useFilters";

/** Generic filter-bar chrome configured once on `FilterBar.Root`. */
export interface FilterBarConfig {
  /**
   * ChipFilter operator text between the filter's label and value
   * (e.g. "is").
   */
  operator: string;
  /**
   * Pill value text while a filter is applied but has no value yet
   * (e.g. "Empty").
   */
  emptyValue: string;
  /** Commit button inside string and date value editors. */
  apply: string;
  /** Custom date-preset action text inside an add-menu submenu. */
  customDatePreset?: string;
  /** Option search placeholder and accessible name for `searchable` enums. */
  searchOptions?: string;
  /** Shown when option search matches nothing. */
  noOptionResults?: string;
  /** Add-filter trigger text and accessible name. */
  addFilter: string;
  /** Clear-all-filters action text. */
  clearFilters: string;
}

export type ResolvedFilterBarConfig = Required<FilterBarConfig>;

export const DEFAULT_CONFIG: ResolvedFilterBarConfig = {
  operator: "is",
  emptyValue: "Empty",
  apply: "Apply",
  customDatePreset: "Custom",
  searchOptions: "Search",
  noOptionResults: "No results",
  addFilter: "Filter",
  clearFilters: "Clear",
};

export interface ErasedFiltersModel {
  descriptors: FilterDescriptorTuple;
  states: Record<string, FilterState | undefined>;
  appliedFilterIds: readonly string[];
  appliedCount: number;
  addFilter: (
    descriptor: FilterDescriptor<string>,
    options?: Parameters<FiltersModel["addFilter"]>[1],
  ) => void;
  updateFilter: (id: string, state: FilterState) => void;
  removeFilter: (id: string) => void;
  clearFilters: () => void;
  openEditorId: string | null;
  setEditorOpen: (id: string, open: boolean) => void;
  discardsEmptyFilters: boolean;
}

export interface FilterBarContextValue {
  model: ErasedFiltersModel;
  config: ResolvedFilterBarConfig;
  formatDateValue: (start: Date, end: Date) => string;
}

export const FilterBarContext =
  React.createContext<FilterBarContextValue | null>(null);

export function useFilterBarContext(): FilterBarContextValue {
  const context = React.useContext(FilterBarContext);
  if (context === null) {
    throw new Error("FilterBar parts must be placed within <FilterBar.Root>.");
  }
  return context;
}

/**
 * Controlled open state for a pill's value editor, backed by the model
 * (`openEditorId`/`setEditorOpen`) so external callers — e.g. a command
 * surface via `addFilter({ openEditor: true })` — open the same
 * Popover/Menu the pill trigger does.
 */
export function useEditorOpenState(id: string) {
  const { model } = useFilterBarContext();
  return {
    isOpen: model.openEditorId === id,
    setIsOpen: (open: boolean) => model.setEditorOpen(id, open),
    commit: (next: FilterState) => model.updateFilter(id, next),
    /**
     * Commits `next` and closes the editor. With empty filters discarded, an
     * empty value removes the filter in a single change.
     */
    applyAndClose: (next: FilterState) => {
      if (model.discardsEmptyFilters && isEmptyFilterState(next)) {
        model.removeFilter(id);
        return;
      }
      model.updateFilter(id, next);
      model.setEditorOpen(id, false);
    },
  };
}
