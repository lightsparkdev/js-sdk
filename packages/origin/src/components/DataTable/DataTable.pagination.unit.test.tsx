import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { DataTable, type DataTableColumn } from "./";
import {
  type CursorTablePage,
  useCursorTablePagination,
} from "./useCursorTablePagination";

afterEach(cleanup);
beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

interface Row {
  id: string;
  name: string;
}

const COLUMNS: readonly DataTableColumn<Row>[] = [
  { accessorKey: "name", header: "Name" },
];
const ROWS: readonly Row[] = Array.from({ length: 30 }, (_, index) => ({
  id: `row-${index + 1}`,
  name: `Row ${index + 1}`,
}));

const EXACT_PAGE_1: CursorTablePage = {
  endCursor: "cursor-1",
  hasNextPage: true,
  rowCount: 10,
  count: { value: 25, accuracy: "exact" },
};
const EXACT_PAGE_2: CursorTablePage = {
  endCursor: "cursor-2",
  hasNextPage: true,
  rowCount: 10,
  count: { value: 25, accuracy: "exact" },
};

describe("DataTable.Root cursor pagination", () => {
  it("accepts a controller copied with object spread", () => {
    render(<SpreadControllerTable />);

    expect(
      screen.getByRole("navigation", { name: "Spread rows pagination" }),
    ).toBeTruthy();
    expect(screen.getByText("Viewing 1-10 of 25 results")).toBeTruthy();
  });

  it("appends the standard pagination footer with required accessible naming", () => {
    render(
      <TableHarness
        scopeKey="accounts"
        page={EXACT_PAGE_1}
        pageSizeOptions={[10, 25, 50]}
      />,
    );

    expect(
      screen.getByRole("navigation", { name: "Accounts pagination" }),
    ).toBeTruthy();
    expect(screen.getByText("Accounts").tagName).toBe("CAPTION");
    expect(screen.getByText("Viewing 1-10 of 25 results")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Previous page" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled();
  });

  it("retains settled footer metadata while the same cursor space loads", () => {
    const { rerender } = render(
      <TableHarness
        scopeKey="accounts"
        page={EXACT_PAGE_1}
        pageSizeOptions={[10, 25]}
      />,
    );

    rerender(
      <TableHarness
        scopeKey="accounts"
        page={undefined}
        pageSizeOptions={[10, 25]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(screen.getByText("Viewing 1-10 of 25 results")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();

    rerender(
      <TableHarness
        scopeKey="accounts"
        page={EXACT_PAGE_2}
        pageSizeOptions={[10, 25]}
      />,
    );
    expect(screen.getByText("Viewing 11-20 of 25 results")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled();
  });

  it("keeps previous navigation available when the current request errors", () => {
    const { rerender } = render(
      <TableHarness
        scopeKey="accounts"
        page={EXACT_PAGE_1}
        pageSizeOptions={[10]}
      />,
    );

    rerender(
      <TableHarness
        scopeKey="accounts"
        page={undefined}
        pageSizeOptions={[10]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(
      screen.getByRole("button", { name: "Previous page" }),
    ).toBeDisabled();
  });

  it("discards settled metadata when the scope changes", () => {
    const { rerender } = render(
      <TableHarness
        scopeKey="accounts"
        page={EXACT_PAGE_1}
        pageSizeOptions={[10, 25]}
      />,
    );
    expect(
      screen.getByRole("navigation", { name: "Accounts pagination" }),
    ).toBeTruthy();

    rerender(
      <TableHarness
        scopeKey="customers"
        page={undefined}
        pageSizeOptions={[10, 25]}
      />,
    );

    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.queryByText("Viewing 1-10 of 25 results")).toBeNull();
  });

  it("warns and refuses stale settled data attributed to a new page", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <TableHarness
        scopeKey="accounts"
        page={EXACT_PAGE_1}
        pageSizeOptions={[10]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain("[DataTable.Root]");
    expect(warn.mock.calls[0]?.[0]).toContain("stale");
    expect(screen.getByText("Viewing 1-10 of 25 results")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    warn.mockRestore();
  });

  it("settles a synchronous cache hit in the page-change render", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<SynchronousCacheTable />);

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(screen.getByText("Viewing 11-20 of 25 results")).toBeTruthy();
    expect(screen.getByText("Row 11")).toBeTruthy();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("guards next on final and invalid cursors", () => {
    const finalPage: CursorTablePage = {
      endCursor: "final-cursor",
      hasNextPage: false,
      rowCount: 10,
      count: { value: 10, accuracy: "exact" },
    };
    const { rerender } = render(
      <TableHarness
        scopeKey="accounts"
        page={finalPage}
        pageSizeOptions={[10]}
      />,
    );

    expect(screen.queryByRole("navigation")).toBeNull();

    rerender(
      <TableHarness
        scopeKey="accounts-with-invalid-cursor"
        page={{ ...EXACT_PAGE_1, endCursor: "" }}
        pageSizeOptions={[10]}
      />,
    );
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("clamps exact ranges and removes no-op page-size options", () => {
    render(
      <TableHarness
        scopeKey="accounts"
        page={{
          endCursor: null,
          hasNextPage: false,
          rowCount: 3,
          count: { value: 13, accuracy: "exact" },
        }}
        pageSizeOptions={[10, 25, 50]}
      />,
    );

    expect(screen.getByText("Viewing 1-3 of 13 results")).toBeTruthy();
    fireEvent.click(screen.getByRole("combobox", { name: "Rows per page" }));
    expect(screen.getByRole("option", { name: "10" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "25" })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "50" })).toBeNull();
  });

  it("does not clamp lower-bound ranges and retains every size option", () => {
    render(<LowerBoundTable />);

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText("Viewing 11-20 of 3+ results")).toBeTruthy();

    fireEvent.click(screen.getByRole("combobox", { name: "Rows per page" }));
    expect(screen.getByRole("option", { name: "10" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "25" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "50" })).toBeTruthy();
  });

  it("keeps pagination visible on a later page when an exact count shrinks", () => {
    render(<ShrinkingExactTable />);

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText("Viewing 0 of 3 results")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled();
  });

  it("uses the page size for skeleton rows with a ten-row cap", () => {
    const first = render(
      <TableHarness
        scopeKey="small"
        page={undefined}
        pageSizeOptions={[5]}
        loading
      />,
    );
    expect(document.querySelectorAll("td[data-loading]")).toHaveLength(5);
    first.unmount();

    render(
      <TableHarness
        scopeKey="large"
        page={undefined}
        pageSizeOptions={[25]}
        loading
      />,
    );
    expect(document.querySelectorAll("td[data-loading]")).toHaveLength(10);
  });

  it("lets Content override the pagination skeleton count", () => {
    render(
      <TableHarness
        scopeKey="accounts"
        page={undefined}
        pageSizeOptions={[25]}
        loading
        skeletonRowCount={3}
      />,
    );

    expect(document.querySelectorAll("td[data-loading]")).toHaveLength(3);
  });

  it("resets to page one when a page size is selected", () => {
    render(<SynchronousCacheTable />);
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText("Viewing 11-20 of 25 results")).toBeTruthy();

    fireEvent.click(screen.getByRole("combobox", { name: "Rows per page" }));
    fireEvent.keyDown(screen.getByRole("option", { name: "25" }), {
      key: "Enter",
    });

    expect(screen.getByText("Viewing 1-25 of 25 results")).toBeTruthy();
    expect(screen.getByText("Row 1")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Previous page" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("hides the footer for an exact single-page result", () => {
    render(
      <TableHarness
        scopeKey="accounts"
        page={{
          endCursor: null,
          hasNextPage: false,
          rowCount: 3,
          count: { value: 3, accuracy: "exact" },
        }}
        pageSizeOptions={[10, 25]}
      />,
    );

    expect(screen.queryByRole("navigation")).toBeNull();
  });
});

interface TableHarnessProps {
  scopeKey: string;
  page: CursorTablePage | undefined;
  pageSizeOptions: readonly number[];
  loading?: boolean;
  skeletonRowCount?: number;
}

function TableHarness({
  loading = false,
  page,
  pageSizeOptions,
  scopeKey,
  skeletonRowCount,
}: TableHarnessProps) {
  const controller = useCursorTablePagination({ scopeKey, pageSizeOptions });
  return (
    <DataTable.Root
      label={scopeKey === "customers" ? "Customers" : "Accounts"}
      layout="inline"
      pagination={{
        controller,
        page,
      }}
    >
      <DataTable.Content
        columns={COLUMNS}
        data={loading ? [] : ROWS.slice(0, page?.rowCount ?? 0)}
        loading={loading}
        {...(skeletonRowCount === undefined ? {} : { skeletonRowCount })}
        error={undefined}
        empty={{ title: "No accounts" }}
        getRowId={(row) => row.id}
      />
    </DataTable.Root>
  );
}

function SpreadControllerTable() {
  const controller = {
    ...useCursorTablePagination({
      scopeKey: "spread",
      pageSizeOptions: [10],
    }),
  };
  return (
    <DataTable.Root
      label="Spread rows"
      layout="inline"
      pagination={{
        controller,
        page: EXACT_PAGE_1,
      }}
    >
      <DataTable.Content
        columns={COLUMNS}
        data={ROWS.slice(0, 10)}
        error={undefined}
        empty={{}}
        getRowId={(row) => row.id}
      />
    </DataTable.Root>
  );
}

function SynchronousCacheTable() {
  const controller = useCursorTablePagination({
    scopeKey: "cached",
    pageSizeOptions: [10, 25],
  });
  const start = controller.request.cursor
    ? Number(controller.request.cursor.replace("cursor-", ""))
    : 0;
  const rows = ROWS.slice(start, start + controller.request.pageSize);
  const page: CursorTablePage = {
    endCursor:
      start + rows.length < 25 ? `cursor-${start + rows.length}` : null,
    hasNextPage: start + rows.length < 25,
    rowCount: rows.length,
    count: { value: 25, accuracy: "exact" },
  };

  return (
    <DataTable.Root
      label="Cached rows"
      layout="inline"
      pagination={{ controller, page }}
    >
      <DataTable.Content
        columns={COLUMNS}
        data={rows}
        error={undefined}
        empty={{}}
        getRowId={(row) => row.id}
      />
    </DataTable.Root>
  );
}

function LowerBoundTable() {
  const controller = useCursorTablePagination({
    scopeKey: "lower-bound",
    pageSizeOptions: [10, 25, 50],
  });
  const isSecondPage = controller.currentPage === 2;
  const page: CursorTablePage = {
    endCursor: isSecondPage ? null : "cursor-1",
    hasNextPage: !isSecondPage,
    rowCount: 10,
    count: { value: 3, accuracy: "lower-bound" },
  };
  return (
    <DataTable.Root
      label="Results"
      layout="inline"
      pagination={{ controller, page }}
    >
      <DataTable.Content
        columns={COLUMNS}
        data={ROWS.slice(isSecondPage ? 10 : 0, isSecondPage ? 20 : 10)}
        error={undefined}
        empty={{}}
      />
    </DataTable.Root>
  );
}

function ShrinkingExactTable() {
  const controller = useCursorTablePagination({
    scopeKey: "shrinking",
    pageSizeOptions: [10],
  });
  const isSecondPage = controller.currentPage === 2;
  const page: CursorTablePage = isSecondPage
    ? {
        endCursor: null,
        hasNextPage: false,
        rowCount: 0,
        count: { value: 3, accuracy: "exact" },
      }
    : EXACT_PAGE_1;
  return (
    <DataTable.Root
      label="Shrinking rows"
      layout="inline"
      pagination={{ controller, page }}
    >
      <DataTable.Content
        columns={COLUMNS}
        data={isSecondPage ? [] : ROWS.slice(0, 10)}
        error={undefined}
        empty={{}}
      />
    </DataTable.Root>
  );
}
