"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import clsx from "clsx";
import { devWarn } from "../../lib/dev-warn";
import { Button } from "../Button";
import { Pager as OriginPager } from "../Pager";
import { Select } from "../Select";
import { Table, type RowActivationEvent, type RowProps } from "../Table";
import styles from "./DataTable.module.scss";
import { useColdReveal } from "./useColdReveal";
import {
  getCursorTableControllerSnapshot,
  type CursorTableController,
  type CursorTablePage,
} from "./useCursorTablePagination";

export type DataTableLayout = "page" | "inline";
export type DataTableDensity = "default" | "compact";

interface DataTableContextValue {
  density: DataTableDensity;
  label: string;
  paginationSkeletonRowCount: number | undefined;
}

const DataTableContext = React.createContext<DataTableContextValue>({
  density: "default",
  label: "",
  paginationSkeletonRowCount: undefined,
});

export interface RootProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Accessible name shared by the table caption and pagination landmark. */
  label: string;
  /**
   * `page` tables fill the available content area of a page shell: the
   * region takes `flex: 1; min-height: 0`, paints `--surface-primary`, and
   * the content viewport becomes the page's single scroll owner while
   * `Toolbar`/`Footer` stay pinned by the flex column (no sticky hacks).
   *
   * `inline` tables size to their content inside settings sections or
   * cards; the surrounding card owns background, border, and radius.
   */
  layout?: DataTableLayout;
  density?: DataTableDensity;
  /** Optional composed cursor pagination for this table. */
  pagination?: DataTableCursorPagination;
}

export interface DataTableCursorPagination {
  controller: CursorTableController;
  /** Undefined until the current request settles. */
  page: CursorTablePage | undefined;
}

export const Root = React.forwardRef<HTMLDivElement, RootProps>(function Root(
  {
    children,
    className,
    density = "default",
    label,
    layout = "page",
    pagination,
    ...props
  },
  ref,
) {
  const paginationModel = useCursorTableRootPagination(pagination, label);
  const contextValue = React.useMemo<DataTableContextValue>(
    () => ({
      density,
      label,
      paginationSkeletonRowCount: pagination
        ? Math.min(pagination.controller.request.pageSize, 10)
        : undefined,
    }),
    [density, label, pagination],
  );

  return (
    <DataTableContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={clsx(styles.root, className)}
        data-density={density}
        data-layout={layout}
        {...props}
      >
        {children}
        {paginationModel?.showFooter && (
          <Footer>
            <CursorTablePaginationView model={paginationModel} />
          </Footer>
        )}
      </div>
    </DataTableContext.Provider>
  );
});

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  function Toolbar({ children, className, ...props }, ref) {
    if (!children) {
      return null;
    }

    return (
      <div ref={ref} className={clsx(styles.toolbar, className)} {...props}>
        {children}
      </div>
    );
  },
);

/**
 * Scrollable-overflow detection: the smallest scroll distance treated as
 * real overflow, absorbing sub-pixel layout rounding at zoom levels.
 */
const SCROLL_EDGE_EPSILON = 1;

function setScrollFlag(
  element: HTMLElement,
  attribute: string,
  on: boolean,
): void {
  if (on) {
    element.setAttribute(attribute, "true");
  } else {
    element.removeAttribute(attribute);
  }
}

/**
 * Derive the shell's scroll-affordance state machine from the scroller's
 * geometry. Attributes (absent = false):
 *
 * - `data-overflow-y` / `data-overflow-x` — the axis has scrollable range.
 * - `data-at-top` / `data-at-bottom` / `data-at-left` / `data-at-right` —
 *   the scroll position sits at that edge (all four hold when an axis has
 *   no overflow).
 *
 * CSS does every presentation off these; no React state is involved, so
 * scrolling never re-renders rows.
 */
function measureScrollState(shell: HTMLElement, scroller: HTMLElement): void {
  const maxScrollY = scroller.scrollHeight - scroller.clientHeight;
  const maxScrollX = scroller.scrollWidth - scroller.clientWidth;
  setScrollFlag(shell, "data-overflow-y", maxScrollY > SCROLL_EDGE_EPSILON);
  setScrollFlag(shell, "data-overflow-x", maxScrollX > SCROLL_EDGE_EPSILON);
  setScrollFlag(
    shell,
    "data-at-top",
    scroller.scrollTop <= SCROLL_EDGE_EPSILON,
  );
  setScrollFlag(
    shell,
    "data-at-bottom",
    maxScrollY - scroller.scrollTop <= SCROLL_EDGE_EPSILON,
  );
  setScrollFlag(
    shell,
    "data-at-left",
    scroller.scrollLeft <= SCROLL_EDGE_EPSILON,
  );
  setScrollFlag(
    shell,
    "data-at-right",
    maxScrollX - scroller.scrollLeft <= SCROLL_EDGE_EPSILON,
  );
}

interface ViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  scrollX?: boolean;
  /**
   * A settled zero-rows state overlay (empty or error card) is showing.
   * The viewport goes all-or-nothing: the table (header included) is
   * hidden — a clipped or pannable header with no rows invites a scroll
   * that does nothing — and scrolling is locked on both axes so the card
   * centers in the visible scrollport. The table stays mounted
   * (CSS-hidden), so the loading → settled → retry transitions never
   * remount structures. The table and normal scroll behavior return as
   * soon as rows exist (skeletons included).
   */
  stateOverlay?: boolean;
}

const Viewport = React.forwardRef<HTMLDivElement, ViewportProps>(
  function Viewport(
    {
      children,
      className,
      scrollX = true,
      stateOverlay = false,
      onScroll,
      ...props
    },
    ref,
  ) {
    const shellRef = React.useRef<HTMLDivElement | null>(null);
    const scrollerRef = React.useRef<HTMLDivElement | null>(null);
    const frameRef = React.useRef(0);

    const setScrollerRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        scrollerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const measure = React.useCallback(() => {
      if (shellRef.current && scrollerRef.current) {
        measureScrollState(shellRef.current, scrollerRef.current);
      }
    }, []);

    /* Scroll events are rAF-throttled: at most one DOM-attribute sync per
       frame, and none of it goes through React state. */
    const scheduleMeasure = React.useCallback(() => {
      if (frameRef.current !== 0) {
        return;
      }
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = 0;
        measure();
      });
    }, [measure]);

    const handleScroll = React.useCallback(
      (event: React.UIEvent<HTMLDivElement>) => {
        scheduleMeasure();
        onScroll?.(event);
      },
      [scheduleMeasure, onScroll],
    );

    /* Content size only changes through React commits (rows load, columns
       change, the state overlay toggles), so re-measuring after every
       commit keeps the attributes honest without observing each child. */
    React.useEffect(() => {
      measure();
    });

    /* Viewport (client-box) size changes — window resizes, side panels —
       don't re-render this subtree, so they need a ResizeObserver. */
    React.useEffect(() => {
      const scroller = scrollerRef.current;
      if (!scroller || typeof ResizeObserver === "undefined") {
        return undefined;
      }
      const observer = new ResizeObserver(scheduleMeasure);
      observer.observe(scroller);
      return () => {
        observer.disconnect();
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      };
    }, [scheduleMeasure]);

    return (
      <div ref={shellRef} className={styles.viewportShell}>
        <div
          ref={setScrollerRef}
          className={clsx(styles.viewport, className)}
          data-scroll-x={scrollX || undefined}
          data-state-overlay={stateOverlay || undefined}
          onScroll={handleScroll}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  },
);

const DEFAULT_EMPTY_TITLE = "No data available";
const DEFAULT_ERROR_TITLE = "Couldn't load data";
const DEFAULT_ERROR_DESCRIPTION =
  "Something went wrong while loading. Check your connection and try again.";
const DEFAULT_RETRY_LABEL = "Retry";

export interface DataTableEmptyState {
  /** @default "No data available" */
  title?: string;
  description?: string;
}

export interface DataTableErrorState {
  /** @default "Couldn't load data" */
  title?: string;
  /**
   * @default "Something went wrong while loading. Check your connection and try again."
   */
  description?: string;
  /** Retry button text. @default "Retry" */
  retryLabel?: string;
  onRetry: () => void;
}

function EmptyCard({ empty }: { empty: DataTableEmptyState }) {
  return (
    <div className={styles.stateHost}>
      <div className={styles.stateCardContainer}>
        <div className={styles.stateCard}>
          <span className={styles.stateCardTitle}>
            {empty.title ?? DEFAULT_EMPTY_TITLE}
          </span>
          {empty.description !== undefined && (
            <span className={styles.stateCardText}>{empty.description}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Recoverable error card for a table whose page query failed. Rendered in
 * the same viewport-overlay slot as the empty card so a failed initial
 * load never masquerades as an empty result set — the user sees an honest
 * error with a retry affordance instead of a blank table.
 */
function ErrorCard({ error }: { error: DataTableErrorState }) {
  return (
    <div className={styles.stateHost}>
      <div className={styles.stateCardContainer}>
        <div className={styles.stateCard}>
          <span className={styles.stateCardTitle}>
            {error.title ?? DEFAULT_ERROR_TITLE}
          </span>
          <span className={styles.stateCardText}>
            {error.description ?? DEFAULT_ERROR_DESCRIPTION}
          </span>
          <Button
            variant="outline"
            size="compact"
            className={styles.retryButton}
            onClick={error.onRetry}
          >
            {error.retryLabel ?? DEFAULT_RETRY_LABEL}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface DataTableColumnBase<TRow> {
  header: React.ReactNode;
  /** Accessible header name used when loading replaces non-text content. */
  headerAriaLabel?: string;
  /**
   * Optional width hint in px for fixed-footprint structural/control columns.
   * Omit for native content sizing.
   */
  size?: number;
  align?: "left" | "right";
  /**
   * Bounds cell content to the shared intrinsic-width cap and truncates it
   * without adding an interactive disclosure control.
   */
  cellOverflow?: "truncate";
  /** Formatter slot; receives the typed row object. */
  cell?: (row: TRow) => React.ReactNode;
}

type StringKeyOf<T> = Extract<keyof T, string>;

type AccessorCell<
  TRow,
  TKey extends StringKeyOf<TRow>,
> = TRow[TKey] extends React.ReactNode
  ? unknown
  : {
      /** Non-renderable values require an explicit formatter. */
      cell: (row: TRow) => React.ReactNode;
    };

/**
 * A row-backed column. `accessorKey` is checked against string keys of the
 * row. Primitive/React-renderable properties render directly; object-valued
 * properties require a formatter so React never receives an accidental raw
 * object.
 */
export type DataTableAccessorColumn<TRow> = {
  [TKey in StringKeyOf<TRow>]: DataTableColumnBase<TRow> & {
    accessorKey: TKey;
  } & AccessorCell<TRow, TKey>;
}[StringKeyOf<TRow>];

/**
 * A display-only column for actions or derived content. A stable id and
 * renderer are both required because there is no row property to read.
 */
export interface DataTableDisplayColumn<TRow>
  extends Omit<DataTableColumnBase<TRow>, "cell"> {
  id: string;
  cell: (row: TRow) => React.ReactNode;
}

export type DataTableColumn<TRow> =
  | DataTableAccessorColumn<TRow>
  | DataTableDisplayColumn<TRow>;

interface ContentBaseProps<TRow> {
  columns: readonly DataTableColumn<TRow>[];
  data: readonly TRow[];
  loading?: boolean;
  /**
   * Keep provided rows mounted while loading. By default, loading replaces
   * rows with skeletons for backward compatibility.
   * @default false
   */
  showRowsWhileLoading?: boolean;
  /**
   * Rows of skeleton cells to render while loading. Typically wired from
   * `pagination.skeletonRowCount`; capped at 10 by the pagination model.
   * @default 10
   */
  skeletonRowCount?: number;
  /**
   * Error card shown when the page query failed (settled, zero rows).
   * The key is required so every consumer decides how failures surface;
   * pass `undefined` (or a conditional like `error && { ... }`) when there
   * is no error.
   */
  error: DataTableErrorState | false | undefined;
  /**
   * Empty card shown for a settled zero-row result. The object remains
   * required so consumers decide when a settled result is empty; its title
   * falls back to neutral internal copy.
   */
  empty: DataTableEmptyState;
  /** Stable row identity for React keys. Defaults to the row index. */
  getRowId?: (row: TRow) => string;
  /** Horizontal scrolling for wide tables (default on). */
  scrollX?: boolean;
  className?: string;
}

type ContentRowActivationProps<TRow> =
  | {
      /**
       * Row activation (click or Enter/Space on the focused row). Activated
       * rows retain native table-row semantics and require an accessible,
       * consumer-owned action label.
       */
      onRowActivate: (row: TRow, event: RowActivationEvent) => void;
      getRowActivationLabel: (row: TRow) => string;
    }
  | {
      onRowActivate?: undefined;
      getRowActivationLabel?: undefined;
    };

export type ContentProps<TRow> = ContentBaseProps<TRow> &
  ContentRowActivationProps<TRow>;

/**
 * Data-driven layer over `Table`: owns the TanStack table instance
 * (`useReactTable`/`flexRender`), the scroll viewport (sticky header, edge
 * fades), skeleton rows, column sizing/alignment, and the all-or-nothing
 * empty/error overlay. Consumers pass `DataTableColumn`s and rows — never
 * raw `ColumnDef`s and never the table instance.
 *
 * Escape hatch: tables that outgrow this surface (custom row structures,
 * row spanning, column pinning) compose `Table` parts directly —
 * `Table.Root`/`Table.Header`/`Table.Body`/... stay public and this
 * component adds nothing they can't.
 */
export function Content<TRow>({
  className,
  columns,
  data,
  empty,
  error,
  getRowActivationLabel,
  getRowId,
  loading = false,
  onRowActivate,
  scrollX = true,
  showRowsWhileLoading = false,
  skeletonRowCount,
}: ContentProps<TRow>) {
  const { density, label, paginationSkeletonRowCount } =
    React.useContext(DataTableContext);
  const resolvedSkeletonRowCount =
    skeletonRowCount ?? paginationSkeletonRowCount ?? 10;

  const columnDefs = React.useMemo<ColumnDef<TRow>[]>(
    () =>
      columns.map((column) => {
        if ("accessorKey" in column) {
          // The public mapped union correlates each key with its value type.
          // TanStack erases that key while iterating heterogeneous columns,
          // so the adapter intentionally widens only inside this conversion.
          const accessorColumn = column as DataTableColumnBase<TRow> & {
            accessorKey: StringKeyOf<TRow>;
          };
          return {
            id: accessorColumn.accessorKey,
            accessorFn: (row: TRow) => row[accessorColumn.accessorKey],
            header: () => accessorColumn.header,
            cell: (info) => {
              const rendered = accessorColumn.cell
                ? accessorColumn.cell(info.row.original)
                : (info.getValue() as React.ReactNode);
              return rendered ?? "-";
            },
          };
        }
        return {
          id: column.id,
          header: () => column.header,
          cell: (info) => column.cell(info.row.original) ?? "-",
        };
      }),
    [columns],
  );

  const table = useReactTable({
    data: data as TRow[],
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    ...(getRowId ? { getRowId } : {}),
  });

  const tableRows = table.getRowModel().rows;
  const coldLoading =
    loading && (!showRowsWhileLoading || tableRows.length === 0);
  const { coldReveal, tableRef } = useColdReveal({
    coldLoading,
    loading,
    hasRows: tableRows.length > 0,
  });
  const showErrorState = !loading && Boolean(error) && tableRows.length === 0;
  const showEmptyState = !loading && !error && tableRows.length === 0;

  const { columnPresentations, presentationById } = React.useMemo(() => {
    const list: {
      id: string;
      align: "left" | "right";
      size: number | undefined;
      cellOverflow: "truncate" | undefined;
      loadingLabel: string | undefined;
    }[] = [];
    const byId = new Map<string, (typeof list)[number]>();
    for (const column of columns) {
      const presentation = {
        id: "accessorKey" in column ? column.accessorKey : column.id,
        align: column.align ?? "left",
        size: column.size,
        cellOverflow: column.cellOverflow,
        loadingLabel:
          column.headerAriaLabel ??
          (typeof column.header === "string" ? column.header : undefined),
      };
      list.push(presentation);
      byId.set(presentation.id, presentation);
    }
    return { columnPresentations: list, presentationById: byId };
  }, [columns]);

  return (
    <Viewport
      scrollX={scrollX}
      stateOverlay={showErrorState || showEmptyState}
      {...(className !== undefined ? { className } : {})}
    >
      <Table.Root
        ref={tableRef}
        className={clsx(styles.autoLayoutTable, {
          [styles.coldLoadingTable]: coldLoading,
        })}
        caption={label}
        size={density === "compact" ? "compact" : "default"}
        clickable={onRowActivate !== undefined}
        aria-busy={loading || undefined}
        data-cold-reveal={coldReveal || undefined}
      >
        <colgroup>
          {columnPresentations.map((column) => (
            <col
              key={column.id}
              className={clsx({
                [styles.loadingColumn]:
                  coldLoading && column.size === undefined,
              })}
              {...(column.size !== undefined
                ? {
                    style: { width: "1%", minWidth: column.size },
                  }
                : {})}
            />
          ))}
        </colgroup>
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.HeaderRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const presentation = presentationById.get(header.column.id);
                return (
                  <Table.HeaderCell
                    key={header.id}
                    align={presentation?.align ?? "left"}
                    loading={coldLoading}
                    aria-label={
                      coldLoading ? presentation?.loadingLabel : undefined
                    }
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </Table.HeaderCell>
                );
              })}
            </Table.HeaderRow>
          ))}
        </Table.Header>
        <Table.Body aria-hidden={coldLoading || undefined}>
          {coldLoading
            ? Array.from(
                { length: resolvedSkeletonRowCount },
                (_, rowIndex) => (
                  <Table.Row key={rowIndex}>
                    {columnPresentations.map((column) => (
                      <Table.Cell
                        key={column.id}
                        align={column.align}
                        loading
                      />
                    ))}
                  </Table.Row>
                ),
              )
            : tableRows.map((row, rowIndex) => {
                const activationProps: RowProps = onRowActivate
                  ? {
                      onActivate: (event: RowActivationEvent) => {
                        onRowActivate(row.original, event);
                      },
                      activationLabel: getRowActivationLabel(row.original),
                    }
                  : {};
                return (
                  <Table.Row
                    key={row.id}
                    last={rowIndex === tableRows.length - 1}
                    {...activationProps}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Table.Cell
                        key={cell.id}
                        align={
                          presentationById.get(cell.column.id)?.align ?? "left"
                        }
                      >
                        {presentationById.get(cell.column.id)?.cellOverflow ===
                        "truncate" ? (
                          <Table.CellContent
                            bounded
                            disclosure={false}
                            label={flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          />
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )
                        )}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                );
              })}
        </Table.Body>
      </Table.Root>
      {showErrorState && error && <ErrorCard error={error} />}
      {showEmptyState && <EmptyCard empty={empty} />}
    </Viewport>
  );
}

export interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

/**
 * Pinned bar below the viewport, right-aligned. Hides itself (CSS `:empty`)
 * when custom content renders nothing, so no stray border shows.
 */
export const Footer = React.forwardRef<HTMLDivElement, FooterProps>(
  function Footer({ children, className, ...props }, ref) {
    return (
      <div ref={ref} className={clsx(styles.footer, className)} {...props}>
        {children}
      </div>
    );
  },
);

const DEFAULT_PAGE_SIZE_LABEL = "Rows per page";

interface StampedCursorTablePage extends CursorTablePage {
  readonly cursorSpaceIdentity: object;
  readonly pageNumber: number;
}

interface CursorTablePaginationModel {
  readonly ariaLabel: string;
  readonly currentPage: number;
  readonly pageSize: number;
  readonly pageSizeOptions: readonly number[];
  readonly canGoPrevious: boolean;
  readonly canGoNext: boolean;
  readonly nextCursor: string | null;
  readonly statusLabel: string;
  readonly showFooter: boolean;
  readonly goPrevious: () => void;
  readonly goNext: (cursor: string) => void;
  readonly setPageSize: (pageSize: number) => void;
}

function isSameCursorTablePage(
  previous: CursorTablePage,
  next: CursorTablePage,
): boolean {
  return (
    previous.endCursor === next.endCursor &&
    previous.hasNextPage === next.hasNextPage &&
    previous.rowCount === next.rowCount &&
    previous.count.value === next.count.value &&
    previous.count.accuracy === next.count.accuracy
  );
}

function isSameStampedCursorTablePage(
  previous: StampedCursorTablePage | undefined,
  next: StampedCursorTablePage,
): boolean {
  return (
    previous !== undefined &&
    previous.cursorSpaceIdentity === next.cursorSpaceIdentity &&
    previous.pageNumber === next.pageNumber &&
    isSameCursorTablePage(previous, next)
  );
}

function getEffectivePageSizeOptions({
  count,
  currentPageSize,
  pageSizeOptions,
}: {
  count: CursorTablePage["count"] | undefined;
  currentPageSize: number;
  pageSizeOptions: readonly number[];
}): readonly number[] {
  let options = pageSizeOptions;
  if (count?.accuracy === "exact") {
    options = pageSizeOptions.filter(
      (option, index) =>
        index === 0 || (pageSizeOptions[index - 1] ?? option) < count.value,
    );
  }
  if (!options.includes(currentPageSize)) {
    return [...options, currentPageSize].sort((a, b) => a - b);
  }
  return options;
}

function formatCursorTableStatus({
  currentPage,
  page,
  pageSize,
}: {
  currentPage: number;
  page: StampedCursorTablePage | undefined;
  pageSize: number;
}): string {
  if (!page) {
    return `Page ${currentPage}`;
  }
  const { count, rowCount } = page;
  const totalLabel = `${count.value}${
    count.accuracy === "lower-bound" ? "+" : ""
  }`;
  if (rowCount === 0 || count.value === 0) {
    return `Viewing 0 of ${totalLabel} results`;
  }
  const calculatedStart = (page.pageNumber - 1) * pageSize + 1;
  const start =
    count.accuracy === "exact"
      ? Math.min(calculatedStart, count.value)
      : calculatedStart;
  const calculatedEnd = start + rowCount - 1;
  const end =
    count.accuracy === "exact"
      ? Math.min(calculatedEnd, count.value)
      : calculatedEnd;
  return `Viewing ${start}-${end} of ${totalLabel} results`;
}

function useCursorTableRootPagination(
  pagination: DataTableCursorPagination | undefined,
  label: string,
): CursorTablePaginationModel | undefined {
  const [latchedPage, setLatchedPage] = React.useState<
    StampedCursorTablePage | undefined
  >(undefined);
  const staleWarningKeyRef = React.useRef<string | undefined>(undefined);

  if (!pagination) {
    return undefined;
  }

  const { controller, page } = pagination;
  const snapshot = getCursorTableControllerSnapshot(controller);
  let visiblePage =
    latchedPage?.cursorSpaceIdentity === snapshot.cursorSpaceIdentity
      ? latchedPage
      : undefined;

  if (page) {
    const stampedPage: StampedCursorTablePage = {
      ...page,
      cursorSpaceIdentity: snapshot.cursorSpaceIdentity,
      pageNumber: snapshot.currentPage,
    };
    const stalePage =
      visiblePage !== undefined &&
      visiblePage.pageNumber !== stampedPage.pageNumber &&
      isSameCursorTablePage(visiblePage, stampedPage)
        ? visiblePage
        : undefined;

    if (stalePage) {
      const warningKey = `${stalePage.pageNumber}:${stampedPage.pageNumber}`;
      if (staleWarningKeyRef.current !== warningKey) {
        staleWarningKeyRef.current = warningKey;
        devWarn(
          `[DataTable.Root] pagination.page is identical to page ` +
            `${stalePage.pageNumber}'s settled response while the controller ` +
            `is on page ${stampedPage.pageNumber}. The stale page was ignored. ` +
            `Pass undefined while the current request is loading and do not ` +
            `pass previousData.`,
        );
      }
    } else {
      staleWarningKeyRef.current = undefined;
      visiblePage = stampedPage;
      if (!isSameStampedCursorTablePage(latchedPage, stampedPage)) {
        setLatchedPage(stampedPage);
      }
    }
  }

  const nextCursor =
    visiblePage?.pageNumber === snapshot.currentPage &&
    visiblePage.hasNextPage &&
    visiblePage.endCursor
      ? visiblePage.endCursor
      : null;
  const canGoNext = nextCursor !== null;
  const firstPageSize = controller.pageSizeOptions[0] ?? 1;
  const showFooter =
    controller.canGoPrevious ||
    canGoNext ||
    (visiblePage?.count.value ?? 0) > firstPageSize;

  return {
    ariaLabel: `${label} pagination`,
    currentPage: controller.currentPage,
    pageSize: controller.request.pageSize,
    pageSizeOptions: getEffectivePageSizeOptions({
      count: visiblePage?.count,
      currentPageSize: controller.request.pageSize,
      pageSizeOptions: controller.pageSizeOptions,
    }),
    canGoPrevious: controller.canGoPrevious,
    canGoNext,
    nextCursor,
    statusLabel: formatCursorTableStatus({
      currentPage: controller.currentPage,
      page: visiblePage,
      pageSize: controller.request.pageSize,
    }),
    showFooter,
    goPrevious: controller.goPrevious,
    goNext: controller.goNext,
    setPageSize: controller.setPageSize,
  };
}

function CursorTablePaginationView({
  model,
}: {
  model: CursorTablePaginationModel;
}) {
  return (
    <OriginPager.Root
      aria-label={model.ariaLabel}
      hasNext={model.canGoNext}
      hasPrevious={model.canGoPrevious}
      onNext={() => {
        if (model.nextCursor !== null) {
          model.goNext(model.nextCursor);
        }
      }}
      onPrevious={model.goPrevious}
    >
      {model.pageSizeOptions.length > 1 && (
        <div className={styles.pageSizeField}>
          <span>{DEFAULT_PAGE_SIZE_LABEL}</span>
          <Select.Root
            value={model.pageSize}
            onValueChange={(pageSize) => {
              if (pageSize !== null) {
                model.setPageSize(pageSize);
              }
            }}
          >
            <Select.Trigger
              aria-label={DEFAULT_PAGE_SIZE_LABEL}
              variant="ghost"
              className={styles.pageSizeTrigger}
            >
              <Select.Value />
              <Select.Icon />
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner>
                <Select.Popup>
                  <Select.List>
                    {model.pageSizeOptions.map((option) => (
                      <Select.Item key={option} value={option}>
                        <Select.ItemIndicator />
                        <Select.ItemText>{option}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </div>
      )}
      <OriginPager.Status>{model.statusLabel}</OriginPager.Status>
      <OriginPager.Navigation>
        <OriginPager.Previous />
        <OriginPager.Next />
      </OriginPager.Navigation>
    </OriginPager.Root>
  );
}

export const DataTable = {
  Root,
  Toolbar,
  Content,
  Footer,
};

if (process.env.NODE_ENV !== "production") {
  Root.displayName = "DataTableRoot";
  Toolbar.displayName = "DataTableToolbar";
  Viewport.displayName = "DataTableViewport";
  Content.displayName = "DataTableContent";
  Footer.displayName = "DataTableFooter";
}
