import {
  DataTable,
  FilterBar,
  createRegistrationChannel,
  createRowActivationHook,
  createUrlBackedFiltersHook,
  formatDateTime,
  humanizeIdentifier,
  useCursorTablePagination,
} from "../src";
import type {
  CreateRowActivationHookConfig,
  CreateUrlBackedFiltersHookConfig,
  DataTableColumn,
  CursorTableController,
  CursorTableCount,
  CursorTablePage,
  CursorTableRequest,
  FilterDescriptor,
  FilterActionRegistry,
  FilterBarConfig,
  FiltersModel,
  FilterStates,
  HumanizeIdentifierOptions,
  RegisteredFilterAction,
  RowActivation,
  RowActivationEvent,
  RowActivationHook,
  SearchParamHistoryMode,
  SearchParamsAdapter,
  UrlBackedFiltersHook,
  UseCursorTablePaginationOptions,
  UseSearchParamsAdapter,
  UseUrlBackedFiltersOptions,
} from "../src";

const humanizeOptions: HumanizeIdentifierOptions = {
  capitalization: "title",
};
humanizeIdentifier("PAYMENT_PENDING", humanizeOptions);
formatDateTime(new Date(), "en-US", { timeZone: "UTC" });

const descriptors = [
  {
    id: "status",
    type: "enum",
    label: "Status",
    options: [{ label: "Open", value: "OPEN" }],
  },
  {
    id: "reference",
    type: "string",
    label: "Reference",
    normalizeValue: (value) => value.trim() || null,
    errorMessage: "Enter a reference",
  },
  {
    id: "createdAt",
    type: "date",
    label: "Created",
    defaultRange: () => ({ start: new Date(0), end: new Date() }),
    allowFuture: false,
  },
] as const satisfies readonly FilterDescriptor<string>[];

const plainStringDescriptor = {
  id: "plain",
  type: "string",
  label: "Plain",
} as const satisfies FilterDescriptor<string>;

// @ts-expect-error validated string filters require actionable error copy
const missingValidationCopy: FilterDescriptor<string> = {
  id: "invalid",
  type: "string",
  label: "Invalid",
  normalizeValue: (value) => value.trim() || null,
};

void plainStringDescriptor;
void missingValidationCopy;

type Descriptors = typeof descriptors;

declare const useSearchParamsAdapter: UseSearchParamsAdapter;

const EMPTY_ACTIONS: readonly RegisteredFilterAction[] = [];
const actionChannel = createRegistrationChannel({
  getSnapshot: () => EMPTY_ACTIONS,
  getServerSnapshot: () => EMPTY_ACTIONS,
  subscribe: () => () => undefined,
  publish: () => undefined,
});
const useFilterActions = actionChannel.useRegistrations;
const useTypedFilters = createUrlBackedFiltersHook({
  useSearchParamsAdapter,
  filterActionRegistry: actionChannel.registry,
  history: "push",
});
const useRowActivation = createRowActivationHook<{ id: string }>({
  useNavigateTarget: () => () => undefined,
  toHref: ({ id }) => `/rows/${id}`,
});
const legacyRowActivationConfig = {
  useNavigateTarget: () => () => undefined,
  toHref: ({ id }: { id: string }) => `/rows/${id}`,
  // @ts-expect-error Origin owns secure new-tab opening
  openInNewTab: () => undefined,
} satisfies CreateRowActivationHookConfig<{ id: string }>;
void legacyRowActivationConfig;

const lease = actionChannel.registry.acquire(EMPTY_ACTIONS);
lease.update(EMPTY_ACTIONS);
lease.release();

const structuralFilterRegistry: FilterActionRegistry = {
  acquire: () => ({
    update: () => undefined,
    release: () => undefined,
  }),
};
void structuralFilterRegistry;

const incompatibleRegistry = {
  acquire: (_: readonly { value: number }[]) => ({
    update: (_next: readonly { value: number }[]) => undefined,
    release: () => undefined,
  }),
};
const invalidRegistryFilters = createUrlBackedFiltersHook({
  useSearchParamsAdapter,
  // @ts-expect-error URL filters require a compatible filter action registry
  filterActionRegistry: incompatibleRegistry,
  history: "push",
});
void invalidRegistryFilters;

function TypedConsumer() {
  const actions: readonly RegisteredFilterAction[] = useFilterActions();
  const model = useTypedFilters({ descriptors });
  const pagination = useCursorTablePagination({
    scopeKey: "type-proof",
    pageSizeOptions: [25, 50],
  });
  const hookController: CursorTableController = pagination;
  const spreadController: CursorTableController = { ...pagination };
  const { request, goNext } = spreadController;
  const activation = useRowActivation();

  void actions;
  void hookController;
  void request;
  void goNext;
  activation.activateRow({ metaKey: false, ctrlKey: false }, { id: "row-id" });
  model.updateFilter("status", {
    type: "enum",
    isApplied: true,
    appliedValues: ["OPEN"],
  });
  model.updateFilter("status", {
    // @ts-expect-error status remains correlated to enum state
    type: "date",
    isApplied: true,
    start: null,
    end: null,
  });
  return null;
}
void TypedConsumer;

// @ts-expect-error cursor controllers can only be created by Origin
const structuralCursorController: CursorTableController = {
  request: { pageSize: 25, cursor: null },
  currentPage: 1,
  pageSizeOptions: [25, 50],
  canGoPrevious: false,
  goPrevious: () => undefined,
  goNext: () => undefined,
  setPageSize: () => undefined,
  reset: () => undefined,
};
void structuralCursorController;

type PublicFactoryTypes = [
  CreateRowActivationHookConfig<string>,
  CreateUrlBackedFiltersHookConfig,
  CursorTableController,
  CursorTableCount,
  CursorTablePage,
  CursorTableRequest,
  FilterActionRegistry,
  FilterBarConfig,
  RegisteredFilterAction,
  RowActivation<string>,
  RowActivationEvent,
  RowActivationHook<string>,
  SearchParamHistoryMode,
  SearchParamsAdapter,
  UrlBackedFiltersHook,
  UseCursorTablePaginationOptions,
  UseSearchParamsAdapter,
  UseUrlBackedFiltersOptions<Descriptors>,
];
declare const publicFactoryTypes: PublicFactoryTypes;
void publicFactoryTypes;

const states: FilterStates<Descriptors> = {
  status: { type: "enum", isApplied: true, appliedValues: ["OPEN"] },
  reference: { type: "string", isApplied: false, value: null },
  createdAt: { type: "date", isApplied: false, start: null, end: null },
};
void states;

declare const model: FiltersModel<Descriptors>;

function FilterBarChromeConsumer() {
  return (
    <FilterBar.Root
      model={model}
      config={{ addFilter: "Add condition", clearFilters: "Reset" }}
    >
      <FilterBar.Pills />
      <FilterBar.AddButton />
      <FilterBar.Clear />
    </FilterBar.Root>
  );
}
void FilterBarChromeConsumer;

model.updateFilter("status", {
  type: "enum",
  isApplied: true,
  appliedValues: ["OPEN"],
});
model.updateFilter("createdAt", {
  type: "date",
  isApplied: true,
  start: new Date(),
  end: new Date(),
});

model.updateFilter("status", {
  // @ts-expect-error status descriptors only accept enum state
  type: "date",
  isApplied: true,
  start: null,
  end: null,
});

model.updateFilter("createdAt", {
  // @ts-expect-error createdAt descriptors only accept date state
  type: "string",
  isApplied: true,
  value: null,
});

interface Row {
  name: string;
  amount: number;
  metadata: { label: string };
}

const columns: readonly DataTableColumn<Row>[] = [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: (row) => row.amount.toFixed(2),
  },
  {
    accessorKey: "metadata",
    header: "Metadata",
    cell: (row) => row.metadata.label,
  },
  { id: "actions", header: "Actions", cell: (row) => `Edit ${row.name}` },
];
void columns;

declare const cursorController: CursorTableController;
const cursorPage: CursorTablePage = {
  endCursor: "cursor-1",
  hasNextPage: true,
  rowCount: 25,
  count: { value: 100, accuracy: "lower-bound" },
};

function CursorTable() {
  return (
    <DataTable.Root
      label="People"
      layout="inline"
      pagination={{
        controller: cursorController,
        page: cursorPage,
      }}
    >
      <DataTable.Content
        columns={columns}
        data={[]}
        empty={{}}
        error={undefined}
      />
    </DataTable.Root>
  );
}
void CursorTable;

function MissingTableLabel() {
  return (
    // @ts-expect-error data tables require one authoritative label
    <DataTable.Root
      layout="inline"
      pagination={{ controller: cursorController, page: undefined }}
    >
      <DataTable.Content
        columns={columns}
        data={[]}
        empty={{}}
        error={undefined}
      />
    </DataTable.Root>
  );
}
void MissingTableLabel;

function ActivatedRows() {
  return (
    <DataTable.Root label="People" layout="inline">
      <DataTable.Content
        columns={columns}
        data={[]}
        empty={{ title: "No people" }}
        error={undefined}
        getRowActivationLabel={(row) => `View ${row.name}`}
        onRowActivate={() => undefined}
      />
    </DataTable.Root>
  );
}
void ActivatedRows;

function MissingRowActivationLabels() {
  return (
    <DataTable.Root label="People" layout="inline">
      {/* @ts-expect-error activated rows require consumer-owned action labels */}
      <DataTable.Content
        columns={columns}
        data={[]}
        empty={{ title: "No people" }}
        error={undefined}
        onRowActivate={() => undefined}
      />
    </DataTable.Root>
  );
}
void MissingRowActivationLabels;

const typoedAccessor: DataTableColumn<Row> = {
  // @ts-expect-error accessorKey must be a string key of Row
  accessorKey: "naem",
  header: "Name",
};
void typoedAccessor;

// @ts-expect-error object-valued accessors require an explicit renderer
const rawObjectAccessor: DataTableColumn<Row> = {
  accessorKey: "metadata",
  header: "Metadata",
};
void rawObjectAccessor;

// @ts-expect-error display columns require a renderer
const missingDisplayRenderer: DataTableColumn<Row> = {
  id: "actions",
  header: "Actions",
};
void missingDisplayRenderer;
