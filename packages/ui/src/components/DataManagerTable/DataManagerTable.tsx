import styled from "@emotion/styled";
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type Dispatch,
  type ReactElement,
  type SetStateAction,
} from "react";

import { css } from "@emotion/react";
import { type CSSInterpolation } from "@emotion/serialize";
import { CurrencyUnit, ensureArray } from "@lightsparkdev/core";
import { useSearchParams } from "react-router-dom";
import { type useClipboard } from "../../hooks/useClipboard.js";
import { bp, useBreakpoints } from "../../styles/breakpoints.js";
import { colors } from "../../styles/colors.js";
import {
  standardBorderRadius,
  standardContentInset,
} from "../../styles/common.js";
import { getColor, themeOr, themeOrWithKey } from "../../styles/themes.js";
import { Spacing } from "../../styles/tokens/spacing.js";
import { z } from "../../styles/z-index.js";
import { Button, StyledButton } from "../Button.js";
import { StyledButtonRow } from "../ButtonRow.js";
import { CardPageFullWidth } from "../CardPage.js";
import { Dropdown, type DropdownItemType } from "../Dropdown.js";
import { Flex } from "../Flex.js";
import { Icon } from "../Icon/Icon.js";
import { Modal } from "../Modal.js";
import {
  Table,
  type CustomTableComponents,
  type TableProps,
} from "../Table/Table.js";
import { TextIconAligner } from "../TextIconAligner.js";
import { type TextInput } from "../TextInput.js";
import { Body } from "../typography/Body.js";
import { Label } from "../typography/Label.js";
import { LabelModerate } from "../typography/LabelModerate.js";
import {
  BooleanFilter,
  getDefaultBooleanFilterState,
  type BooleanFilterState,
} from "./BooleanFilter.js";
import {
  CurrencyFilter,
  getDefaultCurrencyFilterState,
  type CurrencyFilterState,
} from "./CurrencyFilter.js";
import {
  DateFilter,
  DatePreset,
  getDefaultDateFilterState,
  type DateFilterState,
} from "./DateFilter.js";
import {
  EnumFilter,
  getDefaultEnumFilterState,
  isEnumFilterState,
  type EnumFilterState,
} from "./EnumFilter.js";
import { type FilterState } from "./Filter.js";
import {
  FilterType,
  isValidNumberFilterValue,
  type Filter,
  type IdFilter as IdFilterType,
  type StringFilter as StringFilterType,
} from "./filters.js";
import {
  getDefaultIdFilterState,
  IdFilter,
  isIdFilterState,
  type IdFilterState,
} from "./IdFilter.js";
import {
  getDefaultInputObjectFilterState,
  InputObjectFilter,
  type InputObjectFilterState,
} from "./InputObjectFilter.js";
import {
  getDefaultNumberFilterState,
  NumberFilter,
  type NumberFilterState,
} from "./NumberFilter.js";
import { PillFilter } from "./PillFilter.js";
import {
  getDefaultStringFilterState,
  isStringFilterState,
  StringFilter,
  type StringFilterState,
} from "./StringFilter.js";

interface FilterOptions<
  T extends Record<string, unknown>,
  QueryVariablesType,
  QueryResultType,
> {
  filters: Filter<T>[];
  getFilterQueryVariables: (
    filters: Filter<T>[],
    filterState: DataManagerTableState<T>,
    pageSize: number,
  ) => QueryVariablesType;
  refetch: (fetchVariables: QueryVariablesType) => Promise<QueryResultType>;
  initialQueryVariables: QueryVariablesType;
  /**
   * Called when a filter state changes.
   * Use setFilterStates to modify other filters (e.g., for mutual exclusivity).
   */
  onFilterStateChange?: (
    changedKey: keyof T,
    newState: FilterState,
    setFilterStates: Dispatch<SetStateAction<DataManagerTableState<T>>>,
  ) => void;
}

interface ShowMoreOptions<QueryVariablesType, QueryResultType> {
  refetch: (fetchVariables: QueryVariablesType) => Promise<QueryResultType>;
  initialQueryVariables: QueryVariablesType;
  // Determines which variables to update when the page size changes.
  pageSizeVariables?: string[] | undefined;
}

interface CustomDataManagerTableComponents<T extends Record<string, unknown>>
  extends CustomTableComponents {
  filterContainerComponent?: React.ComponentType<
    React.ComponentProps<typeof DataManagerTableFilterContainer>
  >;
  dataManagerTableHeaderComponent?: React.ComponentType<
    React.ComponentProps<typeof DataManagerTableHeader>
  >;
  textInputComponent?: React.ComponentType<
    React.ComponentProps<typeof TextInput>
  >;
  customCalendarCss?: CSSInterpolation | undefined;
  filterControlsComponent?: React.ComponentType<
    DataManagerTableFilterControlsProps<T>
  >;
}

export type DataManagerTableProps<
  T extends Record<string, unknown>,
  QueryVariablesType,
  QueryResultType,
> = TableProps<T> & {
  pageSizes: number[];
  nextPageCursor?: string | null | undefined;
  resultCount?: number | undefined;
  isFullCount?: boolean | undefined;
  showHeader?: boolean;
  loading?: boolean | undefined;
  // If provided, the show more button will be displayed at the bottom of the table.
  showMoreOptions?:
    | ShowMoreOptions<QueryVariablesType, QueryResultType>
    | undefined;
  // If provided, will show filter options.
  filterOptions?:
    | FilterOptions<T, QueryVariablesType, QueryResultType>
    | undefined;
  clipboardCallbacks?: Parameters<typeof useClipboard>[0] | undefined;
  header?: ReactElement;
  cardPageFullWidth?: boolean | undefined;
  cardPageMt?: number;
  filterDropdownAlign?: "left" | "right" | "center";
  filterButtonProps?: ComponentProps<typeof Button>;
  filterEditorStyle?: "default" | "pills";
  customComponents?: CustomDataManagerTableComponents<T>;
  paginationDisplayOptions?:
    | {
        showPaginationPreviousNext?: boolean | undefined;
        pageSizeStringTemplate?: string | undefined;
        showPageNumberButtons?: boolean | undefined;
      }
    | undefined;
  minHeight?: number | undefined;
  enableURLFilters?: boolean | undefined;
  urlFilterNamespace?: string | undefined;
  refetchOnPropsChange?: (string | number | boolean)[] | undefined;
  showFooter?: boolean | undefined;
};

export type DataManagerTableState<T extends Record<string, unknown>> = Record<
  keyof T,
  FilterState
>;

export type DataManagerTableFilterControlsProps<
  T extends Record<string, unknown>,
> = {
  filters: Filter<T>[];
  filterStates: DataManagerTableState<T>;
  onBeginFilter: (filter: Filter<T>) => void;
  onCommitFilter: (filter: Filter<T>, state: FilterState) => void;
  onRemoveFilter: (filter: Filter<T>) => void;
  onClearFilters: () => void;
};

function getDefaultFilterState<T extends Record<string, unknown>>(
  filter: Filter<T>,
) {
  switch (filter.type) {
    case FilterType.DATE:
      return getDefaultDateFilterState();
    case FilterType.ENUM:
      return getDefaultEnumFilterState();
    case FilterType.STRING:
      return getDefaultStringFilterState();
    case FilterType.ID:
      return getDefaultIdFilterState(filter.allowedEntities, filter.validation);
    case FilterType.BOOLEAN:
      return getDefaultBooleanFilterState();
    case FilterType.CURRENCY:
      return getDefaultCurrencyFilterState();
    case FilterType.NUMBER:
      return getDefaultNumberFilterState();
    case FilterType.INPUT_OBJECT:
      return getDefaultInputObjectFilterState();
    default:
      throw new Error("Invalid filter type");
  }
}

function initialFilterState<T extends Record<string, unknown>>(
  filters: Filter<T>[],
) {
  let state: DataManagerTableState<T> = {} as DataManagerTableState<T>;
  filters.forEach((filter) => {
    state = {
      ...state,
      [filter.accessorKey]: getDefaultFilterState<T>(filter),
    };
  });

  return state;
}

type PageCursorState = {
  startResult: number | undefined;
  nextPageCursor: string | null | undefined;
  cursorCache: {
    [pageSize: number]: {
      [key: number]: string;
    };
  };
};

// Utility functions for URL state management
function saveFiltersToURL<T extends Record<string, unknown>>(
  searchParams: URLSearchParams,
  filters: Filter<T>[],
  filterStates: DataManagerTableState<T>,
  currentPage: number,
  namespace?: string,
): URLSearchParams {
  // Clear all existing filter-related params first
  filters.forEach((filter) => {
    searchParams.delete(getURLFilterKey(filter, namespace));
  });

  // Set new filter values based on filter accessorKeys
  filters.forEach((filter) => {
    const filterState = filterStates[filter.accessorKey];
    const urlKey = getURLFilterKey(filter, namespace);
    if (filterState && filterState.isApplied) {
      if (
        filter.type === FilterType.STRING ||
        filter.type === FilterType.ENUM ||
        filter.type === FilterType.ID
      ) {
        const appliedValues = (
          filterState as StringFilterState | EnumFilterState | IdFilterState
        ).appliedValues;
        if (appliedValues?.length) {
          searchParams.set(urlKey, appliedValues.join(","));
        }
      } else if (filter.type === FilterType.BOOLEAN) {
        const appliedValue = (filterState as BooleanFilterState).value;
        if (appliedValue !== undefined) {
          searchParams.set(urlKey, String(appliedValue));
        }
      } else if (filter.type === FilterType.DATE) {
        const dateFilter = filterState as DateFilterState;
        const startStr = dateFilter.start ? dateFilter.start.toISOString() : "";
        const endStr = dateFilter.end ? dateFilter.end.toISOString() : "";
        if (startStr || endStr) {
          searchParams.set(urlKey, `${startStr},${endStr}`);
        }
      } else if (filter.type === FilterType.CURRENCY) {
        const currencyFilter = filterState as CurrencyFilterState;
        const minValue = currencyFilter.min_amount?.value;
        const maxValue = currencyFilter.max_amount?.value;
        if (minValue !== undefined || maxValue !== undefined) {
          const currencyValue =
            minValue !== undefined && maxValue !== undefined
              ? `${minValue}-${maxValue}`
              : minValue !== undefined
              ? `>${minValue}`
              : `<${maxValue}`;
          searchParams.set(urlKey, currencyValue);
        }
      } else if (filter.type === FilterType.NUMBER) {
        const value = (filterState as NumberFilterState).value;
        if (value) {
          searchParams.set(urlKey, value);
        }
      } else if (filter.type === FilterType.INPUT_OBJECT) {
        const values = (filterState as InputObjectFilterState).values;
        if (Object.values(values).some((fieldValues) => fieldValues.length)) {
          searchParams.set(urlKey, JSON.stringify(values));
        }
      }
    }
  });

  return searchParams;
}

function loadFiltersFromURL<T extends Record<string, unknown>>(
  searchParams: URLSearchParams,
  filters: Filter<T>[],
  namespace?: string,
): DataManagerTableState<T> {
  const newFilterStates = initialFilterState(filters);

  // Update each filter based on URL params
  filters.forEach((filter) => {
    const paramValue = searchParams.get(getURLFilterKey(filter, namespace));

    if (paramValue !== null && paramValue !== undefined && paramValue !== "") {
      // URL has a value for this filter
      if (filter.type === FilterType.STRING) {
        const stringFilter = newFilterStates[
          filter.accessorKey
        ] as StringFilterState;
        const appliedValues = filter.isMulti
          ? paramValue.split(",").filter((v) => v.trim() !== "")
          : [paramValue];
        newFilterStates[filter.accessorKey] = {
          ...stringFilter,
          appliedValues,
          isApplied: true,
        } as StringFilterState;
      } else if (filter.type === FilterType.ENUM) {
        const enumFilter = newFilterStates[
          filter.accessorKey
        ] as EnumFilterState;
        const candidateValues = paramValue
          .split(",")
          .filter((value) => value.trim() !== "");
        const allowedValues = new Set(
          filter.enumValues.flatMap((option) => ensureArray(option.value)),
        );
        const matchingScalarOption = filter.enumValues.find((option) => {
          const optionValues = ensureArray(option.value);
          return (
            optionValues.length === candidateValues.length &&
            optionValues.every((value) => candidateValues.includes(value))
          );
        });
        const appliedValues = filter.isMulti
          ? candidateValues.filter((value) => allowedValues.has(value))
          : matchingScalarOption
          ? ensureArray(matchingScalarOption.value)
          : [];
        if (appliedValues.length) {
          newFilterStates[filter.accessorKey] = {
            ...enumFilter,
            appliedValues,
            isApplied: true,
          } as EnumFilterState;
        }
      } else if (filter.type === FilterType.ID) {
        const idFilter = newFilterStates[filter.accessorKey] as IdFilterState;
        const candidateValues = filter.isMulti
          ? paramValue.split(",").filter((v) => v.trim() !== "")
          : [paramValue];
        const appliedValues = candidateValues.flatMap((value) => {
          const normalizedValue = normalizeURLIdValue(value, filter);
          return normalizedValue === null ? [] : [normalizedValue];
        });
        if (appliedValues.length) {
          newFilterStates[filter.accessorKey] = {
            ...idFilter,
            appliedValues,
            isApplied: true,
          } as IdFilterState;
        }
      } else if (filter.type === FilterType.BOOLEAN) {
        const booleanFilter = newFilterStates[
          filter.accessorKey
        ] as BooleanFilterState;
        if (paramValue === "true" || paramValue === "false") {
          newFilterStates[filter.accessorKey] = {
            ...booleanFilter,
            value: paramValue === "true",
            isApplied: true,
          } as BooleanFilterState;
        }
      } else if (filter.type === FilterType.DATE) {
        const dateFilter = newFilterStates[
          filter.accessorKey
        ] as DateFilterState;
        // Parse start and end dates from comma-separated ISO strings
        if (paramValue.includes(",")) {
          const [startStr, endStr] = paramValue.split(",");
          const parsedStart = startStr ? new Date(startStr) : null;
          const parsedEnd = endStr ? new Date(endStr) : null;
          const startDate =
            parsedStart && !isNaN(parsedStart.getTime()) ? parsedStart : null;
          const endDate =
            parsedEnd && !isNaN(parsedEnd.getTime()) ? parsedEnd : null;
          const isOrderedRange =
            !startDate || !endDate || startDate.getTime() <= endDate.getTime();
          if ((startDate || endDate) && isOrderedRange) {
            newFilterStates[filter.accessorKey] = {
              ...dateFilter,
              start: startDate,
              end: endDate,
              isApplied: true,
            } as DateFilterState;
          }
        } else {
          // Single date value (no comma)
          const dateValue = new Date(paramValue);
          if (!isNaN(dateValue.getTime())) {
            newFilterStates[filter.accessorKey] = {
              ...dateFilter,
              start: dateValue,
              end: null,
              isApplied: true,
            } as DateFilterState;
          }
        }
      } else if (filter.type === FilterType.CURRENCY) {
        const currencyFilter = newFilterStates[
          filter.accessorKey
        ] as CurrencyFilterState;
        if (paramValue.startsWith(">")) {
          const min = parseSafeInteger(paramValue.substring(1));
          if (min !== null) {
            newFilterStates[filter.accessorKey] = {
              ...currencyFilter,
              min_amount: { value: min, unit: CurrencyUnit.SATOSHI },
              max_amount: null,
              isApplied: true,
            } as CurrencyFilterState;
          }
        } else if (paramValue.startsWith("<")) {
          const max = parseSafeInteger(paramValue.substring(1));
          if (max !== null) {
            newFilterStates[filter.accessorKey] = {
              ...currencyFilter,
              min_amount: null,
              max_amount: { value: max, unit: CurrencyUnit.SATOSHI },
              isApplied: true,
            } as CurrencyFilterState;
          }
        } else {
          const range = paramValue.match(/^(-?\d+)-(-?\d+)$/);
          if (range) {
            const min = parseSafeInteger(range[1]);
            const max = parseSafeInteger(range[2]);
            if (min !== null && max !== null && min <= max) {
              newFilterStates[filter.accessorKey] = {
                ...currencyFilter,
                min_amount: { value: min, unit: CurrencyUnit.SATOSHI },
                max_amount: { value: max, unit: CurrencyUnit.SATOSHI },
                isApplied: true,
              } as CurrencyFilterState;
            }
          }
        }
      } else if (filter.type === FilterType.NUMBER) {
        if (isValidNumberFilterValue(paramValue, filter)) {
          newFilterStates[filter.accessorKey] = {
            ...(newFilterStates[filter.accessorKey] as NumberFilterState),
            value: paramValue,
            isApplied: true,
          } as NumberFilterState;
        }
      } else if (filter.type === FilterType.INPUT_OBJECT) {
        try {
          const values = JSON.parse(paramValue) as unknown;
          if (values && typeof values === "object" && !Array.isArray(values)) {
            const sanitizedValues = Object.fromEntries(
              filter.fields.flatMap((field) => {
                const fieldValues = (values as Record<string, unknown>)[
                  field.name
                ];
                if (!Array.isArray(fieldValues)) return [];
                const allowedValues = new Set(
                  field.enumValues.flatMap((option) =>
                    ensureArray(option.value),
                  ),
                );
                const validValues = fieldValues.filter(
                  (value): value is string =>
                    typeof value === "string" && allowedValues.has(value),
                );
                if (!validValues.length) return [];
                return [
                  [
                    field.name,
                    field.isMulti ? validValues : validValues.slice(0, 1),
                  ],
                ];
              }),
            );
            if (Object.keys(sanitizedValues).length) {
              newFilterStates[filter.accessorKey] = {
                ...(newFilterStates[
                  filter.accessorKey
                ] as InputObjectFilterState),
                values: sanitizedValues,
                isApplied: true,
              } as InputObjectFilterState;
            }
          }
        } catch {
          newFilterStates[filter.accessorKey] =
            getDefaultInputObjectFilterState();
        }
      }
    }
  });

  return newFilterStates;
}

function getURLFilterKey<T extends Record<string, unknown>>(
  filter: Filter<T>,
  namespace?: string,
) {
  const accessorKey = String(filter.accessorKey);
  return namespace ? `${namespace}.${accessorKey}` : accessorKey;
}

function getURLFilterSignature<T extends Record<string, unknown>>(
  searchParams: URLSearchParams,
  filters: Filter<T>[],
  namespace?: string,
) {
  return JSON.stringify(
    filters.map((filter) => {
      const key = getURLFilterKey(filter, namespace);
      return [key, searchParams.get(key)];
    }),
  );
}

function parseSafeInteger(value: string) {
  const numericValue = Number(value);
  return /^-?\d+$/.test(value) && Number.isSafeInteger(numericValue)
    ? numericValue
    : null;
}

function normalizeURLIdValue<T extends Record<string, unknown>>(
  value: string,
  filter: IdFilterType<T>,
) {
  if ((filter.validation ?? "uuid") === "none") return value;

  const entityPrefix = filter.allowedEntities?.find((entity) =>
    value.startsWith(`${entity}:`),
  );
  const uuid = entityPrefix ? value.slice(entityPrefix.length + 1) : value;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    uuid,
  )
    ? uuid
    : null;
}

export function DataManagerTable<
  T extends Record<string, unknown>,
  QueryVariablesType,
  QueryResultType,
>(props: DataManagerTableProps<T, QueryVariablesType, QueryResultType>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlFilterSignature =
    props.filterOptions && props.enableURLFilters
      ? getURLFilterSignature(
          searchParams,
          props.filterOptions.filters,
          props.urlFilterNamespace,
        )
      : "";
  const locallyAppliedURLSignatureRef = useRef<string | null>(null);
  const isCardPageFullWidth =
    typeof props.cardPageFullWidth === "boolean"
      ? props.cardPageFullWidth
      : true;
  const cardPageMt =
    typeof props.cardPageMt === "undefined" ? 24 : props.cardPageMt;
  const showPaginationPreviousNext =
    typeof props.paginationDisplayOptions?.showPaginationPreviousNext ===
    "boolean"
      ? props.paginationDisplayOptions.showPaginationPreviousNext
      : true;
  const pageSizeString =
    typeof props.paginationDisplayOptions?.pageSizeStringTemplate === "string"
      ? props.paginationDisplayOptions.pageSizeStringTemplate
      : "Show {pageSize} items";
  const showFooter =
    typeof props.showFooter === "boolean" ? props.showFooter : true;
  const breakPoint = useBreakpoints();
  const [pageSize, setPageSize] = useState<number>(props.pageSizes?.[0] || 20);
  const [pageCursorState, setPageCursorState] = useState<PageCursorState>({
    startResult: undefined,
    nextPageCursor: props.nextPageCursor,
    cursorCache: {},
  });
  const [isLoading, setIsLoading] = useState<boolean>(props.loading || false);
  const [hasLoadedFiltersFromURL, setHasLoadedFiltersFromURL] =
    useState<boolean>(false);
  const [numFiltersApplied, setNumFiltersApplied] = useState<number>(0);
  const [showFilterEditor, setShowFilterEditor] = useState<boolean>(false);
  const [filterStates, setFilterStates] = useState<DataManagerTableState<T>>(
    props.filterOptions
      ? initialFilterState(props.filterOptions.filters)
      : ({} as DataManagerTableState<T>),
  );
  const filterStatesRef = useRef(filterStates);
  filterStatesRef.current = filterStates;
  const updateFilterStates = (
    updater: SetStateAction<DataManagerTableState<T>>,
  ) => {
    const newStates =
      typeof updater === "function"
        ? updater(filterStatesRef.current)
        : updater;
    filterStatesRef.current = newStates;
    setFilterStates(newStates);
    return newStates;
  };
  const [fetchVariables, setFetchVariables] = useState<QueryVariablesType>(
    props.filterOptions?.initialQueryVariables || ({} as QueryVariablesType),
  );

  const DropdownComponent =
    props.customComponents?.dropdownComponent || Dropdown;

  const isSm = breakPoint.isSm();

  useEffect(() => {
    setIsLoading(Boolean(props.loading));
  }, [props.loading]);

  // Sync filter states with URL query parameters
  useEffect(() => {
    if (!props.filterOptions || !props.enableURLFilters) return;

    if (locallyAppliedURLSignatureRef.current === urlFilterSignature) {
      locallyAppliedURLSignatureRef.current = null;
      return;
    }
    locallyAppliedURLSignatureRef.current = null;

    const { filters, getFilterQueryVariables } = props.filterOptions;

    // Load filter states from URL query parameters
    const newFilterStates = loadFiltersFromURL(
      searchParams,
      filters,
      props.urlFilterNamespace,
    );
    updateFilterStates(newFilterStates);

    const newFetchVariables = getFilterQueryVariables(
      filters,
      newFilterStates,
      pageSize,
    );
    setFetchVariables(newFetchVariables);

    // Update the count of applied filters
    const numFiltersApplied = Object.values(newFilterStates).reduce(
      (acc, state) => {
        return state.isApplied ? acc + 1 : acc;
      },
      0,
    );
    setNumFiltersApplied(numFiltersApplied);

    // Refetch data if filters changed and we have filter options
    if (
      hasLoadedFiltersFromURL ||
      Object.values(newFilterStates).some((state) => state.isApplied)
    ) {
      setIsLoading(true);

      // Clear start result number when filters change
      setPageCursorState((prevState) => ({
        ...prevState,
        startResult: undefined,
      }));

      // Refetch with new filter variables
      props.filterOptions
        .refetch(newFetchVariables)
        .then(() => {
          setIsLoading(false);
        })
        .catch((e) => {
          setIsLoading(false);
          throw e;
        });
    }

    setHasLoadedFiltersFromURL(true);
  }, [urlFilterSignature]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle refetching data when props from the parent component change.
  useEffect(() => {
    if (
      props.refetchOnPropsChange &&
      props.filterOptions &&
      hasLoadedFiltersFromURL
    ) {
      void handleApplyFilters(filterStates, props.filterOptions, pageSize);
    }
  }, [...(props.refetchOnPropsChange || []), hasLoadedFiltersFromURL]); // eslint-disable-line react-hooks/exhaustive-deps

  // When data is fetched, the nextPageCursor associated with the results changes.
  // We then need to update the current result number and the cursor cache.
  // The cursor cache remembers previously seen cursors for paginating to the previous page.
  // New cursors are added to the cache.
  useEffect(() => {
    if (!props.nextPageCursor) {
      return;
    }

    // Find the result number that the cursor is associated with
    const cursorCacheResult = Object.entries(
      pageCursorState.cursorCache[pageSize] || {},
    ).find(([_, cursor]) => cursor === props.nextPageCursor);

    // If the cursor exists already, update the start result to the result number
    if (cursorCacheResult) {
      setPageCursorState((prevState) => ({
        ...prevState,
        startResult: parseInt(cursorCacheResult[0]),
        nextPageCursor: cursorCacheResult[1],
      }));
    } else {
      // Otherwise, update the result number and cursor cache with the new cursor
      setPageCursorState((prevState) => {
        // Only update if the cursor has changed
        if (
          prevState.nextPageCursor === props.nextPageCursor &&
          prevState.startResult !== undefined
        )
          return prevState;

        // Either start at 1 or add the page size to the result number
        const startResult =
          prevState.startResult === undefined
            ? 1
            : prevState.startResult + pageSize;

        return {
          ...prevState,
          startResult,
          nextPageCursor: props.nextPageCursor,
          cursorCache: {
            ...prevState.cursorCache,
            [pageSize]: {
              ...prevState.cursorCache[pageSize],
              [startResult]: props.nextPageCursor!,
            },
          },
        };
      });
    }
  }, [props.nextPageCursor, pageSize, pageCursorState.cursorCache]);

  function updateFilterState(filter: Filter<T>) {
    return (state: FilterState) => {
      updateFilterStates((prevState) => ({
        ...prevState,
        [filter.accessorKey]: state,
      }));
    };
  }

  const handleApplyFilters = async (
    filterStates: DataManagerTableState<T>,
    filterOptions: FilterOptions<T, QueryVariablesType, QueryResultType>,
    pageSize: number,
  ) => {
    const { filters, refetch, getFilterQueryVariables } = filterOptions;

    // Make a copy of the filter states to avoid saving any modified filter values.
    const appliedFilterStates = {
      ...filterStates,
    };

    // Validate that the filter states are valid
    let isValid = true;
    for (const filter of filters) {
      const filterState = appliedFilterStates[filter.accessorKey];
      if (filterState.isApplied && filterState.onValidate) {
        const validResult = filterState.onValidate(
          filterState,
          (filter as { isMulti?: boolean }).isMulti,
        );
        if (validResult) {
          // Apply the result of the validation for refetching data
          appliedFilterStates[filter.accessorKey] = validResult;

          // Update UI filter state as a result of applying if needed
          if (isIdFilterState(filterState)) {
            const appliedValues = (validResult as IdFilterState).appliedValues;
            updateFilterState(filter)({
              ...filterStates[filter.accessorKey],
              value: "",
              appliedValues: appliedValues ? [...appliedValues] : [],
            });
          }
        } else {
          // Set error messages on each state
          filterState.errorMessage =
            filter.errorMessage || "Error validating input";
          isValid = false;
        }
      }
    }
    if (!isValid) {
      // Trigger state update with all the error messages
      updateFilterStates((prevState) => ({
        ...prevState,
      }));
      return;
    }

    // Handle filter types that can have multiple applied values.
    for (const filter of filters) {
      const filterState = appliedFilterStates[filter.accessorKey];
      if (!filterState.isApplied) continue;

      if (isStringFilterState(filterState)) {
        if (filterState.value) {
          const value = filterState.value;
          let updatedAppliedValues: string[] = [];
          if ((filter as StringFilterType<T>).isMulti) {
            updatedAppliedValues =
              filterState.appliedValues?.filter(
                (appliedValue) => appliedValue !== value,
              ) || [];
          }
          updatedAppliedValues.push(value);

          const newFilterState = {
            ...filterStates[filter.accessorKey],
            value: "",
            appliedValues: updatedAppliedValues,
          } as StringFilterState;

          // Apply the result of the validation for refetching data
          appliedFilterStates[filter.accessorKey] = newFilterState;
          // Update UI filter state as a result of applying if needed
          updateFilterState(filter)(newFilterState);
        }
      } else if (isEnumFilterState(filterState)) {
        if (filterState.value) {
          const newFilterState = {
            ...filterStates[filter.accessorKey],
            value: "",
            appliedValues: filterState.appliedValues,
          } as EnumFilterState;

          // Apply the result of the validation for refetching data
          appliedFilterStates[filter.accessorKey] = newFilterState;
          // Update UI filter state as a result of applying if needed
          updateFilterState(filter)(newFilterState);
        }
      }
    }

    // Count the number of filters that are applied
    const numFiltersApplied = Object.values(appliedFilterStates).reduce(
      (acc, state) => {
        return state.isApplied ? acc + 1 : acc;
      },
      0,
    );
    setNumFiltersApplied(numFiltersApplied);

    // Note: we only want to apply the filter states updated with validation results.
    setShowFilterEditor(false);
    setIsLoading(true);

    const newFetchVariables = getFilterQueryVariables(
      filters,
      appliedFilterStates,
      pageSize,
    );
    setFetchVariables(newFetchVariables);

    if (props.enableURLFilters) {
      // Update url query params with the applied filters using utility function
      const newSearchParams = saveFiltersToURL(
        new URLSearchParams(searchParams),
        filters,
        appliedFilterStates,
        currentPage,
        props.urlFilterNamespace,
      );
      const newURLFilterSignature = getURLFilterSignature(
        newSearchParams,
        filters,
        props.urlFilterNamespace,
      );
      if (newURLFilterSignature !== urlFilterSignature) {
        locallyAppliedURLSignatureRef.current = newURLFilterSignature;
      }
      setSearchParams(newSearchParams);
    }

    // Clear start result number when filters are applied
    setPageCursorState((prevState) => ({
      ...prevState,
      startResult: undefined,
    }));

    try {
      await refetch(newFetchVariables);
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
    setIsLoading(false);
  };

  const handleClearFilters = () => {
    if (props.filterOptions) {
      const { filters } = props.filterOptions;
      const newFilterStates = initialFilterState(filters);
      updateFilterStates(newFilterStates);
      void handleApplyFilters(newFilterStates, props.filterOptions, pageSize);
    }
  };

  const handleBeginPillFilter = (filter: Filter<T>) => {
    updateFilterStates((currentStates) => ({
      ...currentStates,
      [filter.accessorKey]: getDefaultFilterState<T>(filter),
    }));
  };

  const handleCommitPillFilter = (
    filter: Filter<T>,
    newFilterState: FilterState,
  ) => {
    const newStates = updateFilterStates((currentStates) => {
      let nextStates = {
        ...currentStates,
        [filter.accessorKey]: newFilterState,
      };
      props.filterOptions?.onFilterStateChange?.(
        filter.accessorKey,
        newFilterState,
        (updater) => {
          nextStates =
            typeof updater === "function" ? updater(nextStates) : updater;
        },
      );
      return nextStates;
    });
    void handleApplyFilters(newStates, props.filterOptions!, pageSize);
  };

  const handleRemovePillFilter = (filter: Filter<T>) => {
    const newStates = updateFilterStates((currentStates) => ({
      ...currentStates,
      [filter.accessorKey]: getDefaultFilterState<T>(filter),
    }));
    void handleApplyFilters(newStates, props.filterOptions!, pageSize);
  };

  const handleNext = async () => {
    if (!props.filterOptions) {
      return;
    }

    const { refetch } = props.filterOptions;

    setIsLoading(true);

    // Update the page cursor query param but keep the filters intact
    const newFetchVariables: QueryVariablesType = {
      ...fetchVariables,
      after:
        pageCursorState === undefined
          ? undefined
          : pageCursorState.nextPageCursor,
    };
    setFetchVariables(newFetchVariables);

    try {
      await refetch(newFetchVariables);
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
    setIsLoading(false);
  };

  const handlePrev = async () => {
    if (!props.filterOptions) {
      return;
    }

    const { refetch } = props.filterOptions;

    setIsLoading(true);

    // Update the page cursor query param but keep the filters intact
    const newFetchVariables: QueryVariablesType = {
      ...fetchVariables,
      after: pageCursorState.startResult
        ? pageCursorState.cursorCache[pageSize][
            pageCursorState.startResult - pageSize - pageSize
          ]
        : undefined,
    };
    setFetchVariables(newFetchVariables);

    try {
      await refetch(newFetchVariables);
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
    setIsLoading(false);
  };

  const currentPage =
    Math.floor((pageCursorState.startResult || 0) / pageSize) + 1;

  const handleChangePage = async (page: number) => {
    const pageCursorIndex = (page - 1) * pageSize + 1 - pageSize;
    const cachedCursorState =
      pageCursorState.cursorCache[pageSize][pageCursorIndex];

    // If the page is not yet queried, don't allow jumping ahead.
    // Also don't requery for the current page.
    if (
      !props.filterOptions ||
      (pageCursorIndex > 0 && !cachedCursorState) ||
      page === currentPage
    ) {
      return;
    }

    const { refetch } = props.filterOptions;

    setIsLoading(true);
    const newFetchVariables: QueryVariablesType = {
      ...fetchVariables,
      after: cachedCursorState,
    };
    setFetchVariables(newFetchVariables);

    try {
      await refetch(newFetchVariables);
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
    setIsLoading(false);
  };

  const handleChangePageSize = async (size: number) => {
    setPageSize(size);

    if (props.showMoreOptions) {
      const { refetch, initialQueryVariables } = props.showMoreOptions;

      setIsLoading(true);
      let pageSizeQueryVariables: Record<string, number>;
      if (props.showMoreOptions.pageSizeVariables) {
        pageSizeQueryVariables = {};
        for (const variable of props.showMoreOptions.pageSizeVariables) {
          pageSizeQueryVariables[variable] = size;
        }
      } else {
        pageSizeQueryVariables = { first: size };
      }
      const newFetchVariables = {
        ...initialQueryVariables,
        ...pageSizeQueryVariables,
      };
      setFetchVariables(newFetchVariables);

      try {
        await refetch(newFetchVariables);
      } catch (e) {
        setIsLoading(false);
        throw e;
      }
      setIsLoading(false);
    } else if (props.filterOptions) {
      void handleApplyFilters(filterStates, props.filterOptions, size);
    }
  };

  const createFilterStateUpdater =
    (filter: Filter<T>) => (state: FilterState) => {
      updateFilterStates((prevState) => ({
        ...prevState,
        [filter.accessorKey]: state,
      }));
      props.filterOptions?.onFilterStateChange?.(
        filter.accessorKey,
        state,
        updateFilterStates,
      );
    };

  const filterSections = props.filterOptions
    ? props.filterOptions.filters.map((filter: Filter<T>) => {
        switch (filter.type) {
          case FilterType.DATE:
            return (
              <div key={filter.label}>
                <DateFilter
                  updateFilterState={createFilterStateUpdater(filter)}
                  state={filterStates[filter.accessorKey] as DateFilterState}
                  label={filter.label}
                />
              </div>
            );
          case FilterType.ENUM:
            return (
              <div key={filter.label}>
                <EnumFilter
                  updateFilterState={createFilterStateUpdater(filter)}
                  options={filter.enumValues}
                  label={filter.label}
                  placeholder={filter.placeholder}
                  state={filterStates[filter.accessorKey] as EnumFilterState}
                  isMulti={filter.isMulti}
                />
              </div>
            );
          case FilterType.STRING:
            return (
              <div key={filter.label}>
                <StringFilter
                  updateFilterState={createFilterStateUpdater(filter)}
                  label={filter.label}
                  placeholder={filter.placeholder}
                  state={filterStates[filter.accessorKey] as StringFilterState}
                />
              </div>
            );
          case FilterType.ID:
            return (
              <div key={filter.label}>
                <IdFilter
                  updateFilterState={createFilterStateUpdater(filter)}
                  label={filter.label}
                  placeholder={filter.placeholder}
                  state={filterStates[filter.accessorKey] as IdFilterState}
                />
              </div>
            );
          case FilterType.BOOLEAN:
            return (
              <div key={filter.label}>
                <BooleanFilter
                  updateFilterState={createFilterStateUpdater(filter)}
                  label={filter.label}
                  state={filterStates[filter.accessorKey] as BooleanFilterState}
                />
              </div>
            );
          case FilterType.CURRENCY:
            return (
              <div key={filter.label}>
                <CurrencyFilter
                  updateFilterState={createFilterStateUpdater(filter)}
                  label={filter.label}
                  state={
                    filterStates[filter.accessorKey] as CurrencyFilterState
                  }
                />
              </div>
            );
          case FilterType.NUMBER:
            return (
              <div key={filter.label}>
                <NumberFilter
                  updateFilterState={createFilterStateUpdater(filter)}
                  label={filter.label}
                  state={filterStates[filter.accessorKey] as NumberFilterState}
                  allowDecimals={filter.valueType !== "integer"}
                />
              </div>
            );
          case FilterType.INPUT_OBJECT:
            return (
              <div key={filter.label}>
                <InputObjectFilter
                  updateFilterState={createFilterStateUpdater(filter)}
                  fields={filter.fields}
                  state={
                    filterStates[filter.accessorKey] as InputObjectFilterState
                  }
                />
              </div>
            );
          default:
            return null;
        }
      })
    : [];
  let filters: React.ReactNode;
  const isFilterButtonSmall = isSm && props.header;

  function onApply() {
    void handleApplyFilters(filterStates, props.filterOptions!, pageSize);
  }

  const filterContent = (
    <FilterContentInner
      onKeyDownCapture={(e) => {
        if (e.key === "Enter") {
          onApply();
        }
      }}
      isSm={isSm}
    >
      {filterSections}
      <FilterContentFooter>
        <Button text="Clear" onClick={handleClearFilters} />
        <FilterContentFooterRight>
          <Button text="Cancel" onClick={() => setShowFilterEditor(false)} />
          <Button text="Apply" kind="primary" onClick={onApply} />
        </FilterContentFooterRight>
      </FilterContentFooter>
    </FilterContentInner>
  );

  const commonButtonProps = {
    kind: isFilterButtonSmall ? "roundIcon" : "secondary",
    size: "ExtraSmall",
    typography: { color: "c6Neutral" },
    icon: {
      name: "Sort",
    },
    text: !isFilterButtonSmall
      ? `Filter${
          numFiltersApplied > 0 && props.filterEditorStyle !== "pills"
            ? ` | ${numFiltersApplied}`
            : ""
        }`
      : undefined,
  } as const;

  if (props.filterOptions && props.filterOptions.filters.length > 0) {
    const FilterControlsComponent =
      props.customComponents?.filterControlsComponent;
    if (FilterControlsComponent) {
      filters = (
        <FilterControlsComponent
          filters={props.filterOptions.filters}
          filterStates={filterStates}
          onBeginFilter={handleBeginPillFilter}
          onCommitFilter={handleCommitPillFilter}
          onRemoveFilter={handleRemovePillFilter}
          onClearFilters={handleClearFilters}
        />
      );
    } else {
      const FilterContainerComponent =
        props.customComponents?.filterContainerComponent ||
        DataManagerTableFilterContainer;

      const defaultFilterContent = (
        <>
          {isSm ? (
            <Fragment>
              <Button
                {...commonButtonProps}
                {...props.filterButtonProps}
                onClick={() => setShowFilterEditor(!showFilterEditor)}
              />
              <Modal
                visible={showFilterEditor}
                onClose={() => setShowFilterEditor(false)}
                smKind="fullscreen"
              >
                {filterContent}
              </Modal>
            </Fragment>
          ) : (
            <DropdownComponent
              borderRadius={12}
              maxDropdownItemsWidth={400}
              dropdownContent={
                <FilterDropdownContent visible={showFilterEditor}>
                  {filterContent}
                </FilterDropdownContent>
              }
              isOpen={showFilterEditor}
              onOpen={() => {
                setShowFilterEditor(true);
              }}
              onClose={() => {
                setShowFilterEditor(false);
              }}
              button={{
                ...commonButtonProps,
                ...props.filterButtonProps,
              }}
              align={props.filterDropdownAlign || "right"}
            />
          )}
        </>
      );

      const pillFilters = props.filterOptions
        ? props.filterOptions.filters
            .filter((filter: Filter<T>) => {
              // If the filter is not applied, don't show it in the pills.
              return filterStates[filter.accessorKey]?.isApplied;
            })
            .map((filter: Filter<T>) => {
              return (
                <PillFilter
                  key={filter.label}
                  filter={filter}
                  state={filterStates[filter.accessorKey] as EnumFilterState}
                  onDelete={() => {
                    const newStates = updateFilterStates((currentStates) => ({
                      ...currentStates,
                      [filter.accessorKey]: getDefaultFilterState<T>(filter),
                    }));
                    void handleApplyFilters(
                      newStates,
                      props.filterOptions!,
                      pageSize,
                    );
                  }}
                  customComponents={{
                    customDropdown: props.customComponents?.dropdownComponent,
                    customTextInput: props.customComponents?.textInputComponent,
                    customCalendarCss:
                      props.customComponents?.customCalendarCss,
                  }}
                  onUpdateFilter={(newFilterState) => {
                    const newStates = updateFilterStates((currentStates) => {
                      let nextStates = {
                        ...currentStates,
                        [filter.accessorKey]: newFilterState,
                      };
                      props.filterOptions?.onFilterStateChange?.(
                        filter.accessorKey,
                        newFilterState,
                        (updater) => {
                          nextStates =
                            typeof updater === "function"
                              ? updater(nextStates)
                              : updater;
                        },
                      );
                      return nextStates;
                    });
                    void handleApplyFilters(
                      newStates,
                      props.filterOptions!,
                      pageSize,
                    );
                    setShowFilterEditor(false);
                  }}
                />
              );
            })
        : [];

      const pillsFilterContent = (
        <PillFiltersContainer>
          <Flex gap={4} align="center" flexWrap="wrap">
            {pillFilters}
            <DropdownComponent
              borderRadius={12}
              maxDropdownItemsWidth={200}
              dropdownItems={getPillDropdownItems({
                filterOptions: props.filterOptions,
                getFilterStates: () => filterStatesRef.current,
                updateFilterStates,
                handleApplyFilters,
                pageSize,
                setShowFilterEditor,
                customDropdownComponent:
                  props.customComponents?.dropdownComponent,
                onFilterStateChange: props.filterOptions.onFilterStateChange,
              })}
              isOpen={showFilterEditor}
              onOpen={() => {
                setShowFilterEditor(true);
              }}
              onClose={() => {
                setShowFilterEditor(false);
              }}
              button={{
                ...commonButtonProps,
                ...props.filterButtonProps,
                iconSide: "left",
              }}
              align={props.filterDropdownAlign || "right"}
            />
          </Flex>
          <Flex>
            {numFiltersApplied > 0 && (
              <Button
                {...commonButtonProps}
                {...props.filterButtonProps}
                icon={{
                  name: "CentralCrossSmall",
                  width: 16,
                  color: "text",
                  iconProps: {
                    strokeWidth: 3,
                  },
                }}
                text="Clear"
                typography={{
                  color: "secondary",
                }}
                onClick={handleClearFilters}
                kind="transparent"
              />
            )}
          </Flex>
        </PillFiltersContainer>
      );

      filters = (
        <FilterContainerComponent>
          {(!props.filterEditorStyle ||
            props.filterEditorStyle === "default") &&
            defaultFilterContent}
          {props.filterEditorStyle === "pills" && pillsFilterContent}
        </FilterContainerComponent>
      );
    }
  }

  let showMoreDropdown: React.ReactNode;
  if (props.pageSizes?.length > 1) {
    showMoreDropdown = (
      <Dropdown
        align="right"
        verticalPlacement="top"
        getCSS={({ isOpen }) => ({
          height: "fit-content",
          alignSelf: "center",
        })}
        button={{
          getCSS: ({ isOpen }) => ({
            display: "flex",
            alignItems: "center",
            height: "100%",
            width: "100%",
          }),
          getContent: ({ isOpen }) => (
            <TextIconAligner
              content={pageSizeString.replace("{pageSize}", `${pageSize}`)}
              typography={{ size: "ExtraSmall" }}
              rightIcon={{
                name: "Chevron",
                ml: 4,
                width: 14,
                color: isOpen ? "onPrimaryText" : "mcNeutral",
              }}
            />
          ),
        }}
        dropdownItems={props.pageSizes.map((size) => ({
          label: `${size}`,
          onClick: () => {
            void handleChangePageSize(size);
          },
        }))}
      />
    );
  }

  let footer: React.ReactNode;

  if (showFooter) {
    if (props.showMoreOptions) {
      footer = (
        <DataManagerTableFooter>
          <Button
            text="Show more"
            paddingY="short"
            onClick={() =>
              void handleChangePageSize(pageSize + (props.pageSizes?.[0] || 20))
            }
          />
          {showMoreDropdown}
        </DataManagerTableFooter>
      );
    } else if (props.resultCount) {
      const startResult = pageCursorState.startResult || 1;
      const endResult = Math.min(props.resultCount, startResult + pageSize - 1);
      const isFullCount = props.isFullCount ?? true;

      const countString = isFullCount
        ? props.resultCount
        : props.resultCount + "+";

      const resultsString = props.paginationDisplayOptions
        ?.showPageNumberButtons ? (
        <div></div>
      ) : (
        <div>
          <Label>Viewing </Label>
          <LabelModerate>{`${startResult}-${endResult}`}</LabelModerate>
          <Label> of </Label>
          <LabelModerate>{`${countString}`}</LabelModerate>
          <Label> results</Label>
        </div>
      );

      const hasNext = props.resultCount
        ? startResult + pageSize - 1 < props.resultCount
        : false;
      const hasPrev = startResult > 1;

      const pageNumbers = Array.from(
        { length: Math.ceil(props.resultCount / pageSize) },
        (_, i) => i,
      );

      const pageNumberButtons = props.paginationDisplayOptions
        ?.showPageNumberButtons ? (
        <PageNumberPaginationButtonsContainer>
          <Button
            icon={{
              name: "CentralChevronLeftSmall",
              width: 24,
              color: "text",
            }}
            kind="ghost"
            paddingY="short"
            onClick={() => void handlePrev()}
            disabled={!hasPrev}
          />
          {/* Get first two page numbers based on page size and current page */}
          {pageNumbers.slice(0, 2).map((pageNumber) => (
            <PageNumberButton
              key={pageNumber}
              onClick={() => void handleChangePage(pageNumber + 1)}
              isCurrentPage={currentPage === pageNumber + 1}
            >
              <Body content={`${pageNumber + 1}`} />
            </PageNumberButton>
          ))}
          {/* Show ellipsis if more than 1 page between 2nd and current page */}
          {pageNumbers.length >= 4 && currentPage - 2 > 1 && (
            <Icon
              name="CentralDotGrid1x3Horizontal"
              width={18}
              ml={7}
              mr={7}
              color="text"
            />
          )}
          {/* Show current page number if not first two pages or last */}
          {currentPage - 1 > 1 && currentPage < pageNumbers.length && (
            <PageNumberButton
              key={currentPage}
              isCurrentPage
              onClick={() => void handleChangePage(currentPage)}
            >
              <Body content={`${currentPage}`} />
            </PageNumberButton>
          )}
          {/* Show ellipsis if more than 1 page between current or 2nd page and the last page */}
          {pageNumbers.length >= 4 && currentPage + 1 < pageNumbers.length && (
            <Icon
              name="CentralDotGrid1x3Horizontal"
              width={18}
              ml={7}
              mr={7}
              color="text"
            />
          )}
          {/* Show last page number */}
          {pageNumbers.length >= 3 && (
            <PageNumberButton
              key={pageNumbers.length}
              isCurrentPage={currentPage === pageNumbers.length}
              onClick={() => void handleChangePage(pageNumbers.length)}
            >
              <Body content={`${pageNumbers.length}`} />
            </PageNumberButton>
          )}
          <Button
            icon={{
              name: "CentralChevronRightSmall",
              width: 24,
              color: "text",
            }}
            kind="ghost"
            paddingY="short"
            onClick={() => void handleNext()}
            disabled={!hasNext}
          />
        </PageNumberPaginationButtonsContainer>
      ) : (
        <></>
      );

      footer = (
        <DataManagerTableFooter>
          {resultsString}
          {pageNumberButtons}
          <PaginationContainer>
            {showMoreDropdown}
            {showPaginationPreviousNext && (
              <PaginationButtonsContainer>
                <Button
                  text="Previous"
                  paddingY="short"
                  onClick={() => {
                    void handlePrev();
                  }}
                  disabled={!hasPrev}
                />
                <Button
                  text="Next"
                  paddingY="short"
                  onClick={() => {
                    void handleNext();
                  }}
                  disabled={!hasNext}
                />
              </PaginationButtonsContainer>
            )}
          </PaginationContainer>
        </DataManagerTableFooter>
      );
    }
  }

  const DataManagerTableHeaderComponent =
    props.customComponents?.dataManagerTableHeaderComponent ||
    DataManagerTableHeader;

  const content = (
    <>
      {props.showHeader && (
        <DataManagerTableHeaderComponent>
          {props.header}
          {filters}
        </DataManagerTableHeaderComponent>
      )}
      <Table {...props} loading={isLoading} />
      {footer}
    </>
  );

  return (
    <StyledDataManagerTable fullHeight={props.fullHeight}>
      {isCardPageFullWidth ? (
        <CardPageFullWidth css={{ marginTop: `${cardPageMt}px` }}>
          {content}
        </CardPageFullWidth>
      ) : (
        content
      )}
    </StyledDataManagerTable>
  );
}

function getPillDropdownItems<
  T extends Record<string, unknown>,
  QueryVariablesType,
  QueryResultType,
>({
  filterOptions,
  getFilterStates,
  updateFilterStates,
  handleApplyFilters,
  pageSize,
  setShowFilterEditor,
  customDropdownComponent,
  onFilterStateChange,
}: {
  filterOptions: FilterOptions<T, QueryVariablesType, QueryResultType>;
  getFilterStates: () => DataManagerTableState<T>;
  updateFilterStates: (
    updater: SetStateAction<DataManagerTableState<T>>,
  ) => DataManagerTableState<T>;
  handleApplyFilters: (
    filterStates: DataManagerTableState<T>,
    filterOptions: FilterOptions<T, QueryVariablesType, QueryResultType>,
    pageSize: number,
  ) => Promise<void>;
  pageSize: number;
  setShowFilterEditor: Dispatch<SetStateAction<boolean>>;
  customDropdownComponent?:
    | React.ComponentType<React.ComponentProps<typeof Dropdown>>
    | undefined;
  onFilterStateChange?: FilterOptions<
    T,
    QueryVariablesType,
    QueryResultType
  >["onFilterStateChange"];
}) {
  // Helper to apply a new filter state with mutual exclusivity support
  const applyFilterState = (filter: Filter<T>, newFilterState: FilterState) => {
    const newStates = updateFilterStates((currentStates) => {
      let nextStates = {
        ...currentStates,
        [filter.accessorKey]: newFilterState,
      };
      onFilterStateChange?.(filter.accessorKey, newFilterState, (updater) => {
        nextStates =
          typeof updater === "function" ? updater(nextStates) : updater;
      });
      return nextStates;
    });
    void handleApplyFilters(newStates, filterOptions, pageSize);
    setShowFilterEditor(false);
  };

  const beginFilterState = (filter: Filter<T>, newFilterState: FilterState) => {
    updateFilterStates((currentStates) => ({
      ...currentStates,
      [filter.accessorKey]: newFilterState,
    }));
    setShowFilterEditor(false);
  };

  const getDropdownItemForFilter = (filter: Filter<T>): DropdownItemType => {
    let filterSubDropdownOptions: DropdownItemType[] = [];
    if (filter.type === FilterType.ENUM) {
      filterSubDropdownOptions = filter.enumValues.map((option) => ({
        label: option.label,
        onClick: () => {
          const optionValues = ensureArray(option.value);
          const state = getFilterStates()[
            filter.accessorKey
          ] as EnumFilterState;
          let updatedAppliedValues: string[] = [];
          if (filter.isMulti) {
            updatedAppliedValues = state.appliedValues
              ? [
                  ...state.appliedValues.filter(
                    (appliedValue) => appliedValue !== option.value,
                  ),
                  ...optionValues,
                ]
              : [...optionValues];
          } else {
            updatedAppliedValues = [...optionValues];
          }

          applyFilterState(filter, {
            ...getDefaultFilterState<T>(filter),
            value: updatedAppliedValues.join(", "),
            isApplied: true,
            appliedValues: updatedAppliedValues,
          } as unknown as FilterState);
        },
      }));
    } else if (filter.type === FilterType.BOOLEAN) {
      filterSubDropdownOptions = [true, false].map((value) => ({
        label: value ? "True" : "False",
        onClick: () => {
          applyFilterState(filter, {
            ...getDefaultFilterState<T>(filter),
            value,
            isApplied: true,
          } as unknown as FilterState);
        },
      }));
    }

    return {
      label: filter.label,
      getIcon: ({ dropdownItem, theme }) => ({
        name: "CentralChevronRightSm",
        width: 18,
        color: theme.secondary,
      }),
      iconSide: "right",
      onClick: () => {
        if (filter.type === FilterType.STRING) {
          const state = getFilterStates()[
            filter.accessorKey
          ] as StringFilterState;
          let updatedAppliedValues: string[] = [];
          updatedAppliedValues =
            filter.isMulti && state.appliedValues
              ? [
                  ...state.appliedValues.filter(
                    (appliedValue) => appliedValue !== (filter.value as string),
                  ),
                ]
              : state.appliedValues
              ? [...state.appliedValues]
              : [];

          beginFilterState(filter, {
            ...getDefaultFilterState<T>(filter),
            value: updatedAppliedValues.join(", "),
            isApplied: true,
            appliedValues: updatedAppliedValues,
          } as unknown as FilterState);
        } else if (filter.type === FilterType.ID) {
          const state = getFilterStates()[filter.accessorKey] as IdFilterState;
          let updatedAppliedValues: string[] = [];
          updatedAppliedValues =
            filter.isMulti && state.appliedValues
              ? [
                  ...state.appliedValues.filter(
                    (appliedValue) => appliedValue !== (filter.value as string),
                  ),
                ]
              : state.appliedValues
              ? [...state.appliedValues]
              : [];

          beginFilterState(filter, {
            ...getDefaultFilterState<T>(filter),
            value: updatedAppliedValues.join(", "),
            isApplied: true,
            appliedValues: updatedAppliedValues,
          } as unknown as FilterState);
        } else if (filter.type === FilterType.NUMBER) {
          beginFilterState(filter, {
            ...getDefaultFilterState<T>(filter),
            isApplied: true,
          } as FilterState);
        } else if (filter.type === FilterType.CURRENCY) {
          beginFilterState(filter, {
            ...getDefaultFilterState<T>(filter),
            isApplied: true,
          } as FilterState);
        } else if (filter.type === FilterType.DATE) {
          beginFilterState(filter, {
            ...getDefaultFilterState<T>(filter),
            preset: DatePreset.Custom,
            start: null,
            end: null,
            isApplied: true,
          } as unknown as FilterState);
        } else if (filter.type === FilterType.INPUT_OBJECT) {
          beginFilterState(filter, {
            ...getDefaultFilterState<T>(filter),
            isApplied: true,
          } as FilterState);
        }
      },
      subDropdown:
        filterSubDropdownOptions.length > 0
          ? {
              subItems: filterSubDropdownOptions,
              customDropdown: customDropdownComponent,
            }
          : undefined,
    };
  };

  return filterOptions.filters
    .filter((filter) => !getFilterStates()[filter.accessorKey]?.isApplied)
    .map((filter) => getDropdownItemForFilter(filter));
}

const StyledDataManagerTable = styled.div<{ fullHeight: boolean | undefined }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  ${({ fullHeight }) =>
    fullHeight &&
    css`
      flex-grow: 1;
    `}
`;

const commonPadding = `
  ${bp.lg(`
  padding-left: ${standardContentInset.lgPx}px;
  padding-right: ${standardContentInset.lgPx}px;
  `)}
  ${bp.sm(`
  padding-left: ${standardContentInset.smPx}px;
  padding-right: ${standardContentInset.smPx}px;
  `)}
  ${bp.minSmMaxLg(`
  padding-left: ${standardContentInset.minSmMaxLgPx}px;
  padding-right: ${standardContentInset.minSmMaxLgPx}px;
  `)}
`;

const DataManagerTableHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: ${Spacing.px.xs} 0;
  position: relative;
`;

const DataManagerTableFooter = styled.div`
  border-top: 1px solid ${({ theme }) => theme.c1Neutral};
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  ${commonPadding}
  padding-top: ${Spacing.px.md};
  padding-bottom: ${Spacing.px.md};

  ${StyledButton} {
    align-self: end;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const PaginationButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: ${Spacing.px.md};
  gap: ${Spacing.px.xs};
`;

const PageNumberPaginationButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const PageNumberButton = styled.button<{ isCurrentPage: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  cursor: pointer;
  ${standardBorderRadius(8)}
  border: none;
  background-color: transparent;
  &:hover {
    background-color: ${colors["black-04"]};
  }
  &:active {
    background-color: ${colors["black-10"]};
  }
  ${({ isCurrentPage }) =>
    isCurrentPage
      ? `
      border: 0.5px solid ${colors["black-10"]};
    `
      : ""}
`;

const DataManagerTableFilterContainer = styled.div`
  position: absolute;
  z-index: 3;
  right: 0;
  ${StyledButtonRow} + & {
    background: linear-gradient(
      to right,
      ${({ theme }) =>
          themeOr("rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)")({ theme })}
        0%,
      ${({ theme }) => getColor(theme, "bg")} 15%
    );
  }
  ${commonPadding}
`;

const FilterDropdownContent = styled.div<{ visible: boolean }>`
  width: 400px;
  background: ${({ theme }) => theme.bg};
  border: 0.5px solid
    ${({ theme }) => themeOrWithKey("c1Neutral", "c4Neutral")({ theme })};
  ${standardBorderRadius(12)}
  box-shadow:
    0px 1px 4px 0px rgba(0, 0, 0, 0.1),
    0px 4px 8px 0px rgba(0, 0, 0, 0.08);
  ${({ visible }) => !visible && "display: none;"}
`;

const FilterContentInner = styled.div<{ isSm?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${Spacing.px.xl};
  padding: ${({ isSm }) => (isSm ? "0px" : Spacing.px.lg)};
  z-index: ${z.dropdown + 1};
  position: relative;
`;

const FilterContentFooter = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const FilterContentFooterRight = styled.div`
  display: flex;
  gap: ${Spacing.px.xs};
`;

const PillFiltersContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: ${Spacing.px["2xs"]};
`;
