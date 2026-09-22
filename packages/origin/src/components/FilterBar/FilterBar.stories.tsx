"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createUrlBackedFiltersHook, FilterBar, useFilters } from "./";
import type {
  FilterBarConfig,
  FilterDescriptor,
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

function StoryFilterBar({ config }: { config?: Partial<FilterBarConfig> }) {
  const model = useStoryFilters({
    descriptors: DESCRIPTORS,
    registerFilterActions: false,
  });

  return (
    <FilterBar.Root model={model} config={config}>
      <FilterBar.Pills />
      <FilterBar.AddButton />
      <FilterBar.Clear />
    </FilterBar.Root>
  );
}

function Bar({
  config,
  initialParams,
}: {
  config?: Partial<FilterBarConfig>;
  initialParams?: string;
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
      <StoryFilterBar config={config} />
    </StorySearchParamsContext.Provider>
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

export const CustomChrome: Story = {
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
