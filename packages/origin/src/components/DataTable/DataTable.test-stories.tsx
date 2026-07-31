"use client";

import * as React from "react";
import { Table } from "../Table";
import { DataTable } from "./parts";
import {
  useCursorTablePagination,
  type CursorTablePage,
} from "./useCursorTablePagination";
import { type DataTableColumn } from "./parts";

interface Row {
  id: string;
  name: string;
  amount: number;
}

const COLUMNS: readonly DataTableColumn<Row>[] = [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "amount",
    header: "Amount",
    align: "right",
    cell: (row) => `$${row.amount.toFixed(2)}`,
  },
];

const ROWS: readonly Row[] = Array.from({ length: 25 }, (_, index) => ({
  id: `row-${index + 1}`,
  name: `Item ${index + 1}`,
  amount: (index + 1) * 10,
}));

const EMPTY = {
  title: "No rows found",
  description: "Adjust the filters to widen the search",
};

interface AutoSizingRow {
  id: string;
  reference: string;
  amount: string;
}

export const LONG_AUTO_SIZE_REFERENCE = `PAY-${"A".repeat(160)}`;
export const LONG_BOUNDED_REFERENCE = `REF-${"B".repeat(160)}`;

const AUTO_SIZE_COLUMNS: readonly DataTableColumn<AutoSizingRow>[] = [
  { accessorKey: "reference", header: "Reference" },
  { accessorKey: "amount", header: "Amount", align: "right" },
  {
    id: "actions",
    header: null,
    size: 64,
    cell: (row) => (
      <button
        type="button"
        aria-label={`${row.reference} actions`}
        style={{ width: 32, height: 32 }}
      >
        <span aria-hidden="true">⋯</span>
      </button>
    ),
  },
];

const AUTO_SIZE_ROWS: readonly AutoSizingRow[] = Array.from(
  { length: 20 },
  (_, index) => ({
    id: `auto-${index + 1}`,
    reference: index === 0 ? LONG_AUTO_SIZE_REFERENCE : `PAY-${index + 1}`,
    amount: index === 0 ? "MX$2,300.00 MXN" : `$${index + 1}.00 USD`,
  }),
);

export function Default() {
  return (
    <DataTable.Root label="Items" layout="inline">
      <DataTable.Content
        columns={COLUMNS}
        data={ROWS.slice(0, 3)}
        error={undefined}
        empty={EMPTY}
        getRowId={(row) => row.id}
      />
    </DataTable.Root>
  );
}

export function AutoSizing({ scrollX = true }: { scrollX?: boolean } = {}) {
  return (
    <DataTable.Root
      label="Auto-sized payments"
      layout="page"
      style={{ width: 420, height: 220 }}
    >
      <DataTable.Content
        columns={AUTO_SIZE_COLUMNS}
        data={AUTO_SIZE_ROWS}
        error={undefined}
        empty={EMPTY}
        getRowId={(row) => row.id}
        scrollX={scrollX}
      />
    </DataTable.Root>
  );
}

export function BoundedContent({
  align = "left",
}: {
  align?: "left" | "right";
} = {}) {
  const [activated, setActivated] = React.useState("");
  const rows = [
    {
      id: "bounded-1",
      reference: LONG_BOUNDED_REFERENCE,
      amount: "MX$2,300.00 MXN",
    },
  ];
  const columns: readonly DataTableColumn<(typeof rows)[number]>[] = [
    {
      accessorKey: "reference",
      header: "Reference",
      align,
      size: align === "right" ? 320 : undefined,
      cell: (row) => <Table.CellContent bounded label={row.reference} />,
    },
    { accessorKey: "amount", header: "Amount", align: "right" },
  ];

  return (
    <div>
      <DataTable.Root
        label="Bounded payments"
        layout="inline"
        style={{ width: 420 }}
      >
        <DataTable.Content
          columns={columns}
          data={rows}
          error={undefined}
          empty={EMPTY}
          getRowId={(row) => row.id}
          getRowActivationLabel={(row) => `View ${row.reference}`}
          onRowActivate={(row) => setActivated(row.id)}
        />
      </DataTable.Root>
      <span data-testid="activated">{activated}</span>
    </div>
  );
}

export function TruncatedContent() {
  const [activated, setActivated] = React.useState("");
  const rows = [
    {
      id: "truncated-1",
      reference: LONG_BOUNDED_REFERENCE,
      amount: "MX$2,300.00 MXN",
    },
  ];
  const columns: readonly DataTableColumn<(typeof rows)[number]>[] = [
    {
      accessorKey: "reference",
      header: "Reference",
      cellOverflow: "truncate",
    },
    { accessorKey: "amount", header: "Amount", align: "right" },
  ];

  return (
    <div>
      <DataTable.Root
        label="Truncated payments"
        layout="inline"
        style={{ width: 420 }}
      >
        <DataTable.Content
          columns={columns}
          data={rows}
          error={undefined}
          empty={EMPTY}
          getRowId={(row) => row.id}
          getRowActivationLabel={(row) => `View ${row.reference}`}
          onRowActivate={(row) => setActivated(row.id)}
        />
      </DataTable.Root>
      <span data-testid="activated">{activated}</span>
    </div>
  );
}

export function EmptyBoundedContent() {
  return (
    <section aria-label="Bounded text accessibility cases">
      <Table.CellContent bounded label="" />
      <Table.CellContent bounded label="   " description=" " />
      <Table.CellContent bounded label="Account description" />
    </section>
  );
}

export function Loading() {
  return (
    <DataTable.Root label="Items" layout="inline">
      <DataTable.Content
        columns={COLUMNS}
        data={[]}
        loading
        skeletonRowCount={4}
        error={undefined}
        empty={EMPTY}
      />
    </DataTable.Root>
  );
}

export function LoadingWithRows() {
  return (
    <div>
      <DataTable.Root label="Default loading" layout="inline">
        <DataTable.Content
          columns={COLUMNS}
          data={ROWS.slice(0, 2)}
          loading
          skeletonRowCount={2}
          error={undefined}
          empty={EMPTY}
        />
      </DataTable.Root>
      <DataTable.Root label="Warm loading" layout="inline">
        <DataTable.Content
          columns={COLUMNS}
          data={ROWS.slice(0, 2)}
          loading
          showRowsWhileLoading
          error={undefined}
          empty={EMPTY}
        />
      </DataTable.Root>
    </div>
  );
}

export function LoadingSizing() {
  return (
    <DataTable.Root
      label="Loading sizing"
      layout="inline"
      style={{ width: 640 }}
    >
      <DataTable.Content
        columns={COLUMNS}
        data={[]}
        loading
        skeletonRowCount={1}
        error={undefined}
        empty={EMPTY}
      />
    </DataTable.Root>
  );
}

interface DenseLoadingRow {
  one: string;
  two: string;
  three: string;
  four: string;
  five: string;
  six: string;
}

const DENSE_LOADING_STRUCTURAL_WIDTH = 64;

const DENSE_LOADING_COLUMNS: readonly DataTableColumn<DenseLoadingRow>[] = [
  { accessorKey: "one", header: "One" },
  { accessorKey: "two", header: "Two" },
  { accessorKey: "three", header: "Three" },
  { accessorKey: "four", header: "Four" },
  { accessorKey: "five", header: "Five" },
  { accessorKey: "six", header: "Six" },
  {
    id: "actions",
    header: null,
    size: DENSE_LOADING_STRUCTURAL_WIDTH,
    cell: () => null,
  },
];

export function DenseLoading() {
  return (
    <DataTable.Root
      label="Dense loading"
      layout="inline"
      style={{ width: 480 }}
    >
      <DataTable.Content
        columns={DENSE_LOADING_COLUMNS}
        data={[]}
        loading
        skeletonRowCount={2}
        error={undefined}
        empty={EMPTY}
      />
    </DataTable.Root>
  );
}

export function LoadingTransition() {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <div>
      <button type="button" onClick={() => setLoaded(true)}>
        Resolve loading
      </button>
      <DataTable.Root label="Items" layout="inline">
        <DataTable.Content
          columns={COLUMNS}
          data={loaded ? ROWS.slice(0, 3) : []}
          loading={!loaded}
          skeletonRowCount={3}
          error={undefined}
          empty={EMPTY}
          getRowId={(row) => row.id}
        />
      </DataTable.Root>
    </div>
  );
}

export function Empty() {
  return (
    <DataTable.Root label="Items" layout="inline">
      <DataTable.Content
        columns={COLUMNS}
        data={[]}
        error={undefined}
        empty={EMPTY}
      />
    </DataTable.Root>
  );
}

export function ErrorState() {
  const [retries, setRetries] = React.useState(0);

  return (
    <div>
      <DataTable.Root label="Items" layout="inline">
        <DataTable.Content
          columns={COLUMNS}
          data={[]}
          error={{
            title: "Couldn't load items",
            retryLabel: "Try again",
            onRetry: () => setRetries((count) => count + 1),
          }}
          empty={EMPTY}
        />
      </DataTable.Root>
      <span data-testid="retries">{retries}</span>
    </div>
  );
}

export function ErrorWithRows() {
  return (
    <DataTable.Root label="Items" layout="inline">
      <DataTable.Content
        columns={COLUMNS}
        data={ROWS.slice(0, 3)}
        error={{
          title: "Couldn't load items",
          retryLabel: "Try again",
          onRetry: () => undefined,
        }}
        empty={EMPTY}
        getRowId={(row) => row.id}
      />
    </DataTable.Root>
  );
}

export function RowActivate() {
  const [activatedId, setActivatedId] = React.useState("");

  return (
    <div>
      <DataTable.Root label="Items" layout="inline">
        <DataTable.Content
          columns={COLUMNS}
          data={ROWS.slice(0, 3)}
          error={undefined}
          empty={EMPTY}
          getRowId={(row) => row.id}
          getRowActivationLabel={(row) => `View ${row.name}`}
          onRowActivate={(row) => setActivatedId(row.id)}
        />
      </DataTable.Root>
      <span data-testid="activated">{activatedId}</span>
    </div>
  );
}

export function RowActivateWithControls() {
  const [activatedId, setActivatedId] = React.useState("");
  const [controlActivated, setControlActivated] = React.useState("");
  const columns: readonly DataTableColumn<Row>[] = [
    ...COLUMNS,
    {
      id: "actions",
      header: "Actions",
      cell: (row) => (
        <>
          <button onClick={() => setControlActivated(`button-${row.id}`)}>
            Button {row.name}
          </button>
          <a
            href={`#${row.id}`}
            onClick={() => setControlActivated(`link-${row.id}`)}
          >
            Link {row.name}
          </a>
          <span
            onClick={(event) => {
              event.preventDefault();
              setControlActivated(`prevented-${row.id}`);
            }}
          >
            Prevented {row.name}
          </span>
        </>
      ),
    },
  ];

  return (
    <div>
      <DataTable.Root label="Items" layout="inline">
        <DataTable.Content
          columns={columns}
          data={ROWS.slice(0, 3)}
          error={undefined}
          empty={EMPTY}
          getRowId={(row) => row.id}
          getRowActivationLabel={(row) => `View ${row.name}`}
          onRowActivate={(row) => setActivatedId(row.id)}
        />
      </DataTable.Root>
      <span data-testid="activated">{activatedId}</span>
      <span data-testid="control-activated">{controlActivated}</span>
    </div>
  );
}

/**
 * Full composition over a synchronous in-memory "query": cursors are row
 * offsets, responses settle immediately. Exercises the settled-cursor
 * pagination end to end (range label, next/previous, page-size change).
 */
export function WithPagination() {
  const controller = useCursorTablePagination({
    scopeKey: "test",
    pageSizeOptions: [10, 25],
  });

  const start = controller.request.cursor
    ? Number(controller.request.cursor)
    : 0;
  const rows = ROWS.slice(start, start + controller.request.pageSize);
  const page: CursorTablePage = {
    endCursor: String(start + rows.length),
    hasNextPage: start + controller.request.pageSize < ROWS.length,
    count: { value: ROWS.length, accuracy: "exact" },
    rowCount: rows.length,
  };

  return (
    <DataTable.Root
      label="Items"
      layout="inline"
      pagination={{ controller, page }}
    >
      <DataTable.Toolbar>
        <span>Items</span>
      </DataTable.Toolbar>
      <DataTable.Content
        columns={COLUMNS}
        data={rows}
        error={undefined}
        empty={EMPTY}
        getRowId={(row) => row.id}
      />
    </DataTable.Root>
  );
}

/**
 * A lower-bound count stays provider-neutral and never clamps later pages.
 */
export function LowerBound() {
  const controller = useCursorTablePagination({
    scopeKey: "test-lower-bound",
    pageSizeOptions: [10],
  });

  const start = controller.request.cursor
    ? Number(controller.request.cursor)
    : 0;
  const rows = ROWS.slice(start, start + controller.request.pageSize);
  const page: CursorTablePage = {
    endCursor: String(start + rows.length),
    hasNextPage: start + controller.request.pageSize < ROWS.length,
    count: { value: 3, accuracy: "lower-bound" },
    rowCount: rows.length,
  };

  return (
    <DataTable.Root
      label="Items"
      layout="inline"
      pagination={{ controller, page }}
    >
      <DataTable.Content
        columns={COLUMNS}
        data={rows}
        error={undefined}
        empty={EMPTY}
        getRowId={(row) => row.id}
      />
    </DataTable.Root>
  );
}

/** Pagination hidden per model.showFooter: one first-option page of results. */
export function SinglePage() {
  const controller = useCursorTablePagination({
    scopeKey: "test",
    pageSizeOptions: [10, 25],
  });

  const rows = ROWS.slice(0, 3);
  const page: CursorTablePage = {
    endCursor: "3",
    hasNextPage: false,
    count: { value: 3, accuracy: "exact" },
    rowCount: rows.length,
  };

  return (
    <DataTable.Root
      label="Items"
      layout="inline"
      pagination={{ controller, page }}
    >
      <DataTable.Content
        columns={COLUMNS}
        data={rows}
        error={undefined}
        empty={EMPTY}
        getRowId={(row) => row.id}
      />
    </DataTable.Root>
  );
}
