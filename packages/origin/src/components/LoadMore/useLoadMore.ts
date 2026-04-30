"use client";

import * as React from "react";

export interface UseLoadMoreFetchResult<T, TCursor = string> {
  data: T[];
  /** Cursor for the next page. Omit when there is no next page. */
  nextCursor?: TCursor;
  /** Whether `loadMore` should be enabled after this page. */
  hasMore: boolean;
}

export interface UseLoadMoreOptions<T, TCursor = string> {
  /**
   * Fetches a page. Receives the cursor from the previous page, or `undefined`
   * for the initial fetch (and after `refetch`/`resetOn` change). Reject the
   * promise to surface an error in `result.error`.
   */
  fetchPage: (
    cursor: TCursor | undefined,
  ) => Promise<UseLoadMoreFetchResult<T, TCursor>>;
  /**
   * When any value changes (by `JSON.stringify` value), pagination resets and
   * an initial fetch is kicked off. Values must be JSON-serializable; for
   * object dependencies, pass a stable id. Defaults to `[]` (fetch once).
   */
  resetOn?: React.DependencyList;
  /** Skip the initial fetch when `false`. Defaults to `true`. */
  enabled?: boolean;
  /** Starting cursor for the first page. */
  initialCursor?: TCursor;
}

export interface UseLoadMoreResult<T, TCursor = string> {
  items: T[];
  /** True only during the initial fetch (and after refetch/reset). */
  loading: boolean;
  /** True only during subsequent (`loadMore`) fetches. */
  loadingMore: boolean;
  hasMore: boolean;
  error: Error | undefined;
  nextCursor: TCursor | undefined;
  /** No-op when `!hasMore`, `loading`, or `loadingMore`. */
  loadMore: () => void;
  /** Resets accumulated items and re-fetches the first page. */
  refetch: () => void;
}

/**
 * Transport-agnostic infinite-scroll pagination state. Pair with
 * `LoadMore.Sentinel` / `LoadMore.Trigger` to drive a forward-only paginated
 * list. Stale responses are dropped via an internal request id so concurrent
 * `refetch`/`resetOn` changes never clobber newer state.
 */
export function useLoadMore<T, TCursor = string>(
  options: UseLoadMoreOptions<T, TCursor>,
): UseLoadMoreResult<T, TCursor> {
  const { fetchPage, resetOn, enabled = true, initialCursor } = options;

  const [items, setItems] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState<boolean>(enabled);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>(undefined);
  const [nextCursor, setNextCursor] = React.useState<TCursor | undefined>(
    initialCursor,
  );
  const [hasMore, setHasMore] = React.useState(true);

  const fetchPageRef = React.useRef(fetchPage);
  fetchPageRef.current = fetchPage;

  const requestIdRef = React.useRef(0);

  const runFetch = React.useCallback(
    async (cursor: TCursor | undefined, isInitial: boolean) => {
      const reqId = ++requestIdRef.current;
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(undefined);
      try {
        const result = await fetchPageRef.current(cursor);
        if (reqId !== requestIdRef.current) return;
        setItems((prev) =>
          isInitial ? result.data : [...prev, ...result.data],
        );
        setHasMore(result.hasMore);
        setNextCursor(result.nextCursor);
      } catch (e) {
        if (reqId !== requestIdRef.current) return;
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (reqId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [],
  );

  const refetch = React.useCallback(() => {
    setItems([]);
    setNextCursor(initialCursor);
    setHasMore(true);
    void runFetch(initialCursor, true);
  }, [runFetch, initialCursor]);

  // JSON.stringify gives us value-equality semantics for the dep array,
  // matching the pattern in useGridApiPaginatedQuery.
  const resetKey = React.useMemo(
    () => JSON.stringify(resetOn ?? []),
    [resetOn],
  );

  React.useEffect(() => {
    if (!enabled) {
      requestIdRef.current++;
      setLoading(false);
      setLoadingMore(false);
      return;
    }
    setItems([]);
    setNextCursor(initialCursor);
    setHasMore(true);
    void runFetch(initialCursor, true);
    // initialCursor intentionally excluded: it's used only as a starting value
    // and changing it shouldn't on its own re-fetch (callers can pass it in
    // resetOn if they want that behavior).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, resetKey, runFetch]);

  const loadMore = React.useCallback(() => {
    if (!hasMore || loading || loadingMore) return;
    void runFetch(nextCursor, false);
  }, [hasMore, loading, loadingMore, nextCursor, runFetch]);

  return {
    items,
    loading,
    loadingMore,
    hasMore,
    error,
    nextCursor,
    loadMore,
    refetch,
  };
}
