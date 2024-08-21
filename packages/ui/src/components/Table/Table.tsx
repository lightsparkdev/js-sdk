import { css } from "@emotion/react";
import styled from "@emotion/styled";

import { isObject } from "lodash-es";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { Fragment, useCallback, useMemo } from "react";
import { useTable, type Row } from "react-table";
import { useClipboard } from "../../hooks/useClipboard.js";
import {
  Link,
  replaceParams,
  useNavigate,
  type RouteParams,
} from "../../router.js";
import { bp } from "../../styles/breakpoints.js";
import {
  standardBorderRadius,
  standardContentInset,
} from "../../styles/common.js";
import {
  ignoreSSRWarning,
  lineClamp,
  overflowAutoWithoutScrollbars,
} from "../../styles/utils.js";
import { type NewRoutesType } from "../../types/index.js";
import { ClipboardTextField } from "../ClipboardTextField.js";
import { Icon } from "../Icon/Icon.js";
import { type IconName } from "../Icon/types.js";
import { InfoIconTooltip } from "../InfoIconTooltip.js";
import { Loading } from "../Loading.js";

export type TableColumnHeaderInfo = string | { name: string; tooltip?: string };

export type TableCell = string | LinkCell | ClipboardCell | ReactNode;

type ObjectCell = {
  text: string;
  icon?: IconName | undefined;
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
  Header: TableColumnHeaderInfo;
  accessor: keyof T;
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
};

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading,
  onClickRow,
  emptyState,
  clipboardCallbacks,
}: TableProps<T>) {
  const navigate = useNavigate<NewRoutesType>();

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
        Header:
          typeof column.Header === "string" ? (
            column.Header
          ) : (
            <div>
              {column.Header.name}
              <InfoIconTooltip
                id={`tooltip-${column.Header.name}`}
                content={column.Header.tooltip || ""}
                verticalAlign={-2}
              />
            </div>
          ),
        accessor: column.accessor.toString(),
        Cell: ({ value }: { value: unknown }) => {
          let content = value as ReactNode;
          let icon = null;
          if (isObjectCell(value)) {
            icon = value.icon ? (
              <Icon name={value.icon} width={14} mr={4} color="c4Neutral" />
            ) : null;
            if (isMultilineCell(value)) {
              content = (
                <LineClampSpan>
                  {icon}
                  {value.text}
                </LineClampSpan>
              );
            } else {
              content = (
                <Fragment>
                  {icon}
                  {value.text}
                </Fragment>
              );
            }
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
                <Link<NewRoutesType>
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
                <Link<NewRoutesType>
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
              maxChars = 16;
            }
            return (
              <HoverableCellWrapper>
                {icon}
                <ClipboardTextField
                  value={value.text}
                  elide={
                    maxChars
                      ? {
                          maxChars,
                          ellipsisPosition: "middle",
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

  const tableInstance = useTable({ columns: mappedColumns, data });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

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
          link = replaceParams<NewRoutesType>(
            onClickRowResult.to!,
            onClickRowResult.params,
          );
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
      <StyledTable {...getTableProps()} clickable={Boolean(onClickRow)}>
        <thead>
          {
            // Loop over the header rows
            headerGroups.map((headerGroup) => (
              // Apply the header row props
              <tr {...headerGroup.getHeaderGroupProps()}>
                {
                  // Loop over the headers in each row
                  headerGroup.headers.map((column) => (
                    // Apply the header cell props
                    <th {...column.getHeaderProps()}>
                      {
                        // Render the header
                        column.render("Header")
                      }
                    </th>
                  ))
                }
              </tr>
            ))
          }
        </thead>
        {/* Apply the table body props */}
        <tbody {...getTableBodyProps()}>
          {
            // Loop over the table rows
            rows.map((row) => {
              // Prepare the row for display
              prepareRow(row);
              return (
                // Apply the row props
                <tr
                  {...row.getRowProps()}
                  onClick={(event) => onClickDataRow(event, row)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      onClickDataRow(event, row);
                    }
                  }}
                  tabIndex={0}
                >
                  {
                    // Loop over the rows cells
                    row.cells.map((cell) => {
                      // Apply the cell props
                      return (
                        <td {...cell.getCellProps()}>
                          {
                            // Render the cell contents
                            cell.render("Cell")
                          }
                        </td>
                      );
                    })
                  }
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
    border-bottom: 1px solid ${({ theme }) => theme.c1Neutral};
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

  tr {
    cursor: ${({ clickable }) => (clickable ? "pointer" : "default")};
    position: relative;

    &:hover td:first-child:before ${ignoreSSRWarning} {
      ${standardBorderRadius(16)}
      content: "";
      position: absolute;
      /* Position offsets inside trs do not properly follow relatively positioned
         parents in Safari (see bug https://bit.ly/49dViWy), use margin instead: */
      margin-top: 5px;
      left: -12px;
      width: calc(100% + 24px);
      height: 32px;
      border: 1px solid ${({ theme }) => theme.c1Neutral};
      pointer-events: none;
    }
  }

  td {
    max-width: 200px;
    text-overflow: ellipsis;
    overflow: hidden;
    padding: 0 ${cellPaddingPx}px;
    white-space: nowrap;
    & > * {
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
`;
