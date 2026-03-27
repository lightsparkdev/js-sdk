"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  RowSelectionState,
} from "@tanstack/react-table";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Table } from "./index";

// Sample data type
interface Person {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
}

// Sample data
const sampleData: Person[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Engineer",
    status: "active",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    role: "Designer",
    status: "active",
  },
  {
    id: "3",
    name: "Carol White",
    email: "carol@example.com",
    role: "Manager",
    status: "inactive",
  },
  {
    id: "4",
    name: "David Brown",
    email: "david@example.com",
    role: "Engineer",
    status: "active",
  },
  {
    id: "5",
    name: "Eve Davis",
    email: "eve@example.com",
    role: "Designer",
    status: "active",
  },
];

const columnHelper = createColumnHelper<Person>();

// Basic table - default columns
const basicColumns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("role", {
    header: "Role",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => info.getValue(),
  }),
];

// Sortable columns
const sortableColumns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor("role", {
    header: "Role",
    cell: (info) => info.getValue(),
    enableSorting: false,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
];

/**
 * Basic table with default styling
 */
export function BasicTable({ size }: { size?: "default" | "compact" } = {}) {
  const table = useReactTable({
    data: sampleData,
    columns: basicColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table.Root size={size}>
      <Table.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.HeaderRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Table.HeaderCell key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </Table.HeaderCell>
            ))}
          </Table.HeaderRow>
        ))}
      </Table.Header>
      <Table.Body>
        {table.getRowModel().rows.map((row) => (
          <Table.Row key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <Table.Cell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

/**
 * Table with sortable columns
 */
export function SortableTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data: sampleData,
    columns: sortableColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Table.Root>
      <Table.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.HeaderRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Table.HeaderCell
                key={header.id}
                sortable={header.column.getCanSort()}
                sortDirection={header.column.getIsSorted() || undefined}
                onSort={header.column.getToggleSortingHandler()}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </Table.HeaderCell>
            ))}
          </Table.HeaderRow>
        ))}
      </Table.Header>
      <Table.Body>
        {table.getRowModel().rows.map((row) => (
          <Table.Row key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <Table.Cell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

/**
 * Table with row selection (single)
 */
export function SelectableTable() {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const selectionColumn = columnHelper.display({
    id: "select",
    header: () => null,
    cell: ({ row }) => (
      <BaseCheckbox.Root
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(!!checked)}
        aria-label="Select row"
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          border: "1px solid var(--border-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          backgroundColor: row.getIsSelected()
            ? "var(--surface-inverse)"
            : "transparent",
        }}
      >
        <BaseCheckbox.Indicator
          style={{
            color: "var(--icon-on-color)",
            fontSize: 12,
          }}
        >
          ✓
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
    ),
  });

  const columns = [selectionColumn, ...basicColumns];

  const table = useReactTable({
    data: sampleData,
    columns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    enableMultiRowSelection: false, // Single select
  });

  return (
    <Table.Root>
      <Table.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.HeaderRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Table.HeaderCell
                key={header.id}
                variant={header.id === "select" ? "checkbox" : "default"}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </Table.HeaderCell>
            ))}
          </Table.HeaderRow>
        ))}
      </Table.Header>
      <Table.Body>
        {table.getRowModel().rows.map((row) => (
          <Table.Row key={row.id} selected={row.getIsSelected()}>
            {row.getVisibleCells().map((cell) => (
              <Table.Cell
                key={cell.id}
                variant={cell.column.id === "select" ? "checkbox" : "default"}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

/**
 * Table with right-aligned columns
 */
export function AlignedTable() {
  const alignedColumns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => info.getValue(),
      meta: { align: "right" as const },
    }),
  ];

  const table = useReactTable({
    data: sampleData,
    columns: alignedColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table.Root>
      <Table.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.HeaderRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Table.HeaderCell
                key={header.id}
                align={
                  (header.column.columnDef.meta as { align?: "left" | "right" })
                    ?.align
                }
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </Table.HeaderCell>
            ))}
          </Table.HeaderRow>
        ))}
      </Table.Header>
      <Table.Body>
        {table.getRowModel().rows.map((row) => (
          <Table.Row key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <Table.Cell
                key={cell.id}
                align={
                  (cell.column.columnDef.meta as { align?: "left" | "right" })
                    ?.align
                }
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

/**
 * Table with loading cells
 */
export function LoadingTable() {
  const table = useReactTable({
    data: sampleData.slice(0, 3),
    columns: basicColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table.Root>
      <Table.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.HeaderRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Table.HeaderCell key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </Table.HeaderCell>
            ))}
          </Table.HeaderRow>
        ))}
      </Table.Header>
      <Table.Body>
        {table.getRowModel().rows.map((row, rowIndex) => (
          <Table.Row key={row.id}>
            {row.getVisibleCells().map((cell, cellIndex) => (
              <Table.Cell
                key={cell.id}
                loading={rowIndex === 2 || (rowIndex === 1 && cellIndex === 1)}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

/**
 * Table with column resizing
 */
export function ResizableTable() {
  const table = useReactTable({
    data: sampleData,
    columns: basicColumns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: true,
    columnResizeMode: "onChange",
  });

  return (
    <Table.Root style={{ width: table.getCenterTotalSize() }}>
      <Table.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.HeaderRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Table.HeaderCell
                key={header.id}
                style={{ width: header.getSize() }}
                resizable
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                <Table.ResizeHandle
                  onMouseDown={header.getResizeHandler()}
                  onTouchStart={header.getResizeHandler()}
                  isResizing={header.column.getIsResizing()}
                />
              </Table.HeaderCell>
            ))}
          </Table.HeaderRow>
        ))}
      </Table.Header>
      <Table.Body>
        {table.getRowModel().rows.map((row) => (
          <Table.Row key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <Table.Cell
                key={cell.id}
                style={{ width: cell.column.getSize() }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

/**
 * Table with sortable right-aligned columns (tests icon position)
 */
export function SortableAlignedTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const alignedSortableColumns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => info.getValue(),
      enableSorting: true,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => info.getValue(),
      enableSorting: true,
      meta: { align: "right" as const },
    }),
  ];

  const table = useReactTable({
    data: sampleData,
    columns: alignedSortableColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Table.Root>
      <Table.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.HeaderRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Table.HeaderCell
                key={header.id}
                align={
                  (header.column.columnDef.meta as { align?: "left" | "right" })
                    ?.align
                }
                sortable={header.column.getCanSort()}
                sortDirection={header.column.getIsSorted() || undefined}
                onSort={header.column.getToggleSortingHandler()}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </Table.HeaderCell>
            ))}
          </Table.HeaderRow>
        ))}
      </Table.Header>
      <Table.Body>
        {table.getRowModel().rows.map((row) => (
          <Table.Row key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <Table.Cell
                key={cell.id}
                align={
                  (cell.column.columnDef.meta as { align?: "left" | "right" })
                    ?.align
                }
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

/**
 * Table with compact density
 */
export function CompactTable() {
  const table = useReactTable({
    data: sampleData,
    columns: basicColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table.Root size="compact">
      <Table.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.HeaderRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Table.HeaderCell key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </Table.HeaderCell>
            ))}
          </Table.HeaderRow>
        ))}
      </Table.Header>
      <Table.Body>
        {table.getRowModel().rows.map((row) => (
          <Table.Row key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <Table.Cell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

/**
 * Table with leading and trailing cell slots
 */
export function SlotsTable() {
  const StatusDot = ({ status }: { status: string }) => (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor:
          status === "active" ? "var(--icon-success)" : "var(--icon-tertiary)",
      }}
    />
  );

  const ActionButton = () => (
    <button
      style={{
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "none",
        border: "none",
        cursor: "pointer",
        borderRadius: "var(--corner-radius-sm)",
        color: "var(--icon-tertiary)",
      }}
      aria-label="More actions"
    >
      ···
    </button>
  );

  const slotColumns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => (
        <Table.CellContent
          label={info.getValue()}
          description={info.row.original.email}
        />
      ),
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => info.getValue(),
      meta: { hasStatusDot: true },
    }),
  ];

  const table = useReactTable({
    data: sampleData,
    columns: slotColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table.Root>
      <Table.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.HeaderRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Table.HeaderCell key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </Table.HeaderCell>
            ))}
          </Table.HeaderRow>
        ))}
      </Table.Header>
      <Table.Body>
        {table.getRowModel().rows.map((row, rowIndex) => (
          <Table.Row
            key={row.id}
            last={rowIndex === table.getRowModel().rows.length - 1}
          >
            {row.getVisibleCells().map((cell) => (
              <Table.Cell
                key={cell.id}
                leading={
                  cell.column.id === "status" ? (
                    <StatusDot status={cell.row.original.status} />
                  ) : undefined
                }
                trailing={
                  cell.column.id === "name" ? <ActionButton /> : undefined
                }
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

/**
 * Table with footer (e.g., pagination)
 */
export function FooterTable() {
  const table = useReactTable({
    data: sampleData,
    columns: basicColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <Table.Root>
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.HeaderRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.HeaderCell key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </Table.HeaderCell>
              ))}
            </Table.HeaderRow>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.map((row, rowIndex) => (
            <Table.Row
              key={row.id}
              last={rowIndex === table.getRowModel().rows.length - 1}
            >
              {row.getVisibleCells().map((cell) => (
                <Table.Cell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Table.Footer role="navigation" aria-label="Table pagination">
        <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>
          Showing 1–5 of 20
        </span>
      </Table.Footer>
    </div>
  );
}

/**
 * Compact table with footer
 */
export function CompactFooterTable() {
  const table = useReactTable({
    data: sampleData,
    columns: basicColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <Table.Root size="compact">
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.HeaderRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.HeaderCell key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </Table.HeaderCell>
              ))}
            </Table.HeaderRow>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.map((row, rowIndex) => (
            <Table.Row
              key={row.id}
              last={rowIndex === table.getRowModel().rows.length - 1}
            >
              {row.getVisibleCells().map((cell) => (
                <Table.Cell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Table.Footer
        size="compact"
        role="navigation"
        aria-label="Table pagination"
      >
        <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>
          Showing 1–5 of 20
        </span>
      </Table.Footer>
    </div>
  );
}

/**
 * Table with clickable rows (navigation pattern)
 */
export function ClickableRowTable() {
  const [clickedRow, setClickedRow] = React.useState<string | null>(null);

  const table = useReactTable({
    data: sampleData,
    columns: basicColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <Table.Root>
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.HeaderRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.HeaderCell key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </Table.HeaderCell>
              ))}
            </Table.HeaderRow>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.map((row) => (
            <Table.Row
              key={row.id}
              onClick={() => setClickedRow(row.original.name)}
            >
              {row.getVisibleCells().map((cell) => (
                <Table.Cell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <div data-testid="clicked-row">{clickedRow}</div>
    </div>
  );
}

/**
 * Table with hug/fill column sizing.
 * Hug columns get an explicit width; fill columns omit width
 * and split remaining space equally via table-layout: fixed.
 */
export function ColumnSizingTable() {
  interface Order {
    id: string;
    customer: string;
    product: string;
    note: string;
    amount: number;
    status: "completed" | "pending" | "failed";
  }

  const data: Order[] = [
    {
      id: "ORD-001",
      customer: "Alice Johnson",
      product: "Widget Pro",
      note: "Rush delivery requested",
      amount: 249.99,
      status: "completed",
    },
    {
      id: "ORD-002",
      customer: "Bob Smith",
      product: "Gadget Max",
      note: "Gift wrap",
      amount: 149.5,
      status: "pending",
    },
    {
      id: "ORD-003",
      customer: "Carol White",
      product: "Gizmo Ultra",
      note: "",
      amount: 89.0,
      status: "failed",
    },
    {
      id: "ORD-004",
      customer: "David Brown",
      product: "Widget Pro",
      note: "Include invoice",
      amount: 499.99,
      status: "completed",
    },
    {
      id: "ORD-005",
      customer: "Eve Davis",
      product: "Gadget Max",
      note: "Second order this month",
      amount: 149.5,
      status: "pending",
    },
  ];

  const orderColumnHelper = createColumnHelper<Order>();

  const columns = [
    orderColumnHelper.display({
      id: "select",
      meta: { sizing: "hug" },
      size: 40,
      header: () => null,
      cell: () => (
        <BaseCheckbox.Root
          aria-label="Select row"
          style={{
            width: 16,
            height: 16,
            borderRadius: 4,
            border: "1px solid var(--border-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <BaseCheckbox.Indicator
            style={{ color: "var(--icon-on-color)", fontSize: 12 }}
          >
            ✓
          </BaseCheckbox.Indicator>
        </BaseCheckbox.Root>
      ),
    }),
    orderColumnHelper.accessor("customer", {
      header: "Customer",
    }),
    orderColumnHelper.accessor("product", {
      header: "Product",
    }),
    orderColumnHelper.accessor("note", {
      header: "Note",
    }),
    orderColumnHelper.accessor("status", {
      header: "Status",
      meta: { sizing: "hug" },
      size: 100,
    }),
    orderColumnHelper.accessor("amount", {
      header: "Amount",
      meta: { sizing: "hug", align: "right" as const },
      size: 100,
      cell: (info) => `$${info.getValue().toFixed(2)}`,
    }),
    orderColumnHelper.display({
      id: "actions",
      meta: { sizing: "hug" },
      size: 64,
      header: () => null,
      cell: () => (
        <button
          style={{
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            borderRadius: "var(--corner-radius-sm)",
            color: "var(--icon-tertiary)",
          }}
          aria-label="More actions"
        >
          ···
        </button>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table.Root>
      <Table.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.HeaderRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const meta = header.column.columnDef.meta as
                | { sizing?: string; align?: "left" | "right" }
                | undefined;
              return (
                <Table.HeaderCell
                  key={header.id}
                  variant={header.id === "select" ? "checkbox" : "default"}
                  align={meta?.align}
                  style={{
                    width:
                      meta?.sizing === "hug" ? header.getSize() : undefined,
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </Table.HeaderCell>
              );
            })}
          </Table.HeaderRow>
        ))}
      </Table.Header>
      <Table.Body>
        {table.getRowModel().rows.map((row) => (
          <Table.Row key={row.id}>
            {row.getVisibleCells().map((cell) => {
              const meta = cell.column.columnDef.meta as
                | { sizing?: string; align?: "left" | "right" }
                | undefined;
              return (
                <Table.Cell
                  key={cell.id}
                  variant={cell.column.id === "select" ? "checkbox" : "default"}
                  align={meta?.align}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              );
            })}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

/**
 * Table with cell description (secondary text)
 */
export function DescriptionTable() {
  const descriptionColumns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => (
        <Table.CellContent
          label={info.getValue()}
          description={info.row.original.email}
        />
      ),
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => info.getValue(),
    }),
  ];

  const table = useReactTable({
    data: sampleData,
    columns: descriptionColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table.Root>
      <Table.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.HeaderRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Table.HeaderCell key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </Table.HeaderCell>
            ))}
          </Table.HeaderRow>
        ))}
      </Table.Header>
      <Table.Body>
        {table.getRowModel().rows.map((row) => (
          <Table.Row key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <Table.Cell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
