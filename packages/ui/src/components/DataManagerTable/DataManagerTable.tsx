import styled from "@emotion/styled";
import { Fragment, useEffect, useState, type ComponentProps } from "react";

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
import { Dropdown } from "../Dropdown.js";
import { Icon } from "../Icon/Icon.js";
import { Modal } from "../Modal.js";
import {
  Table,
  type CustomTableComponents,
  type TableProps,
} from "../Table/Table.js";
import { TextIconAligner } from "../TextIconAligner.js";
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
  type Filter,
  type StringFilter as StringFilterType,
} from "./filters.js";
import {
  IdFilter,
  getDefaultIdFilterState,
  isIdFilterState,
  type IdFilterState,
} from "./IdFilter.js";
import {
  StringFilter,
  getDefaultStringFilterState,
  isStringFilterState,
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
}

interface ShowMoreOptions<QueryVariablesType, QueryResultType> {
  refetch: (fetchVariables: QueryVariablesType) => Promise<QueryResultType>;
  initialQueryVariables: QueryVariablesType;
  // Determines which variables to update when the page size changes.
  pageSizeVariables?: string[] | undefined;
}

interface CustomDataManagerTableComponents extends CustomTableComponents {
  filterContainerComponent?: React.ComponentType<
    React.ComponentProps<typeof DataManagerTableFilterContainer>
  >;
  dataManagerTableHeaderComponent?: React.ComponentType<
    React.ComponentProps<typeof DataManagerTableHeader>
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
  header?: JSX.Element;
  cardPageFullWidth?: boolean | undefined;
  cardPageMt?: number;
  filterDropdownAlign?: "left" | "right" | "center";
  filterButtonProps?: ComponentProps<typeof Button>;
  customComponents?: CustomDataManagerTableComponents;
  paginationDisplayOptions?:
    | {
        showPaginationPreviousNext?: boolean | undefined;
        pageSizeStringTemplate?: string | undefined;
        showPageNumberButtons?: boolean | undefined;
      }
    | undefined;
  minHeight?: number | undefined;
};

export type DataManagerTableState<T extends Record<string, unknown>> = Record<
  keyof T,
  FilterState
>;

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
      return getDefaultIdFilterState(filter.allowedEntities);
    case FilterType.BOOLEAN:
      return getDefaultBooleanFilterState();
    case FilterType.CURRENCY:
      return getDefaultCurrencyFilterState();
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

export function DataManagerTable<
  T extends Record<string, unknown>,
  QueryVariablesType,
  QueryResultType,
>(props: DataManagerTableProps<T, QueryVariablesType, QueryResultType>) {
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
  const breakPoint = useBreakpoints();
  const [pageSize, setPageSize] = useState<number>(props.pageSizes?.[0] || 20);
  const [pageCursorState, setPageCursorState] = useState<PageCursorState>({
    startResult: undefined,
    nextPageCursor: props.nextPageCursor,
    cursorCache: {},
  });
  const [isLoading, setIsLoading] = useState<boolean>(props.loading || false);
  const [numFiltersApplied, setNumFiltersApplied] = useState<number>(0);
  const [showFilterEditor, setShowFilterEditor] = useState<boolean>(false);
  const [filterStates, setFilterStates] = useState<DataManagerTableState<T>>(
    props.filterOptions
      ? initialFilterState(props.filterOptions.filters)
      : ({} as DataManagerTableState<T>),
  );
  const [fetchVariables, setFetchVariables] = useState<QueryVariablesType>(
    props.filterOptions?.initialQueryVariables || ({} as QueryVariablesType),
  );

  const isSm = breakPoint.isSm();

  useEffect(() => {
    setIsLoading(Boolean(props.loading));
  }, [props.loading]);

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
        if (prevState.nextPageCursor === props.nextPageCursor) return prevState;

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
      setFilterStates((prevState) => ({
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
    const filterStatesArray = Object.values(appliedFilterStates);
    let isValid = true;
    for (let i = 0; i < filterStatesArray.length; i++) {
      const filterState = filterStatesArray[i];
      if (filterState.isApplied && filterState.onValidate) {
        const filter = filters[i];
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
            const isApplied = !!appliedValues?.length;
            updateFilterState(filter)({
              ...filterStates[filter.accessorKey],
              value: "",
              appliedValues: appliedValues ? [...appliedValues] : [],
              isApplied,
            });
            filterState.isApplied = isApplied;
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
      setFilterStates((prevState) => ({
        ...prevState,
      }));
      return;
    }

    // Handle filter types that can have multiple applied values.
    for (let i = 0; i < filterStatesArray.length; i++) {
      const filterState = filterStatesArray[i];
      if (!filterState.isApplied) continue;

      const filter = filters[i];
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
            isApplied: !!updatedAppliedValues.length,
          } as StringFilterState;

          // Apply the result of the validation for refetching data
          appliedFilterStates[filter.accessorKey] = newFilterState;
          // Update UI filter state as a result of applying if needed
          updateFilterState(filter)(newFilterState);
        } else if (filterState.appliedValues?.length === 0) {
          // If there are no more applied values, remove the filter
          updateFilterState(filter)(getDefaultStringFilterState());
          filterState.isApplied = false;
        }
      } else if (isEnumFilterState(filterState)) {
        if (filterState.value) {
          const newFilterState = {
            ...filterStates[filter.accessorKey],
            value: "",
            appliedValues: filterState.appliedValues,
            isApplied: !!filterState.appliedValues?.length,
          } as EnumFilterState;

          // Apply the result of the validation for refetching data
          appliedFilterStates[filter.accessorKey] = newFilterState;
          // Update UI filter state as a result of applying if needed
          updateFilterState(filter)(newFilterState);
        } else if (filterState.appliedValues?.length === 0) {
          // If there are no more applied values, remove the filter
          updateFilterState(filter)(getDefaultEnumFilterState());
          filterState.isApplied = false;
        }
      }
    }

    // Count the number of filters that are applied
    const numFiltersApplied = filterStatesArray.reduce((acc, state) => {
      return state.isApplied ? acc + 1 : acc;
    }, 0);
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
      setFilterStates(newFilterStates);
      void handleApplyFilters(newFilterStates, props.filterOptions, pageSize);
    }
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

  const filterSections = props.filterOptions
    ? props.filterOptions.filters.map((filter: Filter<T>) => {
        switch (filter.type) {
          case FilterType.DATE:
            return (
              <div key={filter.label}>
                <DateFilter
                  updateFilterState={(state) => {
                    setFilterStates((prevState) => ({
                      ...prevState,
                      [filter.accessorKey]: state,
                    }));
                  }}
                  state={filterStates[filter.accessorKey] as DateFilterState}
                />
              </div>
            );
          case FilterType.ENUM:
            return (
              <div key={filter.label}>
                <EnumFilter
                  updateFilterState={(state) => {
                    setFilterStates((prevState) => ({
                      ...prevState,
                      [filter.accessorKey]: state,
                    }));
                  }}
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
                  updateFilterState={(state) => {
                    setFilterStates((prevState) => ({
                      ...prevState,
                      [filter.accessorKey]: state,
                    }));
                  }}
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
                  updateFilterState={(state) => {
                    setFilterStates((prevState) => ({
                      ...prevState,
                      [filter.accessorKey]: state,
                    }));
                  }}
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
                  updateFilterState={(state) => {
                    setFilterStates((prevState) => ({
                      ...prevState,
                      [filter.accessorKey]: state,
                    }));
                  }}
                  label={filter.label}
                  state={filterStates[filter.accessorKey] as BooleanFilterState}
                />
              </div>
            );
          case FilterType.CURRENCY:
            return (
              <div key={filter.label}>
                <CurrencyFilter
                  updateFilterState={(state) => {
                    setFilterStates((prevState) => ({
                      ...prevState,
                      [filter.accessorKey]: state,
                    }));
                  }}
                  label={filter.label}
                  state={
                    filterStates[filter.accessorKey] as CurrencyFilterState
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
      ? `Filter${numFiltersApplied > 0 ? ` | ${numFiltersApplied}` : ""}`
      : undefined,
  } as const;

  if (props.filterOptions) {
    const FilterContainerComponent =
      props.customComponents?.filterContainerComponent ||
      DataManagerTableFilterContainer;
    filters = (
      <FilterContainerComponent>
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
          <Dropdown
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
      </FilterContainerComponent>
    );
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
        {pageNumbers.length > 4 && currentPage - 2 > 1 && (
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
        {pageNumbers.length > 4 && currentPage + 1 < pageNumbers.length && (
          <Icon
            name="CentralDotGrid1x3Horizontal"
            width={18}
            ml={7}
            mr={7}
            color="text"
          />
        )}
        {/* Show last page number */}
        {pageNumbers.length > 4 && (
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
    <StyledDataManagerTable>
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

const StyledDataManagerTable = styled.div`
  width: 100%;
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
