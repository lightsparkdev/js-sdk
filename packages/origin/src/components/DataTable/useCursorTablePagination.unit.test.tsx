import { render, renderHook } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it } from "vitest";
import { useCursorTablePagination } from "./useCursorTablePagination";

describe("useCursorTablePagination", () => {
  it("exposes provider-neutral request and navigation state", () => {
    const { result } = renderHook(() =>
      useCursorTablePagination({
        scopeKey: "accounts",
        pageSizeOptions: [10, 25],
      }),
    );

    expect(result.current.request).toEqual({ pageSize: 10, cursor: null });
    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSizeOptions).toEqual([10, 25]);
    expect(result.current.canGoPrevious).toBe(false);
  });

  it("returns the first-page request synchronously when scope changes", () => {
    const snapshots: ScopeSnapshot[] = [];
    const { rerender } = render(
      <ScopeHarness scopeKey="accounts" snapshots={snapshots} />,
    );

    act(() => snapshots.at(-1)?.controller.goNext("accounts-cursor-1"));
    expect(snapshots.at(-1)).toMatchObject({
      scopeKey: "accounts",
      request: { pageSize: 10, cursor: "accounts-cursor-1" },
      currentPage: 2,
    });

    rerender(<ScopeHarness scopeKey="customers" snapshots={snapshots} />);

    const customerSnapshots = snapshots.filter(
      (snapshot) => snapshot.scopeKey === "customers",
    );
    expect(customerSnapshots.length).toBeGreaterThan(0);
    expect(customerSnapshots[0]).toMatchObject({
      request: { pageSize: 10, cursor: null },
      currentPage: 1,
      canGoPrevious: false,
    });
    for (const snapshot of customerSnapshots) {
      expect(snapshot.request.cursor).toBeNull();
      expect(snapshot.currentPage).toBe(1);
    }
  });

  it("resets the cursor space when page size changes", () => {
    const { result } = renderHook(() =>
      useCursorTablePagination({
        scopeKey: "accounts",
        pageSizeOptions: [10, 25],
      }),
    );

    act(() => result.current.goNext("cursor-1"));
    act(() => result.current.setPageSize(25));

    expect(result.current.request).toEqual({ pageSize: 25, cursor: null });
    expect(result.current.currentPage).toBe(1);
    expect(result.current.canGoPrevious).toBe(false);
  });

  it("coalesces rapid next calls from the same page", () => {
    const { result } = renderHook(() =>
      useCursorTablePagination({
        scopeKey: "accounts",
        pageSizeOptions: [10],
      }),
    );

    act(() => {
      result.current.goNext("cursor-1");
      result.current.goNext("cursor-1");
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.request.cursor).toBe("cursor-1");
  });

  it("preserves backward and forward cursors", () => {
    const { result } = renderHook(() =>
      useCursorTablePagination({
        scopeKey: "accounts",
        pageSizeOptions: [10],
      }),
    );

    act(() => result.current.goNext("cursor-1"));
    act(() => result.current.goNext("cursor-2"));
    expect(result.current.request).toEqual({
      pageSize: 10,
      cursor: "cursor-2",
    });

    act(() => result.current.goPrevious());
    expect(result.current.request.cursor).toBe("cursor-1");

    act(() => result.current.goNext("cursor-2"));
    expect(result.current.request.cursor).toBe("cursor-2");
    expect(result.current.currentPage).toBe(3);
  });

  it("stops previous navigation at page one", () => {
    const { result } = renderHook(() =>
      useCursorTablePagination({
        scopeKey: "accounts",
        pageSizeOptions: [10],
      }),
    );

    act(() => result.current.goPrevious());

    expect(result.current.currentPage).toBe(1);
    expect(result.current.request.cursor).toBeNull();
  });

  it("reset starts a fresh first-page cursor space", () => {
    const { result } = renderHook(() =>
      useCursorTablePagination({
        scopeKey: "accounts",
        pageSizeOptions: [10],
      }),
    );

    act(() => result.current.goNext("cursor-1"));
    act(() => result.current.reset());

    expect(result.current.request).toEqual({ pageSize: 10, cursor: null });
    expect(result.current.currentPage).toBe(1);
  });
});

interface ScopeSnapshot {
  scopeKey: string;
  request: { pageSize: number; cursor: string | null };
  currentPage: number;
  canGoPrevious: boolean;
  controller: ReturnType<typeof useCursorTablePagination>;
}

function ScopeHarness({
  scopeKey,
  snapshots,
}: {
  scopeKey: string;
  snapshots: ScopeSnapshot[];
}) {
  const controller = useCursorTablePagination({
    scopeKey,
    pageSizeOptions: [10, 25],
  });
  snapshots.push({
    scopeKey,
    request: controller.request,
    currentPage: controller.currentPage,
    canGoPrevious: controller.canGoPrevious,
    controller,
  });
  return null;
}
