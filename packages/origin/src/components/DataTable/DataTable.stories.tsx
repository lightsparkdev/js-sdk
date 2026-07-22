"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DataTable } from "./";
import type { DataTableColumn } from "./";
import { useCursorTablePagination, type CursorTablePage } from "./";
import { Badge } from "@/components/Badge";

const meta: Meta = {
  title: "Components/DataTable",
  component: DataTable.Root,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

interface PaymentRow {
  id: string;
  reference: string;
  status: "Settled" | "Pending" | "Failed";
  createdAt: string;
  amount: number;
}

// Formatting lives with the consumer: Origin renders whatever the `cell`
// slot returns and ships no currency/date logic.
const amountFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const COLUMNS: readonly DataTableColumn<PaymentRow>[] = [
  { accessorKey: "reference", header: "Reference", size: 180 },
  {
    accessorKey: "status",
    header: "Status",
    size: 140,
    cell: (row) => (
      <Badge
        variant={
          row.status === "Settled"
            ? "green"
            : row.status === "Pending"
            ? "yellow"
            : "red"
        }
      >
        {row.status}
      </Badge>
    ),
  },
  { accessorKey: "createdAt", header: "Date created", size: 180 },
  {
    accessorKey: "amount",
    header: "Amount",
    size: 140,
    align: "right",
    cell: (row) => amountFormat.format(row.amount),
  },
];

const STATUSES = ["Settled", "Pending", "Failed"] as const;

const ROWS: readonly PaymentRow[] = Array.from({ length: 57 }, (_, index) => ({
  id: `pay-${index + 1}`,
  reference: `PAY-${String(index + 1).padStart(4, "0")}`,
  status: STATUSES[index % 3] as PaymentRow["status"],
  createdAt: `Jun ${(index % 28) + 1}, 2026`,
  amount: ((index * 37) % 900) + 25,
}));

const EMPTY = {
  title: "No payments found",
  description: "Adjust the filters to widen your search",
};

export const Default: Story = {
  render: () => (
    <DataTable.Root label="Payments" layout="inline">
      <DataTable.Content
        columns={COLUMNS}
        data={ROWS.slice(0, 5)}
        error={undefined}
        empty={EMPTY}
        getRowId={(row) => row.id}
      />
    </DataTable.Root>
  ),
};

export const Loading: Story = {
  render: () => (
    <DataTable.Root label="Payments" layout="inline">
      <DataTable.Content
        columns={COLUMNS}
        data={[]}
        loading
        skeletonRowCount={5}
        error={undefined}
        empty={EMPTY}
      />
    </DataTable.Root>
  ),
};

export const Empty: Story = {
  render: () => (
    <DataTable.Root label="Payments" layout="inline">
      <DataTable.Content
        columns={COLUMNS}
        data={[]}
        error={undefined}
        empty={EMPTY}
      />
    </DataTable.Root>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <DataTable.Root label="Payments" layout="inline">
      <DataTable.Content
        columns={COLUMNS}
        data={[]}
        error={{
          title: "Couldn't load payments",
          description: "Something went wrong on our end.",
          onRetry: () => {},
        }}
        empty={EMPTY}
      />
    </DataTable.Root>
  ),
};

export const ClickableRows: Story = {
  render: function ClickableRowsStory() {
    const [activated, setActivated] = React.useState("");
    return (
      <div>
        <DataTable.Root label="Payments" layout="inline">
          <DataTable.Content
            columns={COLUMNS}
            data={ROWS.slice(0, 5)}
            error={undefined}
            empty={EMPTY}
            getRowId={(row) => row.id}
            getRowActivationLabel={(row) => `View payment ${row.reference}`}
            onRowActivate={(row) => setActivated(row.reference)}
          />
        </DataTable.Root>
        <p>Activated: {activated || "none"}</p>
      </div>
    );
  },
};

export const Compact: Story = {
  render: () => (
    <DataTable.Root label="Payments" layout="inline" density="compact">
      <DataTable.Content
        columns={COLUMNS}
        data={ROWS.slice(0, 5)}
        error={undefined}
        empty={EMPTY}
        getRowId={(row) => row.id}
      />
    </DataTable.Root>
  ),
};

/**
 * Full composition over an in-memory cursor "API": cursors are row
 * offsets, responses settle synchronously. A real screen replaces the
 * slice with its paged query, keyed on `controller.request.pageSize` and
 * `controller.request.cursor`.
 */
export const WithPagination: Story = {
  render: function WithPaginationStory() {
    const controller = useCursorTablePagination({
      scopeKey: "storybook",
      pageSizeOptions: [10, 25, 50],
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
        label="Payments"
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
  },
};

/**
 * `layout="page"`: the region fills the available height, the viewport
 * owns scrolling (sticky header engages), and the toolbar/footer stay
 * pinned.
 */
export const PageLayout: Story = {
  parameters: { layout: "fullscreen" },
  render: function PageLayoutStory() {
    const controller = useCursorTablePagination({
      scopeKey: "storybook-page",
      pageSizeOptions: [25, 50],
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
      <div
        style={{ height: "100vh", display: "flex", flexDirection: "column" }}
      >
        <DataTable.Root
          label="Payments"
          layout="page"
          pagination={{ controller, page }}
        >
          <DataTable.Toolbar>
            <span>Payments</span>
          </DataTable.Toolbar>
          <DataTable.Content
            columns={COLUMNS}
            data={rows}
            error={undefined}
            empty={EMPTY}
            getRowId={(row) => row.id}
          />
        </DataTable.Root>
      </div>
    );
  },
};
