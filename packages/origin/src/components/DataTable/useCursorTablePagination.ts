"use client";

import * as React from "react";
import { devWarnOnce } from "../../lib/dev-warn";

export interface CursorTableRequest {
  readonly pageSize: number;
  readonly cursor: string | null;
}

export type CursorTableCount =
  | { readonly value: number; readonly accuracy: "exact" }
  | { readonly value: number; readonly accuracy: "lower-bound" };

export interface CursorTablePage {
  readonly endCursor: string | null;
  readonly hasNextPage: boolean;
  readonly rowCount: number;
  readonly count: CursorTableCount;
}

const cursorTableControllerState: unique symbol = Symbol(
  "cursorTableControllerState",
);

interface CursorTableControllerSnapshot {
  readonly cursorSpaceIdentity: object;
  readonly currentPage: number;
}

export interface CursorTableController {
  readonly [cursorTableControllerState]: CursorTableControllerSnapshot;
  readonly request: CursorTableRequest;
  readonly currentPage: number;
  readonly pageSizeOptions: readonly number[];
  readonly canGoPrevious: boolean;
  goPrevious: () => void;
  goNext: (cursor: string) => void;
  setPageSize: (pageSize: number) => void;
  reset: () => void;
}

export interface UseCursorTablePaginationOptions {
  /**
   * Stable identity for the current result scope (for example, an entity id
   * plus a normalized filter signature). Changing it starts a new cursor
   * space synchronously at page one.
   */
  readonly scopeKey: string;
  /**
   * Rows-per-page choices. The first option is the initial page size.
   * Origin owns no product-specific size policy.
   */
  readonly pageSizeOptions: readonly number[];
}

interface CursorSpace {
  readonly id: object;
  readonly scopeKey: string;
  readonly pageSize: number;
  readonly currentPage: number;
  readonly cursors: Readonly<Record<number, string | null>>;
}

function createCursorSpace(scopeKey: string, pageSize: number): CursorSpace {
  return {
    id: {},
    scopeKey,
    pageSize,
    currentPage: 1,
    cursors: { 1: null },
  };
}

function isValidCursor(cursor: string): boolean {
  return cursor.length > 0;
}

/**
 * Internal bridge used by DataTable.Root. The symbol-keyed state remains
 * opaque to consumers while standard object spread preserves it.
 */
export function getCursorTableControllerSnapshot(
  controller: CursorTableController,
): CursorTableControllerSnapshot {
  const snapshot = controller[cursorTableControllerState];
  if (!snapshot) {
    throw new Error(
      "DataTable cursor pagination requires an intact controller.",
    );
  }
  return snapshot;
}

/**
 * Provider-free cursor request controller. Consumers map `request.pageSize`
 * and `request.cursor` to their data provider and pass a normalized settled
 * page to DataTable.Root.
 */
export function useCursorTablePagination({
  pageSizeOptions,
  scopeKey,
}: UseCursorTablePaginationOptions): CursorTableController {
  if (pageSizeOptions.length === 0) {
    devWarnOnce(
      "[useCursorTablePagination] pageSizeOptions is empty. Pass at least " +
        "one page size; the controller falls back to 1.",
    );
  }
  const firstPageSize = pageSizeOptions[0] ?? 1;
  const [cursorSpace, setCursorSpace] = React.useState<CursorSpace>(() =>
    createCursorSpace(scopeKey, firstPageSize),
  );

  const scopeChanged = cursorSpace.scopeKey !== scopeKey;
  const effectiveCursorSpace = scopeChanged
    ? createCursorSpace(scopeKey, cursorSpace.pageSize)
    : cursorSpace;

  // Render-phase adjustment prevents one query render from pairing a new
  // scope with the previous scope's page or cursor.
  if (scopeChanged) {
    setCursorSpace(effectiveCursorSpace);
  }

  const goPrevious = React.useCallback(() => {
    setCursorSpace((previous) => {
      if (
        previous.id !== effectiveCursorSpace.id ||
        previous.currentPage <= 1
      ) {
        return previous;
      }
      return {
        ...previous,
        currentPage: previous.currentPage - 1,
      };
    });
  }, [effectiveCursorSpace.id]);

  const goNext = React.useCallback(
    (cursor: string) => {
      if (!isValidCursor(cursor)) {
        return;
      }
      setCursorSpace((previous) => {
        if (
          previous.id !== effectiveCursorSpace.id ||
          previous.currentPage !== effectiveCursorSpace.currentPage
        ) {
          return previous;
        }
        const nextPage = previous.currentPage + 1;
        return {
          ...previous,
          currentPage: nextPage,
          cursors: {
            ...previous.cursors,
            [nextPage]: cursor,
          },
        };
      });
    },
    [effectiveCursorSpace.currentPage, effectiveCursorSpace.id],
  );

  const setPageSize = React.useCallback((pageSize: number) => {
    setCursorSpace((previous) =>
      createCursorSpace(previous.scopeKey, pageSize),
    );
  }, []);

  const reset = React.useCallback(() => {
    setCursorSpace((previous) =>
      createCursorSpace(previous.scopeKey, previous.pageSize),
    );
  }, []);

  const request = React.useMemo<CursorTableRequest>(
    () => ({
      pageSize: effectiveCursorSpace.pageSize,
      cursor:
        effectiveCursorSpace.cursors[effectiveCursorSpace.currentPage] ?? null,
    }),
    [effectiveCursorSpace],
  );

  const controller = React.useMemo<CursorTableController>(
    () => ({
      [cursorTableControllerState]: {
        cursorSpaceIdentity: effectiveCursorSpace.id,
        currentPage: effectiveCursorSpace.currentPage,
      },
      request,
      currentPage: effectiveCursorSpace.currentPage,
      pageSizeOptions,
      canGoPrevious: effectiveCursorSpace.currentPage > 1,
      goPrevious,
      goNext,
      setPageSize,
      reset,
    }),
    [
      effectiveCursorSpace.currentPage,
      effectiveCursorSpace.id,
      goNext,
      goPrevious,
      pageSizeOptions,
      request,
      reset,
      setPageSize,
    ],
  );

  return controller;
}
