/**
 * DataTable jsdom unit tests: the Viewport's scroll-affordance state
 * machine (jsdom has no layout, so the scroller's geometry is stubbed
 * directly) and Content prop plumbing that needs no real browser.
 *
 * Rendered behavior that needs layout and real scrolling is covered in
 * the Playwright CT suite (`DataTable.test.tsx`).
 */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, expectTypeOf, it, vi } from "vitest";
import {
  DataTable,
  type DataTableColumn,
  type DataTableContentProps,
  type DataTableRootProps,
} from "./";
import { Table } from "../Table";

beforeAll(() => {
  // The shared setup's ResizeObserver mock is not constructible; the
  // Viewport calls `new ResizeObserver(...)`, so stub a class (same
  // pattern as the Chart unit tests).
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
  name: string;
}

const COLUMNS: readonly DataTableColumn<Row>[] = [
  { accessorKey: "name", header: "Name" },
];

const EMPTY = { title: "No rows" };

describe("Table.CellContent", () => {
  it.each(["", "   "])(
    "does not disclose bounded text without a name",
    (label) => {
      render(<Table.CellContent bounded label={label} />);

      expect(screen.queryByRole("button")).toBeNull();
    },
  );

  it("discloses the non-empty textual parts", () => {
    render(
      <Table.CellContent bounded label=" " description="Account description" />,
    );

    expect(
      screen.getByRole("button", { name: "Account description" }),
    ).toBeTruthy();
  });
});

function renderContent(props: { className?: string } = {}) {
  const { container } = render(
    <DataTable.Root label="Items" layout="inline">
      <DataTable.Content
        columns={COLUMNS}
        data={[{ name: "Row" }]}
        error={undefined}
        empty={EMPTY}
        {...(props.className !== undefined
          ? { className: props.className }
          : {})}
      />
    </DataTable.Root>,
  );
  const scroller = container.querySelector<HTMLElement>(
    '[data-scroll-x="true"]',
  );
  if (!scroller || !(scroller.parentElement instanceof HTMLElement)) {
    throw new Error("Expected DataTable viewport");
  }
  const shell = scroller.parentElement;
  return { container, scroller, shell };
}

interface ScrollGeometry {
  scrollHeight?: number;
  clientHeight?: number;
  scrollWidth?: number;
  clientWidth?: number;
  scrollTop?: number;
  scrollLeft?: number;
}

/** jsdom has no layout: stub the scroller's geometry directly. */
function mockGeometry(element: Element, geometry: ScrollGeometry) {
  for (const [key, value] of Object.entries(geometry)) {
    Object.defineProperty(element, key, {
      value,
      writable: true,
      configurable: true,
    });
  }
}

/** Flush the Viewport's rAF-throttled scroll measurement. */
async function flushScrollFrame() {
  await act(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      }),
  );
}

function scrollFlags(shell: Element | null) {
  return {
    overflowX: shell?.getAttribute("data-overflow-x"),
    overflowY: shell?.getAttribute("data-overflow-y"),
    atTop: shell?.getAttribute("data-at-top"),
    atBottom: shell?.getAttribute("data-at-bottom"),
    atLeft: shell?.getAttribute("data-at-left"),
    atRight: shell?.getAttribute("data-at-right"),
  };
}

describe("DataTable.Content", () => {
  it("renders a busy cold shell with accessible textual header names", () => {
    const { container } = render(
      <DataTable.Root label="Items" layout="inline">
        <DataTable.Content
          columns={[
            { accessorKey: "name", header: "Name" },
            {
              id: "actions",
              header: <span aria-hidden="true">•••</span>,
              headerAriaLabel: "Actions",
              cell: () => "Edit",
            },
          ]}
          data={[]}
          loading
          skeletonRowCount={3}
          error={undefined}
          empty={EMPTY}
        />
      </DataTable.Root>,
    );

    const table = screen.getByRole("table", { name: "Items" });
    expect(table).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeTruthy();
    expect(container.querySelectorAll("th[data-loading]")).toHaveLength(2);
    expect(container.querySelectorAll("tbody tr")).toHaveLength(3);
    expect(container.querySelectorAll("td[data-loading]")).toHaveLength(6);
    expect(screen.queryByText("No rows")).toBeNull();
  });

  it("uses one colgroup path for cold and settled column widths", () => {
    const columns: readonly DataTableColumn<Row>[] = [
      { accessorKey: "name", header: "Name" },
      { id: "actions", header: null, size: 64, cell: () => null },
    ];
    const renderContent = (loading: boolean, data: readonly Row[]) => (
      <DataTable.Root label="Items" layout="inline">
        <DataTable.Content
          columns={columns}
          data={data}
          loading={loading}
          error={undefined}
          empty={EMPTY}
        />
      </DataTable.Root>
    );
    const { container, rerender } = render(renderContent(true, []));
    const table = screen.getByRole("table", { name: "Items" });
    const loadingColumns = table.querySelectorAll("colgroup col");

    expect(loadingColumns).toHaveLength(2);
    expect(loadingColumns[0]).not.toHaveAttribute("style");
    expect(loadingColumns[1]).toHaveStyle({
      width: "1%",
      minWidth: "64px",
    });
    rerender(renderContent(false, [{ name: "Settled row" }]));
    const settledColumns = table.querySelectorAll("colgroup col");
    expect(settledColumns).toHaveLength(2);
    expect(settledColumns[0]).not.toHaveAttribute("style");
    expect(settledColumns[1]).toHaveStyle({
      width: "1%",
      minWidth: "64px",
    });
    expect(container.querySelector("th[style]")).toBeNull();
  });

  it("replaces populated rows with skeletons during loading by default", () => {
    const { container } = render(
      <DataTable.Root label="Items" layout="inline">
        <DataTable.Content
          columns={COLUMNS}
          data={[{ name: "Retained row" }]}
          loading
          skeletonRowCount={2}
          error={undefined}
          empty={EMPTY}
        />
      </DataTable.Root>,
    );

    expect(screen.getByRole("table", { name: "Items" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeTruthy();
    expect(screen.queryByRole("cell", { name: "Retained row" })).toBeNull();
    expect(container.querySelectorAll("th[data-loading]")).toHaveLength(1);
    expect(container.querySelectorAll("tbody tr")).toHaveLength(2);
    expect(container.querySelectorAll("td[data-loading]")).toHaveLength(2);
  });

  it("keeps provided rows mounted during loading when opted in", () => {
    const { container } = render(
      <DataTable.Root label="Items" layout="inline">
        <DataTable.Content
          columns={COLUMNS}
          data={[{ name: "Retained row" }]}
          loading
          showRowsWhileLoading
          error={undefined}
          empty={EMPTY}
        />
      </DataTable.Root>,
    );

    expect(screen.getByRole("table", { name: "Items" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeTruthy();
    expect(screen.getByRole("cell", { name: "Retained row" })).toBeTruthy();
    expect(container.querySelector("th[data-loading]")).toBeNull();
    expect(container.querySelector("td[data-loading]")).toBeNull();
  });

  it("keeps the full cold shell when opted in without rows", () => {
    const { container } = render(
      <DataTable.Root label="Items" layout="inline">
        <DataTable.Content
          columns={COLUMNS}
          data={[]}
          loading
          showRowsWhileLoading
          skeletonRowCount={0}
          error={undefined}
          empty={EMPTY}
        />
      </DataTable.Root>,
    );

    expect(screen.getByRole("table", { name: "Items" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeTruthy();
    expect(container.querySelectorAll("th[data-loading]")).toHaveLength(1);
    expect(container.querySelectorAll("tbody tr")).toHaveLength(0);
    expect(screen.queryByText("No rows")).toBeNull();
  });

  it.each(["animationend", "animationcancel"] as const)(
    "wires the cold reveal marker through its own %s",
    (animationEventName) => {
      const { rerender } = render(
        <DataTable.Root label="Items" layout="inline">
          <DataTable.Content
            columns={COLUMNS}
            data={[]}
            loading
            error={undefined}
            empty={EMPTY}
          />
        </DataTable.Root>,
      );
      const table = screen.getByRole("table", { name: "Items" });

      rerender(
        <DataTable.Root label="Items" layout="inline">
          <DataTable.Content
            columns={COLUMNS}
            data={[{ name: "Settled row" }]}
            error={undefined}
            empty={EMPTY}
          />
        </DataTable.Root>,
      );
      expect(table).toHaveAttribute("data-cold-reveal", "true");

      fireEvent.animationEnd(screen.getByRole("cell", { name: "Settled row" }));
      expect(table).toHaveAttribute("data-cold-reveal", "true");

      if (animationEventName === "animationend") {
        fireEvent.animationEnd(table);
      } else {
        fireEvent(table, new Event("animationcancel", { bubbles: true }));
      }
      expect(table).not.toHaveAttribute("data-cold-reveal");
    },
  );

  it("falls back only for nullish cell results", () => {
    interface ValueRow {
      nullValue: null;
      undefinedValue: undefined;
      emptyValue: string;
      zeroValue: number;
      falseValue: boolean;
      nodeValue: React.ReactNode;
      fragmentValue: React.ReactNode;
    }
    const columns: readonly DataTableColumn<ValueRow>[] = [
      { accessorKey: "nullValue", header: "Null" },
      { accessorKey: "undefinedValue", header: "Undefined" },
      {
        accessorKey: "emptyValue",
        header: "Accessor renderer",
        cell: () => null,
      },
      {
        id: "display-renderer",
        header: "Display renderer",
        cell: () => undefined,
      },
      { accessorKey: "emptyValue", header: "Empty" },
      { accessorKey: "zeroValue", header: "Zero" },
      { accessorKey: "falseValue", header: "False" },
      { accessorKey: "nodeValue", header: "Node" },
      { accessorKey: "fragmentValue", header: "Fragment" },
      {
        id: "custom-node",
        header: "Custom node",
        cell: () => <em>Custom node</em>,
      },
    ];

    render(
      <DataTable.Root label="Values" layout="inline">
        <DataTable.Content
          columns={columns}
          data={[
            {
              nullValue: null,
              undefinedValue: undefined,
              emptyValue: "",
              zeroValue: 0,
              falseValue: false,
              nodeValue: <strong>Node value</strong>,
              fragmentValue: <>Fragment value</>,
            },
          ]}
          error={undefined}
          empty={EMPTY}
        />
      </DataTable.Root>,
    );

    const cells = screen.getAllByRole("cell");
    expect(cells.map((cell) => cell.textContent)).toEqual([
      "-",
      "-",
      "-",
      "-",
      "",
      "0",
      "",
      "Node value",
      "Fragment value",
      "Custom node",
    ]);
  });

  it("derives the table caption from the required Root label", () => {
    render(
      <DataTable.Root label="Items" layout="inline">
        <DataTable.Content
          columns={COLUMNS}
          data={[{ name: "Row" }]}
          error={undefined}
          empty={EMPTY}
        />
      </DataTable.Root>,
    );

    expect(screen.getByText("Items").tagName).toBe("CAPTION");
  });

  it("keeps table and activated-row labels consumer-required", () => {
    type Props = DataTableContentProps<Row>;
    type Root = DataTableRootProps;
    type IsRequired<TKey extends keyof Props> = {} extends Pick<Props, TKey>
      ? false
      : true;
    type ActivatedProps = Extract<
      Props,
      { onRowActivate: NonNullable<Props["onRowActivate"]> }
    >;
    type IsActivatedRequired<TKey extends keyof ActivatedProps> =
      {} extends Pick<ActivatedProps, TKey> ? false : true;

    expectTypeOf<
      {} extends Pick<Root, "label"> ? false : true
    >().toEqualTypeOf<true>();
    expectTypeOf<IsRequired<"empty">>().toEqualTypeOf<true>();
    expectTypeOf<IsRequired<"error">>().toEqualTypeOf<true>();
    expectTypeOf<
      IsActivatedRequired<"getRowActivationLabel">
    >().toEqualTypeOf<true>();
    expectTypeOf<ActivatedProps["getRowActivationLabel"]>().toEqualTypeOf<
      (row: Row) => string
    >();
  });

  it("merges a consumer className into the viewport class instead of replacing it", () => {
    const { scroller } = renderContent({ className: "custom-viewport" });

    // The scroll owner keeps its own class (scroll/sticky-header/overlay
    // behavior) and gains the consumer's.
    expect(scroller.classList.contains("custom-viewport")).toBe(true);
    expect(scroller.classList.length).toBeGreaterThanOrEqual(2);
  });

  it("keeps populated rows instead of rendering the full error state", () => {
    render(
      <DataTable.Root label="Items" layout="inline">
        <DataTable.Content
          columns={COLUMNS}
          data={[{ name: "Stale row" }]}
          error={{
            title: "Couldn't load items",
            retryLabel: "Try again",
            onRetry: vi.fn(),
          }}
          empty={EMPTY}
        />
      </DataTable.Root>,
    );

    expect(screen.getByText("Stale row")).toBeTruthy();
    expect(screen.queryByText("Couldn't load items")).toBeNull();
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });

  it("uses the generic Retry label when error copy omits it", () => {
    render(
      <DataTable.Root label="Items" layout="inline">
        <DataTable.Content
          columns={COLUMNS}
          data={[]}
          error={{
            title: "Couldn't load items",
            onRetry: vi.fn(),
          }}
          empty={EMPTY}
        />
      </DataTable.Root>,
    );

    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });

  it("renders the internal neutral empty title", () => {
    render(
      <DataTable.Root label="Items" layout="inline">
        <DataTable.Content
          columns={COLUMNS}
          data={[]}
          error={undefined}
          empty={{}}
        />
      </DataTable.Root>,
    );

    expect(screen.getByText("No data available")).toBeTruthy();
  });

  it("renders every internal error fallback", () => {
    render(
      <DataTable.Root label="Items" layout="inline">
        <DataTable.Content
          columns={COLUMNS}
          data={[]}
          error={{ onRetry: vi.fn() }}
          empty={{}}
        />
      </DataTable.Root>,
    );

    expect(screen.getByText("Couldn't load data")).toBeTruthy();
    expect(
      screen.getByText(
        "Something went wrong while loading. Check your connection and try again.",
      ),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });

  it("renders every consumer state override", () => {
    render(
      <>
        <DataTable.Root label="Empty items" layout="inline">
          <DataTable.Content
            columns={COLUMNS}
            data={[]}
            error={undefined}
            empty={{ title: "No invoices", description: "Create an invoice" }}
          />
        </DataTable.Root>
        <DataTable.Root label="Failed items" layout="inline">
          <DataTable.Content
            columns={COLUMNS}
            data={[]}
            error={{
              title: "Couldn't load invoices",
              description: "Check the billing service",
              retryLabel: "Load again",
              onRetry: vi.fn(),
            }}
            empty={{}}
          />
        </DataTable.Root>
      </>,
    );

    expect(screen.getByText("No invoices")).toBeTruthy();
    expect(screen.getByText("Create an invoice")).toBeTruthy();
    expect(screen.getByText("Couldn't load invoices")).toBeTruthy();
    expect(screen.getByText("Check the billing service")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Load again" })).toBeTruthy();
  });

  it("emits widths only for explicitly sized accessor and display columns", () => {
    interface RichRow {
      name: string;
      metadata: { tier: string };
    }
    const columns: readonly DataTableColumn<RichRow>[] = [
      { accessorKey: "name", header: "Name" },
      {
        accessorKey: "metadata",
        header: "Tier",
        size: 200,
        cell: (row) => row.metadata.tier,
      },
      {
        id: "summary",
        header: "Summary",
        cell: (row) => `${row.name}: ${row.metadata.tier}`,
      },
      {
        id: "actions",
        header: "Actions",
        size: 64,
        cell: (row) => `Edit ${row.name}`,
      },
    ];

    render(
      <DataTable.Root label="People" layout="inline">
        <DataTable.Content
          columns={columns}
          data={[{ name: "Ada", metadata: { tier: "Gold" } }]}
          error={undefined}
          empty={EMPTY}
        />
      </DataTable.Root>,
    );

    expect(screen.getByText("Ada")).toBeTruthy();
    expect(screen.getByText("Gold")).toBeTruthy();
    expect(screen.getByText("Ada: Gold")).toBeTruthy();
    expect(screen.getByText("Edit Ada")).toBeTruthy();
    const tableColumns = screen
      .getByRole("table", { name: "People" })
      .querySelectorAll<HTMLTableColElement>("colgroup col");
    expect(Array.from(tableColumns, (column) => column.style.width)).toEqual([
      "",
      "1%",
      "",
      "1%",
    ]);
    expect(Array.from(tableColumns, (column) => column.style.minWidth)).toEqual(
      ["", "200px", "", "64px"],
    );
    expect(
      screen.getAllByRole("columnheader").map((header) => header.style.width),
    ).toEqual(["", "", "", ""]);
  });

  it.each([
    {
      label: "pointer activation",
      activate: (row: HTMLElement) =>
        fireEvent.click(row, { metaKey: false, ctrlKey: false }),
      expectedEvent: { metaKey: false, ctrlKey: false },
    },
    {
      label: "Ctrl+Enter activation",
      activate: (row: HTMLElement) =>
        fireEvent.keyDown(row, {
          key: "Enter",
          metaKey: false,
          ctrlKey: true,
        }),
      expectedEvent: { metaKey: false, ctrlKey: true },
    },
    {
      label: "Meta+Enter activation",
      activate: (row: HTMLElement) =>
        fireEvent.keyDown(row, {
          key: "Enter",
          metaKey: true,
          ctrlKey: false,
        }),
      expectedEvent: { metaKey: true, ctrlKey: false },
    },
  ])(
    "exposes a provider-free event for $label",
    ({ activate, expectedEvent }) => {
      const onRowActivate = vi.fn();
      render(
        <DataTable.Root label="Items" layout="inline">
          <DataTable.Content
            columns={COLUMNS}
            data={[{ name: "Row" }]}
            error={undefined}
            empty={EMPTY}
            getRowActivationLabel={(row) => `View ${row.name}`}
            onRowActivate={onRowActivate}
          />
        </DataTable.Root>,
      );

      const row = screen.getByRole("row", { name: "View Row" });
      expect(row.tagName).toBe("TR");
      expect(row).toHaveAttribute("aria-roledescription", "actionable row");
      expect(row).toHaveAttribute("aria-keyshortcuts", "Enter Space");

      activate(row);

      expect(onRowActivate).toHaveBeenCalledOnce();
      expect(onRowActivate).toHaveBeenCalledWith(
        { name: "Row" },
        expectedEvent,
      );
    },
  );

  it("does not add action semantics to noninteractive rows", () => {
    renderContent();

    const row = screen.getByText("Row").closest("tr")!;
    expect(row).not.toHaveAttribute("aria-label");
    expect(row).not.toHaveAttribute("aria-roledescription");
    expect(row).not.toHaveAttribute("aria-keyshortcuts");
    expect(row).not.toHaveAttribute("tabindex");
  });
});

describe("DataTable viewport scroll-affordance state machine", () => {
  it("rests with no overflow flags and every at-edge flag set", () => {
    const { shell } = renderContent();

    expect(scrollFlags(shell)).toEqual({
      overflowX: null,
      overflowY: null,
      atTop: "true",
      atBottom: "true",
      atLeft: "true",
      atRight: "true",
    });
  });

  it("tracks mid-scroll and at-edge states on both axes", async () => {
    const { scroller, shell } = renderContent();

    // Content overflows both axes, scrolled to the top-left rest state.
    mockGeometry(scroller, {
      scrollHeight: 1000,
      clientHeight: 400,
      scrollWidth: 1600,
      clientWidth: 800,
      scrollTop: 0,
      scrollLeft: 0,
    });
    fireEvent.scroll(scroller);
    await flushScrollFrame();

    expect(scrollFlags(shell)).toEqual({
      overflowX: "true",
      overflowY: "true",
      atTop: "true",
      atBottom: null,
      atLeft: "true",
      atRight: null,
    });

    // Mid-scroll on both axes: away from every edge.
    mockGeometry(scroller, { scrollTop: 300, scrollLeft: 400 });
    fireEvent.scroll(scroller);
    await flushScrollFrame();

    expect(scrollFlags(shell)).toEqual({
      overflowX: "true",
      overflowY: "true",
      atTop: null,
      atBottom: null,
      atLeft: null,
      atRight: null,
    });

    // At the far corner: bottom and right edges engage, top/left release.
    mockGeometry(scroller, { scrollTop: 600, scrollLeft: 800 });
    fireEvent.scroll(scroller);
    await flushScrollFrame();

    expect(scrollFlags(shell)).toEqual({
      overflowX: "true",
      overflowY: "true",
      atTop: null,
      atBottom: "true",
      atLeft: null,
      atRight: "true",
    });
  });

  it("clears overflow flags when content stops overflowing", async () => {
    const { scroller, shell } = renderContent();

    mockGeometry(scroller, {
      scrollHeight: 1000,
      clientHeight: 400,
      scrollWidth: 1600,
      clientWidth: 800,
      scrollTop: 300,
      scrollLeft: 400,
    });
    fireEvent.scroll(scroller);
    await flushScrollFrame();
    expect(scrollFlags(shell).overflowY).toBe("true");

    // Content shrinks back within the viewport (e.g. filter narrows rows).
    mockGeometry(scroller, {
      scrollHeight: 400,
      scrollWidth: 800,
      scrollTop: 0,
      scrollLeft: 0,
    });
    fireEvent.scroll(scroller);
    await flushScrollFrame();

    expect(scrollFlags(shell)).toEqual({
      overflowX: null,
      overflowY: null,
      atTop: "true",
      atBottom: "true",
      atLeft: "true",
      atRight: "true",
    });
  });

  it("coalesces a burst of scroll events into one measurement frame", async () => {
    const { scroller, shell } = renderContent();

    mockGeometry(scroller, {
      scrollHeight: 1000,
      clientHeight: 400,
      scrollWidth: 800,
      clientWidth: 800,
      scrollTop: 0,
      scrollLeft: 0,
    });
    // Many events before the frame flushes; only the final position lands.
    for (let i = 1; i <= 10; i += 1) {
      mockGeometry(scroller, { scrollTop: i * 60 });
      fireEvent.scroll(scroller);
    }
    await flushScrollFrame();

    expect(scrollFlags(shell)).toEqual({
      overflowX: null,
      overflowY: "true",
      atTop: null,
      atBottom: "true",
      atLeft: "true",
      atRight: "true",
    });
  });
});
