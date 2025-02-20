import { css } from "@emotion/react";
import styled from "@emotion/styled";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type CellContext,
  type ColumnSort,
  type HeaderContext,
  type Row,
} from "@tanstack/react-table";
import { isObject } from "lodash-es";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { Fragment, useCallback, useMemo, useState } from "react";
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
import { ClipboardTextField } from "../ClipboardTextField.js";
import { Icon } from "../Icon/Icon.js";
import { type IconName } from "../Icon/types.js";
import { InfoIconTooltip } from "../InfoIconTooltip.js";
import { Loading } from "../Loading.js";

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
}

export type TableProps<T extends Record<string, unknown>> = {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onClickRow?: (
    row: Row<T>,
  ) => { link?: string; to?: NewRoutesType; params: RouteParams } | void;
  emptyState?: ReactNode;
  clipboardCallbacks?: Parameters<typeof useClipboard>[0] | undefined;
  rowHoverEffect?: "border" | "background" | "none" | undefined;
};

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading,
  onClickRow,
  emptyState,
  clipboardCallbacks,
  rowHoverEffect = "border",
}: TableProps<T>) {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<ColumnSort[]>([]);

  const { canWriteToClipboard, writeTextToClipboard } =
    useClipboard(clipboardCallbacks);
  const onClickCopy = useCallback(
    (value: string) => (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      void writeTextToClipboard(value);
    },
    [writeTextToClipboard],
  );

  const mappedColumns = useMemo(
    () =>
      columns.map((column) => ({
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
        cell: (context: CellContext<T, TableCell>) => {
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
                />
              </HoverableCellWrapper>
            );
          }
          return <span>{content}</span>;
        },
      })),
    [columns, canWriteToClipboard, onClickCopy, clipboardCallbacks],
  );

  const tableInstance = useReactTable({
    columns: mappedColumns,
    data,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // debugTable: true
  });

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
        navigate(onClickRowResult.to, onClickRowResult.params);
      }
    }
  }

  return (
    <TableWrapper>
      <StyledTable
        clickable={Boolean(onClickRow)}
        rowHoverEffect={rowHoverEffect}
      >
        <thead>
          {
            // Loop over the header rows
            tableInstance.getHeaderGroups().map((headerGroup) => {
              return (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              );
            })
          }
        </thead>
        <tbody>
          {
            // Loop over the table rows
            tableInstance.getRowModel().rows.map((row) => {
              return (
                <tr
                  key={row.id}
                  onClick={(event) => onClickDataRow(event, row)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      onClickDataRow(event, row);
                    }
                  }}
                  tabIndex={0}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              );
            })
          }
        </tbody>
      </StyledTable>
      {emptyState}
      {loading && <Loading />}
    </TableWrapper>
  );
}

const TableWrapper = styled.div`
  position: relative;
  min-height: 300px;
  ${overflowAutoWithoutScrollbars}
`;

type StyledTableProps = {
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

const cellPaddingPx = 15;
const StyledTable = styled.table<StyledTableProps>`
  position: relative;
  border-spacing: 0;
  width: 100%;

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
              z-index: -1;
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
