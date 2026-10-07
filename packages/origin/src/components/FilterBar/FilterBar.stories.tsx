"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  createUrlBackedFiltersHook,
  FILTER_OPERATORS,
  FilterBar,
  useFilters,
} from "./";
import type {
  FilterBarConfig,
  FilterDescriptor,
  FilterDescriptorTuple,
  SearchParamsAdapter,
} from "./";

const meta: Meta = {
  title: "Components/FilterBar",
  component: FilterBar.Root,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

type PaymentFilterKey = "status" | "type" | "reference" | "code" | "createdAt";

const DESCRIPTORS = [
  {
    type: "enum",
    label: "Status",
    id: "status",
    isMulti: true,
    options: [
      { label: "Settled", value: "SETTLED" },
      { label: "Pending", value: "PENDING" },
      { label: "Failed", value: "FAILED" },
    ],
  },
  {
    type: "enum",
    label: "Type",
    id: "type",
    options: [
      { label: "Incoming", value: "INCOMING" },
      { label: "Outgoing", value: "OUTGOING" },
    ],
  },
  {
    type: "string",
    label: "Reference",
    id: "reference",
    placeholder: "Enter a reference",
  },
  {
    type: "string",
    label: "Code",
    id: "code",
    placeholder: "Enter a code",
    normalizeValue: (value) => {
      const normalized = value.trim().toUpperCase();
      return normalized.startsWith("CODE-") ? normalized : null;
    },
    errorMessage: "Enter a valid code",
  },
  { type: "date", label: "Created", id: "createdAt" },
] as const satisfies readonly FilterDescriptor<PaymentFilterKey>[];

const StorySearchParamsContext =
  React.createContext<SearchParamsAdapter | null>(null);

function useStorySearchParamsAdapter(): SearchParamsAdapter {
  const adapter = React.useContext(StorySearchParamsContext);
  if (!adapter) {
    throw new Error("Story search params adapter is unavailable");
  }
  return adapter;
}

const useStoryFilters = createUrlBackedFiltersHook({
  useSearchParamsAdapter: useStorySearchParamsAdapter,
  history: "replace",
});

const useStoryFiltersRemovingEmpty = createUrlBackedFiltersHook({
  useSearchParamsAdapter: useStorySearchParamsAdapter,
  history: "replace",
  discardEmptyFilters: true,
});

interface StoryFilterBarProps<TDescriptors extends FilterDescriptorTuple> {
  descriptors: TDescriptors;
  config?: Partial<FilterBarConfig> | undefined;
}

function StoryFilterBar<const TDescriptors extends FilterDescriptorTuple>({
  descriptors,
  config,
}: StoryFilterBarProps<TDescriptors>) {
  const model = useStoryFilters({ descriptors, registerFilterActions: false });

  return (
    <FilterBar.Root model={model} {...(config ? { config } : {})}>
      <FilterBar.Pills />
      <FilterBar.AddButton />
      <FilterBar.Clear />
    </FilterBar.Root>
  );
}

function StoryFilterBarRemovingEmpty<
  const TDescriptors extends FilterDescriptorTuple,
>({ descriptors, config }: StoryFilterBarProps<TDescriptors>) {
  const model = useStoryFiltersRemovingEmpty({
    descriptors,
    registerFilterActions: false,
  });

  return (
    <FilterBar.Root model={model} {...(config ? { config } : {})}>
      <FilterBar.Pills />
      <FilterBar.AddButton />
      <FilterBar.Clear />
    </FilterBar.Root>
  );
}

function StorySearchParams({
  initialParams,
  children,
}: {
  initialParams?: string | undefined;
  children: React.ReactNode;
}) {
  const [search, setSearch] = React.useState(initialParams ?? "");
  const updateSearchParams = React.useCallback<
    SearchParamsAdapter["updateSearchParams"]
  >((update) => {
    setSearch((current) => update(new URLSearchParams(current)).toString());
  }, []);
  const adapter = React.useMemo(
    () => ({ search, updateSearchParams }),
    [search, updateSearchParams],
  );

  return (
    <StorySearchParamsContext.Provider value={adapter}>
      {children}
    </StorySearchParamsContext.Provider>
  );
}

function Bar({
  descriptors = DESCRIPTORS,
  config,
  initialParams,
  removeEmptyFilters = false,
}: {
  descriptors?: FilterDescriptorTuple;
  config?: Partial<FilterBarConfig>;
  initialParams?: string;
  removeEmptyFilters?: boolean;
}) {
  return (
    <StorySearchParams initialParams={initialParams}>
      {removeEmptyFilters ? (
        <StoryFilterBarRemovingEmpty
          descriptors={descriptors}
          config={config}
        />
      ) : (
        <StoryFilterBar descriptors={descriptors} config={config} />
      )}
    </StorySearchParams>
  );
}

export const Default: Story = {
  render: () => <Bar />,
};

export const WithAppliedFilters: Story = {
  render: () => (
    <Bar initialParams="status=SETTLED,PENDING&reference=invoice-42&createdAt=2026-06-01T00:00:00.000Z,2026-06-30T00:00:00.000Z" />
  ),
};

const SEARCH_DESCRIPTORS = [
  {
    type: "enum",
    label: "Currency",
    id: "currency",
    isMulti: true,
    searchable: true,
    options: [
      { label: "BRL", value: "BRL", keywords: ["Brazilian real"] },
      { label: "CAD", value: "CAD", keywords: ["Canadian dollar"] },
      { label: "COP", value: "COP", keywords: ["Colombian peso"] },
      { label: "EUR", value: "EUR", keywords: ["Euro"] },
      { label: "GBP", value: "GBP", keywords: ["British pound"] },
      { label: "INR", value: "INR", keywords: ["Indian rupee"] },
      { label: "MXN", value: "MXN", keywords: ["Mexican peso"] },
      { label: "PHP", value: "PHP", keywords: ["Philippine peso"] },
      { label: "USD", value: "USD", keywords: ["US dollar"] },
    ],
  },
] as const satisfies readonly FilterDescriptor<"currency">[];

/** A search box for long option lists. Keywords also match, so try "peso". */
export const WithSearch: Story = {
  render: () => <Bar descriptors={SEARCH_DESCRIPTORS} />,
};

const IS_NOT_DESCRIPTORS = [
  {
    type: "enum",
    label: "Status",
    id: "status",
    isMulti: true,
    operators: [FILTER_OPERATORS.is, FILTER_OPERATORS.isNot],
    options: [
      { label: "Settled", value: "SETTLED" },
      { label: "Pending", value: "PENDING" },
      { label: "Failed", value: "FAILED" },
    ],
  },
] as const satisfies readonly FilterDescriptor<"status">[];

/** "Is" and "is not" choices, opened from the pill's operator. */
export const WithIsNot: Story = {
  render: () => (
    <Bar
      descriptors={IS_NOT_DESCRIPTORS}
      initialParams="status=FAILED&status.__operator=isNot"
    />
  ),
};

const DIVIDER_DESCRIPTORS = [
  { type: "date", label: "Created", id: "createdAt" },
  {
    type: "enum",
    label: "Status",
    id: "status",
    addMenuSeparatorBefore: true,
    options: [
      { label: "Settled", value: "SETTLED" },
      { label: "Failed", value: "FAILED" },
    ],
  },
  {
    type: "enum",
    label: "Type",
    id: "type",
    options: [
      { label: "Incoming", value: "INCOMING" },
      { label: "Outgoing", value: "OUTGOING" },
    ],
  },
  {
    type: "string",
    label: "Reference",
    id: "reference",
    placeholder: "Enter a reference",
    addMenuSeparatorBefore: true,
  },
] as const satisfies readonly FilterDescriptor<
  "createdAt" | "status" | "type" | "reference"
>[];

/** Divider lines group related filters in the Filter menu. */
export const WithMenuDividers: Story = {
  render: () => <Bar descriptors={DIVIDER_DESCRIPTORS} />,
};

const EMPTY_FILTER_DESCRIPTORS = [
  {
    type: "string",
    label: "Reference",
    id: "reference",
    placeholder: "Enter a reference",
  },
  {
    type: "enum",
    label: "Status",
    id: "status",
    isMulti: true,
    options: [
      { label: "Settled", value: "SETTLED" },
      { label: "Failed", value: "FAILED" },
    ],
  },
] as const satisfies readonly FilterDescriptor<"reference" | "status">[];

/**
 * A filter closed without a value is removed. Add Reference, then close it
 * without typing.
 */
export const RemovesEmptyFilters: Story = {
  render: () => (
    <Bar descriptors={EMPTY_FILTER_DESCRIPTORS} removeEmptyFilters />
  ),
};

export const CustomLabels: Story = {
  render: () => (
    <Bar
      config={{
        operator: "equals",
        addFilter: "Add condition",
        clearFilters: "Reset",
      }}
      initialParams="status=SETTLED"
    />
  ),
};

// Descriptors must be referentially stable (a module constant).
const CONFLICTING_DESCRIPTORS = [
  {
    type: "enum",
    label: "Type",
    id: "type",
    conflictsWith: ["status"],
    options: [
      { label: "Incoming", value: "INCOMING" },
      { label: "Outgoing", value: "OUTGOING" },
    ],
  },
  {
    type: "enum",
    label: "Status",
    id: "status",
    conflictsWith: ["type"],
    isMulti: true,
    options: [
      { label: "Settled", value: "SETTLED" },
      { label: "Failed", value: "FAILED" },
    ],
  },
] as const satisfies readonly FilterDescriptor<"type" | "status">[];

/** Descriptor-declared exclusivity: applying one resets its conflicts. */
export const ConflictingFilters: Story = {
  render: function ConflictingFiltersStory() {
    const model = useFilters({
      descriptors: CONFLICTING_DESCRIPTORS,
    });

    return (
      <FilterBar.Root model={model}>
        <FilterBar.Pills />
        <FilterBar.AddButton />
        <FilterBar.Clear />
      </FilterBar.Root>
    );
  },
};

/**
 * Uncontrolled mode: the hook owns the states internally. Products that
 * persist filters in the URL should create an integration hook with
 * `createUrlBackedFiltersHook`.
 */
export const Uncontrolled: Story = {
  render: function UncontrolledStory() {
    const model = useFilters({ descriptors: DESCRIPTORS });

    return (
      <FilterBar.Root model={model}>
        <FilterBar.Pills />
        <FilterBar.AddButton />
        <FilterBar.Clear />
      </FilterBar.Root>
    );
  },
};
