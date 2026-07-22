"use client";

import * as React from "react";
import { FilterBar } from "./parts";
import { type FilterBarConfig } from "./parts";
import {
  loadFilterStatesFromUrl,
  getDefaultFilterStates,
  type FilterDescriptor,
  type FilterStates,
} from "./filter-model";
import { useFilters } from "./useFilters";

type TestFilterKey = "status" | "type" | "reason" | "code" | "createdAt";
type TestDescriptorList = readonly FilterDescriptor<TestFilterKey>[];

const DESCRIPTORS: TestDescriptorList = [
  {
    type: "enum",
    label: "Status",
    id: "status",
    isMulti: true,
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "Closed", value: "CLOSED" },
    ],
  },
  {
    type: "enum",
    label: "Type",
    id: "type",
    conflictsWith: ["reason"],
    options: [
      { label: "Outgoing", value: "OUTGOING" },
      { label: "Incoming", value: "INCOMING" },
    ],
  },
  {
    type: "string",
    label: "Reason",
    id: "reason",
    conflictsWith: ["type"],
    placeholder: "Enter a reason",
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
];

const NO_PLACEHOLDER_DESCRIPTORS: TestDescriptorList = [
  { type: "string", label: "Reference", id: "reason" },
  {
    type: "string",
    label: "Code",
    id: "code",
    normalizeValue: (value) => value.trim() || null,
    errorMessage: "Enter a code",
  },
];

const CONFIG: FilterBarConfig = {
  operator: "is",
  emptyValue: "Empty",
  apply: "Apply",
  addFilter: "Filter",
  clearFilters: "Clear",
};

function Bar({
  descriptors = DESCRIPTORS,
  states,
  onStatesChange,
}: {
  descriptors?: readonly FilterDescriptor<TestFilterKey>[];
  states?: FilterStates<TestDescriptorList>;
  onStatesChange?: (states: FilterStates<TestDescriptorList>) => void;
}) {
  const model = useFilters({
    descriptors,
    ...(states !== undefined ? { states } : {}),
    ...(onStatesChange !== undefined ? { onStatesChange } : {}),
  });

  return (
    <div>
      <FilterBar.Root model={model} config={CONFIG}>
        <FilterBar.Pills />
        <FilterBar.AddButton label="Filter" />
        <FilterBar.Clear label="Clear" />
      </FilterBar.Root>
      <span data-testid="signature">{model.signature}</span>
      <span data-testid="applied-count">{model.appliedCount}</span>
    </div>
  );
}

/** Filters hydrated through the URL codec, then controlled in state. */
function HydratedBar({
  descriptors = DESCRIPTORS,
  params,
}: {
  descriptors?: readonly FilterDescriptor<TestFilterKey>[];
  params: string;
}) {
  const [states, setStates] = React.useState(() =>
    loadFilterStatesFromUrl(
      descriptors,
      new URLSearchParams(params),
      getDefaultFilterStates(descriptors),
    ),
  );

  return (
    <Bar descriptors={descriptors} states={states} onStatesChange={setStates} />
  );
}

/** DESCRIPTORS with the date descriptor's optional fields overridden. */
function withDateDescriptor(
  overrides: Partial<
    Extract<FilterDescriptor<TestFilterKey>, { type: "date" }>
  >,
): readonly FilterDescriptor<TestFilterKey>[] {
  return DESCRIPTORS.map((descriptor) =>
    descriptor.type === "date" ? { ...descriptor, ...overrides } : descriptor,
  );
}

export function Default() {
  return <Bar />;
}

export function NoPlaceholderEditors() {
  return <Bar descriptors={NO_PLACEHOLDER_DESCRIPTORS} />;
}

/** Pre-applied filters hydrated through the URL codec. */
export function WithAppliedFilters() {
  return <HydratedBar params="status=ACTIVE&reason=timeout" />;
}

/** Applied string and date filters for add-menu reopen coverage. */
export function WithAppliedEditableFilters() {
  return (
    <HydratedBar params="reason=timeout&code=code-123&createdAt=2026-06-01T09:30:00.000Z,2026-06-10T17:00:00.000Z" />
  );
}

/** An exclusive (non-multi) enum applied, with a declared conflict. */
export function WithExclusiveEnum() {
  return <HydratedBar params="type=OUTGOING" />;
}

/** A closed date range hydrated from the URL codec. */
export function WithDateApplied() {
  return (
    <HydratedBar params="createdAt=2026-06-01T09:30:00.000Z,2026-06-10T17:00:00.000Z" />
  );
}

/** A same-day date range whose time bounds can cross while editing. */
export function WithSameDayDateApplied() {
  return (
    <HydratedBar params="createdAt=2026-06-10T09:00:00.000Z,2026-06-10T17:30:00.000Z" />
  );
}

/** UTC wall-clock range that crosses New York's spring-forward gap. */
export function WithDstGapDateApplied() {
  return (
    <HydratedBar params="createdAt=2026-03-08T02:30:00.000Z,2026-03-08T04:30:00.000Z" />
  );
}

/** A one-sided (start-only) date range hydrated from the URL codec. */
export function WithOneSidedDate() {
  return <HydratedBar params="createdAt=2026-06-01T09:30:00.000Z," />;
}

/** A one-sided (end-only) date range hydrated from the URL codec. */
export function WithEndOnlyDate() {
  return <HydratedBar params="createdAt=,2026-06-10T17:00:00.000Z" />;
}

export function WithPriorMonthDate() {
  return <HydratedBar params="createdAt=2026-03-05T09:30:00.000Z," />;
}

/** Date descriptor with a fixed defaultRange override for editor seeding. */
export function DateDefaultRangeOverride() {
  return (
    <HydratedBar
      descriptors={withDateDescriptor({
        defaultRange: () => ({
          start: new Date("2026-03-02T00:00:00.000Z"),
          end: new Date("2026-03-05T00:00:00.000Z"),
        }),
      })}
      params="createdAt=,"
    />
  );
}

export function ControlledDateFilter({
  start,
  end,
}: {
  start: string | null;
  end: string | null;
}) {
  const states = getDefaultFilterStates(DESCRIPTORS);
  states.createdAt = {
    type: "date",
    isApplied: true,
    start: start ? new Date(start) : null,
    end: end ? new Date(end) : null,
  };
  return <Bar states={states} onStatesChange={() => undefined} />;
}

/** Date descriptor explicitly constrained to today and earlier. */
export function DatePastOnly() {
  return <Bar descriptors={withDateDescriptor({ allowFuture: false })} />;
}

/** Date descriptor explicitly leaving future dates enabled. */
export function DateFutureEnabled() {
  return <Bar descriptors={withDateDescriptor({ allowFuture: true })} />;
}

/**
 * External surface opening a pill editor through the model
 * (`setEditorOpen`), the same seam a command surface would drive.
 */
export function ProgrammaticEditorOpen() {
  const [states, setStates] = React.useState(() =>
    loadFilterStatesFromUrl(
      DESCRIPTORS,
      new URLSearchParams("reason=TIMEOUT"),
      getDefaultFilterStates(DESCRIPTORS),
    ),
  );
  const model = useFilters({
    descriptors: DESCRIPTORS,
    states,
    onStatesChange: setStates,
  });

  return (
    <div>
      <button type="button" onClick={() => model.setEditorOpen("reason", true)}>
        Open reason editor
      </button>
      <FilterBar.Root model={model} config={CONFIG}>
        <FilterBar.Pills />
      </FilterBar.Root>
      <span data-testid="signature">{model.signature}</span>
    </div>
  );
}
