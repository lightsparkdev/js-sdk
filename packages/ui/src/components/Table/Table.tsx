import { css, useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type CellContext,
  type ColumnDef,
  type ColumnSort,
  type HeaderContext,
  type Row,
  type SortingFnOption,
} from "@tanstack/react-table";
import { isObject } from "lodash-es";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useClipboard } from "../../hooks/useClipboard.js";
import {
  Link,
  replaceParams,
  useNavigate,
  type RouteParams,
} from "../../router.js";
import { bp } from "../../styles/breakpoints.js";
import { standardContentInset } from "../../styles/common.js";
import { themeOrWithKey } from "../../styles/themes.js";
import {
  lineClamp,
  overflowAutoWithoutScrollbars,
} from "../../styles/utils.js";
import { type NewRoutesType } from "../../types/index.js";
import { type ElideObjArgs } from "../../utils/strings.js";
import { type ToReactNodesArgs } from "../../utils/toReactNodes/toReactNodes.js";
import { Checkbox } from "../Checkbox.js";
import { ClipboardTextField } from "../ClipboardTextField.js";
import { Dropdown } from "../Dropdown.js";
import { Icon } from "../Icon/Icon.js";
import { type IconName } from "../Icon/types.js";
import { InfoIconTooltip } from "../InfoIconTooltip.js";
import { Loading } from "../Loading.js";
import { type PartialSimpleTypographyProps } from "../typography/types.js";

export type TableColumnHeaderInfo = string | { name: string; tooltip?: string };

export type TableCell =
  | string
  | LinkCell
  | ClipboardCell
  | MultilineCell
  | ReactNode;

type ObjectCell = {
  text: string;
  icon?: IconName | undefined;
  base64icon?: string | undefined;
};
const isObjectCell = (value: unknown): value is ObjectCell => {
  return isObject(value) && "text" in value && typeof value.text === "string";
};

type LinkCell = ObjectCell & {
  link?: string | undefined;
  to?: NewRoutesType;
  toParams?: RouteParams;
  multiline?: true;
};
const isLinkCell = (value: unknown): value is LinkCell => {
  return isObjectCell(value) && ("link" in value || "to" in value);
};

type ClipboardCell = ObjectCell & {
  canCopy: true;
  maxChars?: ElideObjArgs["maxChars"] | undefined;
  ellipsisPosition?: ElideObjArgs["ellipsisPosition"] | undefined;
};
const isClipboardCell = (value: unknown): value is ClipboardCell => {
  return isObjectCell(value) && "canCopy" in value;
};

type LinkAndClipboardCell = LinkCell & ClipboardCell;
const isLinkAndClipboardCell = (
  value: unknown,
): value is LinkAndClipboardCell => {
  return (
    isObjectCell(value) &&
    ("link" in value || "to" in value) &&
    "canCopy" in value
  );
};

type MultilineCell = ObjectCell & {
  multiline: true;
};
const isMultilineCell = (value: unknown): value is MultilineCell => {
  return isObjectCell(value) && "multiline" in value;
};

interface Column<T extends Record<string, unknown>> {
  header: TableColumnHeaderInfo;
  accessorKey: keyof T;
  function?: (context: CellContext<T, TableCell>) => ReactNode;
  enableSorting?: boolean;
  sortDescFirst?: boolean;
  sortingFn?: SortingFnOption<T>;
}

export type CustomTableComponents = {
  table?: React.ComponentType<React.ComponentProps<typeof StyledTable>>;
  dropdownComponent?: React.ComponentType<
    React.ComponentProps<typeof Dropdown>
  >;
  clipboardTextField?: {
    typography?: PartialSimpleTypographyProps;
    iconName?: IconName;
  };
};

export type TableProps<T extends Record<string, unknown>> = {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onClickRow?: (row: Row<T>) => {
    link?: string;
    to?: NewRoutesType;
    params?: RouteParams;
    // Passed to the router as navigation state (in-memory, never in the
    // URL), for payloads that shouldn't appear in history or logs.
    state?: unknown;
  } | void;
  emptyState?: ReactNode;
  clipboardCallbacks?: Parameters<typeof useClipboard>[0] | undefined;
  rowHoverEffect?: "border" | "background" | "none" | undefined;
  customComponents?: CustomTableComponents;
  minHeight?: number;
  tripleDotsMenuItems?: {
    text: ToReactNodesArgs;
    onClick: (row: T) => void;
  }[];
  rowSelection?: {
    selectedRowIds: string[];
    onSelectedRowIdsChange: (selectedRowIds: string[]) => void;
    getRowId: (row: T) => string;
  };
  /**
   * Opt-in keyboard row navigation: highlights an "active" row, moves it with
   * ArrowUp/ArrowDown, and activates it on Enter. Off by default so existing
   * tables are unaffected. Optionally control the active index from the caller
   * (e.g. to drive it from a search box); falls back to internal state.
   */
  keyboardRowNavigation?: boolean | undefined;
  activeRowIndex?: number | undefined;
  onActiveRowIndexChange?: ((activeRowIndex: number) => void) | undefined;
  /**
   * Fires with the active row's underlying data (in the table's displayed
   * order) whenever the highlight moves. Use this — not the caller's own array
   * + index — to act on the highlighted row, so sorting can't desync them.
   */
  onActiveRowChange?: ((row: T | undefined) => void) | undefined;
  /**
   * Stable id for a row's data. Defaults to the row index, which means the
   * change-detection key stays constant across result sets of the same size —
   * pass this (e.g. `(row) => row.id`) so keyboard-nav state resets correctly
   * when the data changes.
   */
  getRowId?: ((originalRow: T) => string) | undefined;
  loadingStyle?:
    | {
        style: "spinner";
      }
    | {
        style: "progress-bar";
        timeMs: number;
      }
    | {
        style: "none";
      };
  fullHeight?: boolean;
};

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading,
  onClickRow,
  emptyState,
  clipboardCallbacks,
  customComponents,
  tripleDotsMenuItems,
  rowSelection,
  rowHoverEffect = "border",
  minHeight = 300,
  loadingStyle = { style: "spinner" },
  fullHeight = false,
  keyboardRowNavigation = false,
  activeRowIndex,
  onActiveRowIndexChange,
  onActiveRowChange,
  getRowId,
}: TableProps<T>) {
  const navigate = useNavigate();
  const theme = useTheme();
  const [sorting, setSorting] = useState<ColumnSort[]>([]);
  const [internalActiveRowIndex, setInternalActiveRowIndex] = useState(0);
  const activeRow = activeRowIndex ?? internalActiveRowIndex;
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  // Refs so effects can notify a controlled parent without taking the
  // (potentially unmemoized) callbacks as dependencies.
  const onActiveRowIndexChangeRef = useRef(onActiveRowIndexChange);
  onActiveRowIndexChangeRef.current = onActiveRowIndexChange;
  const onActiveRowChangeRef = useRef(onActiveRowChange);
  onActiveRowChangeRef.current = onActiveRowChange;

  const { canWriteToClipboard, writeTextToClipboard } =
    useClipboard(clipboardCallbacks);
  const onClickCopy = useCallback(
    (value: string) => (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      void writeTextToClipboard(value);
    },
    [writeTextToClipboard],
  );
  const selectedRowIdsSet = useMemo(
    () => new Set(rowSelection?.selectedRowIds ?? []),
    [rowSelection?.selectedRowIds],
  );
  const visibleRowIds = useMemo(
    () =>
      data
        .map((row) => rowSelection?.getRowId(row))
        .filter((rowId): rowId is string => Boolean(rowId)),
    [data, rowSelection],
  );
  const allVisibleRowsSelected =
    visibleRowIds.length > 0 &&
    visibleRowIds.every((rowId) => selectedRowIdsSet.has(rowId));

  const toggleRowSelection = useCallback(
    (rowId: string) => {
      if (!rowSelection) {
        return;
      }

      const nextSelection = new Set(rowSelection.selectedRowIds);
      if (nextSelection.has(rowId)) {
        nextSelection.delete(rowId);
      } else {
        nextSelection.add(rowId);
      }
      rowSelection.onSelectedRowIdsChange([...nextSelection]);
    },
    [rowSelection],
  );

  const toggleAllVisibleRowsSelection = useCallback(() => {
    if (!rowSelection) {
      return;
    }

    const nextSelection = new Set(rowSelection.selectedRowIds);
    if (allVisibleRowsSelected) {
      visibleRowIds.forEach((rowId) => nextSelection.delete(rowId));
    } else {
      visibleRowIds.forEach((rowId) => nextSelection.add(rowId));
    }
    rowSelection.onSelectedRowIdsChange([...nextSelection]);
  }, [allVisibleRowsSelected, rowSelection, visibleRowIds]);

  const mappedColumns = useMemo(() => {
    const columnsToRender: ColumnDef<T, TableCell>[] = columns.map(
      (column) => ({
        ...column,
        header: (context: HeaderContext<T, TableCell>) =>
          typeof column.header === "string" ? (
            column.header
          ) : (
            <div>
              {column.header.name}
              <InfoIconTooltip
                id={`tooltip-${column.header.name}`}
                content={column.header.tooltip || ""}
                verticalAlign={-2}
              />
            </div>
          ),
        accessorKey: column.accessorKey.toString(),
        enableSorting: column.enableSorting ?? false,
        sortDescFirst: column.sortDescFirst ?? false,
        cell: (context: CellContext<T, TableCell>) => {
          if (column.function && typeof column.function === "function") {
            return column.function(context);
          }

          const value = context.getValue();

          let content: ReactNode = null;
          let icon = null;
          if (isObjectCell(value)) {
            const base64icon = value.base64icon ? (
              <Base64Icon src={value.base64icon} alt="Icon" />
            ) : null;
            icon = value.icon ? (
              <Icon name={value.icon} width={14} mr={4} color="c4Neutral" />
            ) : null;
            if (isMultilineCell(value)) {
              content = (
                <LineClampSpan>
                  {base64icon ? base64icon : icon}
                  {value.text}
                </LineClampSpan>
              );
            } else {
              content = (
                <Fragment>
                  {base64icon ? base64icon : icon}
                  {value.text}
                </Fragment>
              );
            }
          } else {
            content = value;
          }

          if (isLinkAndClipboardCell(value)) {
            const copyButton = canWriteToClipboard && (
              <CopyButton
                onClick={onClickCopy(value.text)}
                role="button"
                tabIndex={0}
              >
                <Icon name="Copy" width={16} mr={12} />
              </CopyButton>
            );
            return value.link ? (
              <LinkClipboardCell>
                <HoverableLinkCell
                  href={value.link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Icon name="LinkIcon" width={12} />
                  <LinkCellContent>{content}</LinkCellContent>
                </HoverableLinkCell>
                {copyButton}
              </LinkClipboardCell>
            ) : value.to ? (
              <HoverableCellWrapper>
                <Link
                  to={value.to}
                  params={value.toParams}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {icon}
                  <LinkCellContent>{value.text}</LinkCellContent>
                </Link>
                {copyButton}
              </HoverableCellWrapper>
            ) : (
              <span>{content}</span>
            );
          } else if (isLinkCell(value)) {
            return value.link ? (
              <HoverableLinkCell
                href={value.link}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Icon name="LinkIcon" width={12} />
                <LinkCellContent>{content}</LinkCellContent>
              </HoverableLinkCell>
            ) : value.to ? (
              <HoverableCellWrapper>
                <Link
                  to={value.to}
                  params={value.toParams}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {icon}
                  <LinkCellContent>{value.text}</LinkCellContent>
                </Link>
              </HoverableCellWrapper>
            ) : (
              <span>{content}</span>
            );
          } else if (isClipboardCell(value)) {
            let maxLines = 1;
            let maxChars = undefined;
            if (isMultilineCell(value)) {
              maxLines = 2;
            } else {
              maxChars = value.maxChars || 16;
            }
            const ellipsisPosition = value.ellipsisPosition || "middle";
            return (
              <HoverableCellWrapper>
                {icon}
                <ClipboardTextField
                  value={value.text}
                  elide={
                    maxChars
                      ? {
                          maxChars,
                          ellipsisPosition,
                        }
                      : undefined
                  }
                  stopPropagation
                  maxLines={maxLines}
                  icon
                  iconSide="right"
                  clipboardCallbacks={clipboardCallbacks}
                  typography={
                    customComponents?.clipboardTextField?.typography
                      ? customComponents.clipboardTextField.typography
                      : undefined
                  }
                  iconName={customComponents?.clipboardTextField?.iconName}
                />
              </HoverableCellWrapper>
            );
          }
          return <span>{content}</span>;
        },
      }),
    );

    if (rowSelection) {
      columnsToRender.unshift({
        id: "rowSelection",
        enableSorting: false,
        header: () => (
          <SelectionCheckboxContainer
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <Checkbox
              checked={allVisibleRowsSelected}
              onChange={toggleAllVisibleRowsSelection}
            />
          </SelectionCheckboxContainer>
        ),
        cell: (context) => {
          const rowId = rowSelection.getRowId(context.row.original);
          return (
            <SelectionCheckboxContainer
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <Checkbox
                checked={selectedRowIdsSet.has(rowId)}
                onChange={() => toggleRowSelection(rowId)}
              />
            </SelectionCheckboxContainer>
          );
        },
      });
    }

    if (tripleDotsMenuItems) {
      const DropdownComponent = customComponents?.dropdownComponent || Dropdown;

      columnsToRender.push({
        id: "tripleDots",
        enableSorting: false,
        header: () => "",
        cell: (context) => (
          <DropdownComponent
            button={{
              icon: {
                name: "CentralDotGrid1x3Vertical",
              },
              kind: "ghost",
            }}
            align="right"
            dropdownItems={
              tripleDotsMenuItems?.map((item) => ({
                label: item.text,
                onClick: () => item.onClick(context.row.original),
              })) || []
            }
          />
        ),
      });
    }

    return columnsToRender;
  }, [
    columns,
    canWriteToClipboard,
    onClickCopy,
    clipboardCallbacks,
    customComponents,
    rowSelection,
    allVisibleRowsSelected,
    toggleAllVisibleRowsSelection,
    selectedRowIdsSet,
    toggleRowSelection,
    tripleDotsMenuItems,
  ]);

  const tableInstance = useReactTable({
    columns: mappedColumns,
    data,
    ...(getRowId ? { getRowId } : {}),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // debugTable: true
  });

  const visibleRows = tableInstance.getRowModel().rows;
  const visibleRowsRef = useRef(visibleRows);
  visibleRowsRef.current = visibleRows;
  const visibleRowIdsKey = visibleRows.map((row) => row.id).join(",");
  // Reset the highlight to the top row whenever the result set changes (-1 when
  // empty), so a fresh search auto-highlights the first result, and report that
  // top row. Reporting here (rather than relying on the activeRow effect below)
  // avoids a same-flush race: on a data change the activeRow state reset hasn't
  // committed yet, so reading `activeRow` could be a stale, out-of-range index.
  useEffect(() => {
    const next = visibleRowIdsKey === "" ? -1 : 0;
    setInternalActiveRowIndex(next);
    onActiveRowIndexChangeRef.current?.(next);
    if (keyboardRowNavigation) {
      onActiveRowChangeRef.current?.(visibleRowsRef.current[next]?.original);
    }
  }, [visibleRowIdsKey, keyboardRowNavigation]);

  // Report the active row's data (in displayed order) as the highlight moves
  // (arrows). Not keyed on the data — data changes are handled above with the
  // correct reset index, so this never reads a stale activeRow. Also scroll the
  // active row into view (without stealing focus) so a highlight driven by an
  // external control (e.g. a search box) can't move off-screen.
  useEffect(() => {
    if (!keyboardRowNavigation) {
      return;
    }
    onActiveRowChangeRef.current?.(visibleRowsRef.current[activeRow]?.original);
    rowRefs.current[activeRow]?.scrollIntoView({ block: "nearest" });
  }, [activeRow, keyboardRowNavigation]);

  function moveActiveRow(delta: number) {
    const next = Math.min(
      Math.max(activeRow + delta, 0),
      visibleRows.length - 1,
    );
    setInternalActiveRowIndex(next);
    onActiveRowIndexChange?.(next);
    rowRefs.current[next]?.focus();
    rowRefs.current[next]?.scrollIntoView({ block: "nearest" });
  }

  function onTableKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    if (!keyboardRowNavigation) {
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActiveRow(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActiveRow(-1);
    }
  }

  function onClickDataRow(
    event: MouseEvent<HTMLTableRowElement> | KeyboardEvent<HTMLTableRowElement>,
    row: Row<T>,
  ) {
    const onClickRowResult = onClickRow ? onClickRow(row) : null;
    if (onClickRowResult) {
      const newTabKey = event.metaKey || event.ctrlKey;
      if (onClickRowResult?.link || (onClickRowResult?.to && newTabKey)) {
        let link = onClickRowResult?.link;
        if (!link) {
          link = replaceParams(onClickRowResult.to!, onClickRowResult.params);
        }
        const target = newTabKey ? "_blank" : undefined;
        window.open(link, target);
      } else if (onClickRowResult?.to) {
        navigate(
          onClickRowResult.to,
          onClickRowResult.params,
          onClickRowResult.state !== undefined
            ? { state: onClickRowResult.state }
            : undefined,
        );
      }
    }
  }

  const thead = (
    <thead>
      {
        // Loop over the header rows
        tableInstance.getHeaderGroups().map((headerGroup) => {
          return (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sortDirection = header.column.getIsSorted();
                const onSort = header.column.getToggleSortingHandler();
                return (
                  <th
                    key={header.id}
                    aria-sort={
                      sortDirection === "asc"
                        ? "ascending"
                        : sortDirection === "desc"
                        ? "descending"
                        : canSort
                        ? "none"
                        : undefined
                    }
                    data-sortable={canSort ? "true" : undefined}
                    data-sorted={sortDirection || undefined}
                    onClick={canSort ? onSort : undefined}
                    onKeyDown={
                      canSort
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              onSort?.(event);
                            }
                          }
                        : undefined
                    }
                    style={
                      canSort
                        ? { cursor: "pointer", userSelect: "none" }
                        : undefined
                    }
                    tabIndex={canSort ? 0 : undefined}
                  >
                    {header.isPlaceholder ? null : (
                      <HeaderContent>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {canSort ? (
                          <SortIcon
                            aria-hidden="true"
                            data-sort-icon
                            $active={Boolean(sortDirection)}
                          >
                            <Icon
                              name={
                                sortDirection === "asc"
                                  ? "ChevronUp"
                                  : sortDirection === "desc"
                                  ? "ChevronDown"
                                  : "Sort"
                              }
                              width={12}
                            />
                          </SortIcon>
                        ) : null}
                      </HeaderContent>
                    )}
                  </th>
                );
              })}
            </tr>
          );
        })
      }
    </thead>
  );

  const tbody = (
    <tbody>
      {(!loading || ["none", "spinner"].includes(loadingStyle.style)) &&
        // Loop over the table rows
        tableInstance.getRowModel().rows.map((row, rowIndex) => {
          const isActiveRow = keyboardRowNavigation && rowIndex === activeRow;
          return (
            <tr
              key={row.id}
              ref={(el) => {
                rowRefs.current[rowIndex] = el;
              }}
              onClick={(event) => onClickDataRow(event, row)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onClickDataRow(event, row);
                }
              }}
              // Roving tabindex in keyboard-nav mode: only the active row is in
              // the tab order; otherwise keep every row focusable as before.
              tabIndex={
                keyboardRowNavigation ? (rowIndex === activeRow ? 0 : -1) : 0
              }
              aria-selected={
                keyboardRowNavigation ? rowIndex === activeRow : undefined
              }
            >
              {row.getVisibleCells().map((cell, cellIndex) => (
                <td
                  key={cell.id}
                  // Highlight the active row inline (not via styled CSS) so it
                  // works regardless of the custom `table` component a caller
                  // supplies. Left accent on the first cell marks the selection.
                  style={
                    isActiveRow
                      ? {
                          background: theme.c1Neutral,
                          boxShadow:
                            cellIndex === 0
                              ? `inset 3px 0 0 ${theme.c4Neutral}`
                              : undefined,
                        }
                      : undefined
                  }
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          );
        })}
    </tbody>
  );

  const TableComponent = customComponents?.table || StyledTable;

  return (
    <TableWrapper minHeight={minHeight} fullHeight={fullHeight}>
      <TableComponent
        clickable={Boolean(onClickRow)}
        rowHoverEffect={rowHoverEffect}
        // role="grid" makes aria-selected on rows valid (a plain table's rows
        // don't support it). Only applied in keyboard-nav mode.
        role={keyboardRowNavigation ? "grid" : undefined}
        onKeyDown={keyboardRowNavigation ? onTableKeyDown : undefined}
      >
        {thead}
        {tbody}
      </TableComponent>
      {!loading && emptyState}
      {loading && loadingStyle.style === "spinner" && <Loading />}
      {loading && loadingStyle.style === "progress-bar" && (
        <ProgressBar timeMs={loadingStyle.timeMs} />
      )}
    </TableWrapper>
  );
}

function ProgressBar({ timeMs }: { timeMs: number }) {
  return (
    <ProgressBarContainer>
      <ProgressBarInner timeMs={timeMs} />
    </ProgressBarContainer>
  );
}

const ProgressBarContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 280px;
  height: 3px;
  background: ${({ theme }) => theme.bg};
`;

const ProgressBarInner = styled.div<{ timeMs: number }>`
  height: 100%;
  background: ${({ theme }) => theme.text};

  @keyframes progressBar {
    0% {
      width: 0%;
    }
    50% {
      width: 90%;
    }
    100% {
      width: 95%;
    }
  }

  animation: progressBar ${({ timeMs }) => timeMs}ms ease-out forwards;
`;

type TableWrapperProps = {
  minHeight: number;
  fullHeight: boolean;
};

const TableWrapper = styled.div<TableWrapperProps>`
  position: relative;
  min-height: ${({ minHeight }) => minHeight}px;
  ${overflowAutoWithoutScrollbars}
  ${({ fullHeight }) =>
    fullHeight &&
    css`
      height: 100%;
    `}
`;

export type StyledTableProps = {
  clickable: boolean;
  rowHoverEffect: "border" | "background" | "none" | undefined;
};

const hoverCellStyles = css`
  cursor: pointer;
  transition: opacity 0.25s;

  &:hover {
    opacity: 0.6;
  }
`;

const LinkCellContent = styled.span`
  vertical-align: middle;
`;

const HoverableCellWrapper = styled.div`
  ${hoverCellStyles}

  ${Link} {
    text-overflow: ellipsis;
    overflow: hidden;
  }
  display: flex !important;
  gap: 4px;
`;

const LinkClipboardCell = styled.a`
  ${hoverCellStyles}

  color: ${({ theme }) => theme.hcNeutral};
  display: flex !important;
  gap: 4px;
`;

const HoverableLinkCell = styled.a`
  ${hoverCellStyles}

  color: ${({ theme }) => theme.hcNeutral};
  display: flex !important;
  gap: 4px;
`;

const CopyButton = styled.span`
  overflow: hidden;
  align-items: center;
  cursor: pointer;
  display: inline-table;
`;

const LineClampSpan = styled.span`
  ${lineClamp(2)}
`;

const Base64Icon = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 4px;
  margin-right: 12px;
`;

const SelectionCheckboxContainer = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderContent = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
`;

const SortIcon = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  transition: opacity 150ms ease;

  th:hover &,
  th:focus-visible & {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const cellPaddingPx = 15;
const StyledTable = styled.table<StyledTableProps>`
  position: relative;
  border-spacing: 0;
  width: 100%;

  /* Important to use padding here instead of width so that table container overflow functions properly: */
  ${bp.lg(`
    padding-left: ${standardContentInset.lgPx}px;
    padding-right: ${standardContentInset.lgPx}px;
  `)}
  ${bp.sm(`
    padding-left: ${standardContentInset.smPx}px;
    padding-right: ${standardContentInset.smPx}px;
  `)}
  ${bp.minSmMaxLg(`
    padding-left: ${standardContentInset.minSmMaxLgPx}px;
    padding-right: ${standardContentInset.minSmMaxLgPx}px;
  `)}

  th {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
    padding: ${cellPaddingPx}px 0px;
    border-bottom: 1px solid
      ${({ theme }) => themeOrWithKey("c1Neutral", "c2Neutral")({ theme })};
    padding: ${cellPaddingPx}px;
    &:first-of-type {
      padding-left: 0px;
    }
    &:last-of-type {
      padding-right: 0px;
    }
    &:last-of-type {
      text-align: right;
    }
  }

  td {
    max-width: 200px;
    text-overflow: ellipsis;
    overflow: hidden;
    padding: 0 ${cellPaddingPx}px;
    white-space: nowrap;
    & > span {
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
      padding: ${cellPaddingPx}px 0px;
      & > * {
        overflow: hidden;
        text-overflow: ellipsis;
        vertical-align: middle;
      }
    }
    &:first-of-type {
      padding-left: 0px;
    }
    &:last-of-type {
      text-align: right;
      padding-right: 0px;
    }
    & span:has(> ${LineClampSpan}),
    & ${LineClampSpan} {
      white-space: normal;
    }
  }

  tr {
    cursor: ${({ clickable }) => (clickable ? "pointer" : "default")};
    position: relative;

    ${({ rowHoverEffect, theme }) =>
      `
        &:hover {
          td {
            position: relative;
            &:before {
              content: "";
              display: block;
              position: absolute;
              pointer-events: none;
              height: 80%;
              top: 10%;
              bottom: 10%;
              ${
                rowHoverEffect === "background"
                  ? `background: ${theme.c1Neutral};`
                  : `
                    border: 1px solid ${themeOrWithKey(
                      "c1Neutral",
                      "c2Neutral",
                    )({ theme })};
                    border-left-width: 0;
                    border-right-width: 0;
                  `
              }
              left: 0;
              right: 0;
              width: 100%;
            }
            &:first-of-type {
              overflow: visible;
              &:before {
                border-top-left-radius: 32px;
                border-bottom-left-radius: 32px;
                transform: translateX(-12px);
                width: calc(100% + 12px);
                ${rowHoverEffect === "border" ? "border-left-width: 1px;" : ""}
              }
            }
            &:last-of-type {
              overflow: visible;
              &:before {
                border-top-right-radius: 32px;
                border-bottom-right-radius: 32px;
                transform: translateX(12px);
                width: calc(100% + 12px);
                left: auto;
                ${rowHoverEffect === "border" ? "border-right-width: 1px;" : ""}
              }
            }
          }
        }
        `}
  }
`;
