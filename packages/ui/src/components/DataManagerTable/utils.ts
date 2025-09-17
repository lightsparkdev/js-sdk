import {
  type BooleanFilterState,
  isBooleanFilterState,
} from "./BooleanFilter.js";
import {
  type CurrencyFilterState,
  isCurrencyFilterState,
} from "./CurrencyFilter.js";
import { type DateFilterState, isDateFilterState } from "./DateFilter.js";
import { type EnumFilterState, isEnumFilterState } from "./EnumFilter.js";
import { type FilterState } from "./Filter.js";
import {
  type BooleanFilter,
  type CurrencyFilter,
  type DateFilter,
  type EnumFilter,
  type Filter,
  FilterType,
  type IdFilter,
  type StringFilter,
} from "./filters.js";
import { type IdFilterState, isIdFilterState } from "./IdFilter.js";
import { type StringFilterState, isStringFilterState } from "./StringFilter.js";

interface EnumFilterAndState<T extends Record<string, unknown>> {
  filter: EnumFilter<T>;
  state: EnumFilterState;
}

interface BooleanFilterAndState<T extends Record<string, unknown>> {
  filter: BooleanFilter<T>;
  state: BooleanFilterState;
}

interface CurrencyFilterAndState<T extends Record<string, unknown>> {
  filter: CurrencyFilter<T>;
  state: CurrencyFilterState;
}

interface DateFilterAndState<T extends Record<string, unknown>> {
  filter: DateFilter<T>;
  state: DateFilterState;
}

interface IdFilterAndState<T extends Record<string, unknown>> {
  filter: IdFilter<T>;
  state: IdFilterState;
}

interface StringFilterAndState<T extends Record<string, unknown>> {
  filter: StringFilter<T>;
  state: StringFilterState;
}

export function isEnumFilterAndState<
  T extends Record<string, unknown>,
>(filterAndState: {
  filter: Filter<T>;
  state: FilterState;
}): filterAndState is EnumFilterAndState<T> {
  return (
    filterAndState.filter.type === FilterType.ENUM &&
    isEnumFilterState(filterAndState.state)
  );
}

export function isBooleanFilterAndState<
  T extends Record<string, unknown>,
>(filterAndState: {
  filter: Filter<T>;
  state: FilterState;
}): filterAndState is BooleanFilterAndState<T> {
  return (
    filterAndState.filter.type === FilterType.BOOLEAN &&
    isBooleanFilterState(filterAndState.state)
  );
}

export function isCurrencyFilterAndState<
  T extends Record<string, unknown>,
>(filterAndState: {
  filter: Filter<T>;
  state: FilterState;
}): filterAndState is CurrencyFilterAndState<T> {
  return (
    filterAndState.filter.type === FilterType.CURRENCY &&
    isCurrencyFilterState(filterAndState.state)
  );
}

export function isDateFilterAndState<
  T extends Record<string, unknown>,
>(filterAndState: {
  filter: Filter<T>;
  state: FilterState;
}): filterAndState is DateFilterAndState<T> {
  return (
    filterAndState.filter.type === FilterType.DATE &&
    isDateFilterState(filterAndState.state)
  );
}

export function isIdFilterAndState<
  T extends Record<string, unknown>,
>(filterAndState: {
  filter: Filter<T>;
  state: FilterState;
}): filterAndState is IdFilterAndState<T> {
  return (
    filterAndState.filter.type === FilterType.ID &&
    isIdFilterState(filterAndState.state)
  );
}

export function isStringFilterAndState<
  T extends Record<string, unknown>,
>(filterAndState: {
  filter: Filter<T>;
  state: FilterState;
}): filterAndState is StringFilterAndState<T> {
  return (
    filterAndState.filter.type === FilterType.STRING &&
    isStringFilterState(filterAndState.state)
  );
}
