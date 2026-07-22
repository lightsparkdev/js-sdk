"use client";

import * as React from "react";
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
  { accessorKey: "name", header: "Name", size: 200 },
  {
    accessorKey: "amount",
    header: "Amount",
    size: 120,
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
