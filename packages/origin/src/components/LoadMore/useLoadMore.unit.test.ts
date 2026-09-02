import { describe, it, expect, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useLoadMore, type UseLoadMoreFetchResult } from "./useLoadMore";

type Item = { id: string };

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("useLoadMore", () => {
  it("fetches the first page on mount and exposes its items", async () => {
    const fetchPage = vi.fn(
      async (
        cursor: string | undefined,
      ): Promise<UseLoadMoreFetchResult<Item>> => ({
        data: [{ id: cursor ?? "a" }],
        nextCursor: "b",
        hasMore: true,
      }),
    );

    const { result } = renderHook(() => useLoadMore<Item>({ fetchPage }));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(fetchPage).toHaveBeenLastCalledWith(undefined);
    expect(result.current.items).toEqual([{ id: "a" }]);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.nextCursor).toBe("b");
    expect(result.current.error).toBeUndefined();
  });

  it("does not fetch when enabled is false; toggling true triggers a fetch", async () => {
    const fetchPage = vi.fn(
      async (): Promise<UseLoadMoreFetchResult<Item>> => ({
        data: [{ id: "x" }],
        hasMore: false,
      }),
    );

    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useLoadMore<Item>({ fetchPage, enabled }),
      { initialProps: { enabled: false } },
    );

    expect(result.current.loading).toBe(false);
    expect(fetchPage).not.toHaveBeenCalled();

    rerender({ enabled: true });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(result.current.items).toEqual([{ id: "x" }]);
  });

  it("accumulates items across loadMore calls and forwards the cursor", async () => {
    const pages: Record<string, UseLoadMoreFetchResult<Item>> = {
      first: { data: [{ id: "1" }], nextCursor: "p2", hasMore: true },
      p2: { data: [{ id: "2" }], nextCursor: "p3", hasMore: true },
      p3: { data: [{ id: "3" }], hasMore: false },
    };
    const fetchPage = vi.fn(async (cursor: string | undefined) => {
      return pages[cursor ?? "first"];
    });

    const { result } = renderHook(() => useLoadMore<Item>({ fetchPage }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([{ id: "1" }]);

    act(() => {
      result.current.loadMore();
    });
    await waitFor(() => expect(result.current.loadingMore).toBe(false));
    expect(result.current.items).toEqual([{ id: "1" }, { id: "2" }]);
    expect(fetchPage).toHaveBeenLastCalledWith("p2");

    act(() => {
      result.current.loadMore();
    });
    await waitFor(() => expect(result.current.loadingMore).toBe(false));
    expect(result.current.items).toEqual([
      { id: "1" },
      { id: "2" },
      { id: "3" },
    ]);
    expect(result.current.hasMore).toBe(false);
  });

  it("treats loadMore as a no-op when hasMore is false", async () => {
    const fetchPage = vi.fn(
      async (): Promise<UseLoadMoreFetchResult<Item>> => ({
        data: [{ id: "only" }],
        hasMore: false,
      }),
    );

    const { result } = renderHook(() => useLoadMore<Item>({ fetchPage }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.loadMore();
    });

    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it("treats a second loadMore as a no-op while one is in flight", async () => {
    const initial = deferred<UseLoadMoreFetchResult<Item>>();
    const next = deferred<UseLoadMoreFetchResult<Item>>();
    let call = 0;
    const fetchPage = vi.fn(async () => {
      call += 1;
      return call === 1 ? initial.promise : next.promise;
    });

    const { result } = renderHook(() => useLoadMore<Item>({ fetchPage }));
    initial.resolve({ data: [{ id: "1" }], nextCursor: "n", hasMore: true });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.loadMore();
    });
    expect(result.current.loadingMore).toBe(true);

    act(() => {
      result.current.loadMore();
    });
    expect(fetchPage).toHaveBeenCalledTimes(2);

    await act(async () => {
      next.resolve({ data: [{ id: "2" }], hasMore: false });
      await next.promise;
    });
    await waitFor(() => expect(result.current.loadingMore).toBe(false));
    expect(result.current.items).toEqual([{ id: "1" }, { id: "2" }]);
  });

  it("drops stale responses when refetch races a slow first page", async () => {
    const slow = deferred<UseLoadMoreFetchResult<Item>>();
    const fresh = deferred<UseLoadMoreFetchResult<Item>>();
    let call = 0;
    const fetchPage = vi.fn(async () => {
      call += 1;
      return call === 1 ? slow.promise : fresh.promise;
    });

    const { result } = renderHook(() => useLoadMore<Item>({ fetchPage }));

    act(() => {
      result.current.refetch();
    });

    await act(async () => {
      fresh.resolve({ data: [{ id: "fresh" }], hasMore: false });
      await fresh.promise;
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([{ id: "fresh" }]);

    await act(async () => {
      slow.resolve({ data: [{ id: "stale" }], hasMore: true });
      await slow.promise;
    });

    expect(result.current.items).toEqual([{ id: "fresh" }]);
    expect(result.current.hasMore).toBe(false);
  });

  it("resets accumulated state when resetOn changes", async () => {
    const fetchPage = vi.fn(
      async (
        cursor: string | undefined,
      ): Promise<UseLoadMoreFetchResult<Item>> => ({
        data: [{ id: cursor ?? "first" }],
        hasMore: false,
      }),
    );

    const { result, rerender } = renderHook(
      ({ filter }: { filter: string }) =>
        useLoadMore<Item>({ fetchPage, resetOn: [filter] }),
      { initialProps: { filter: "a" } },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([{ id: "first" }]);
    expect(fetchPage).toHaveBeenCalledTimes(1);

    rerender({ filter: "b" });

    await waitFor(() => expect(fetchPage).toHaveBeenCalledTimes(2));
    expect(fetchPage).toHaveBeenLastCalledWith(undefined);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([{ id: "first" }]);
  });

  it("refetch clears items and re-fetches the first page", async () => {
    let call = 0;
    const fetchPage = vi.fn(
      async (
        cursor: string | undefined,
      ): Promise<UseLoadMoreFetchResult<Item>> => {
        call += 1;
        if (cursor === undefined) {
          return { data: [{ id: `init-${call}` }], hasMore: false };
        }
        return { data: [], hasMore: false };
      },
    );

    const { result } = renderHook(() => useLoadMore<Item>({ fetchPage }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([{ id: "init-1" }]);

    act(() => {
      result.current.refetch();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([{ id: "init-2" }]);
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it("surfaces fetch errors and preserves prior items", async () => {
    let call = 0;
    const fetchPage = vi.fn(
      async (
        cursor: string | undefined,
      ): Promise<UseLoadMoreFetchResult<Item>> => {
        call += 1;
        if (call === 1) {
          return { data: [{ id: "1" }], nextCursor: "n", hasMore: true };
        }
        throw new Error("boom");
      },
    );

    const { result } = renderHook(() => useLoadMore<Item>({ fetchPage }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([{ id: "1" }]);

    act(() => {
      result.current.loadMore();
    });
    await waitFor(() => expect(result.current.loadingMore).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("boom");
    expect(result.current.items).toEqual([{ id: "1" }]);
  });

  it("clears the error on the next fetch", async () => {
    let call = 0;
    const fetchPage = vi.fn(async (): Promise<UseLoadMoreFetchResult<Item>> => {
      call += 1;
      if (call === 1) throw new Error("first");
      return { data: [{ id: "after-retry" }], hasMore: false };
    });

    const { result } = renderHook(() => useLoadMore<Item>({ fetchPage }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error?.message).toBe("first");

    act(() => {
      result.current.refetch();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeUndefined();
    expect(result.current.items).toEqual([{ id: "after-retry" }]);
  });
});
