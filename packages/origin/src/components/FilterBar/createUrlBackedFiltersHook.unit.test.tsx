import * as React from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { FilterDescriptor } from "./filter-model";
import {
  createUrlBackedFiltersHook,
  type FilterActionRegistry,
  type SearchParamHistoryMode,
} from "./createUrlBackedFiltersHook";

const DESCRIPTORS = [
  {
    id: "status",
    label: "Status",
    type: "enum",
    options: [
      { label: "Open", value: "OPEN" },
      { label: "Closed", value: "CLOSED" },
    ],
    conflictsWith: ["reason"],
  },
  {
    id: "reason",
    label: "Reason",
    type: "string",
    conflictsWith: ["status"],
  },
] as const satisfies readonly FilterDescriptor<string>[];

const MULTI_DESCRIPTORS = [
  {
    id: "status",
    label: "Status",
    type: "enum",
    isMulti: true,
    options: [
      { label: "Open", value: "OPEN" },
      { label: "Company", value: "ACME, Inc." },
    ],
  },
] as const satisfies readonly FilterDescriptor<string>[];

let currentSearch = "";
let updateCalls: { search: string; history: SearchParamHistoryMode }[] = [];
let registry: ReturnType<typeof createRegistry>;

function useTestSearchParams() {
  return {
    search: currentSearch,
    updateSearchParams(
      update: (current: URLSearchParams) => URLSearchParams,
      options: { history: SearchParamHistoryMode },
    ) {
      const search = update(new URLSearchParams(currentSearch)).toString();
      updateCalls.push({ search, history: options.history });
      currentSearch = search;
    },
  };
}

const filterActionRegistry = {
  acquire(actions) {
    return registry.acquire(actions);
  },
} satisfies FilterActionRegistry;

const useTestFilters = createUrlBackedFiltersHook({
  useSearchParamsAdapter: useTestSearchParams,
  filterActionRegistry,
  history: "push",
});

function createRegistry() {
  const update = vi.fn();
  const release = vi.fn();
  const acquire = vi.fn(() => ({ update, release }));
  return { acquire, update, release };
}

describe("createUrlBackedFiltersHook", () => {
  it("decodes initial and applied-empty URL states", () => {
    registry = createRegistry();
    currentSearch = "status=";
    const { result } = renderHook(() =>
      useTestFilters({
        descriptors: DESCRIPTORS,
        registerFilterActions: false,
      }),
    );

    expect(result.current.states.status).toEqual({
      type: "enum",
      isApplied: true,
      appliedValues: [],
    });
    expect(result.current.states.reason).toEqual({
      type: "string",
      isApplied: false,
      value: null,
    });
  });

  it("writes filter transitions with configured push history and preserves foreign parameters", () => {
    registry = createRegistry();
    currentSearch = "tab=activity";
    updateCalls = [];
    const { result } = renderHook(() =>
      useTestFilters({
        descriptors: DESCRIPTORS,
        registerFilterActions: false,
      }),
    );

    act(() => {
      result.current.addFilter(DESCRIPTORS[0], {
        enumValue: DESCRIPTORS[0].options[0],
      });
    });

    expect(updateCalls).toEqual([
      { search: "tab=activity&status=OPEN", history: "push" },
    ]);
  });

  it("writes filter transitions with configured replace history", () => {
    registry = createRegistry();
    currentSearch = "";
    updateCalls = [];
    const useReplaceFilters = createUrlBackedFiltersHook({
      useSearchParamsAdapter: useTestSearchParams,
      filterActionRegistry,
      history: "replace",
    });
    const { result } = renderHook(() =>
      useReplaceFilters({
        descriptors: DESCRIPTORS,
        registerFilterActions: false,
      }),
    );

    act(() => {
      result.current.addFilter(DESCRIPTORS[0], {
        enumValue: DESCRIPTORS[0].options[0],
      });
    });

    expect(updateCalls).toEqual([
      { search: "status=OPEN", history: "replace" },
    ]);
  });

  it("clones latest committed parameters and preserves unrelated keys", () => {
    const committed = new URLSearchParams("tab=activity&drawer=invoice");
    let latestCommitted = committed;
    const useDirectSearchParams = () => ({
      search: latestCommitted.toString(),
      updateSearchParams(
        update: (current: URLSearchParams) => URLSearchParams,
        options: { history: SearchParamHistoryMode },
      ) {
        latestCommitted = update(latestCommitted);
        updateCalls.push({
          search: latestCommitted.toString(),
          history: options.history,
        });
      },
    });
    registry = createRegistry();
    updateCalls = [];
    const useDirectFilters = createUrlBackedFiltersHook({
      useSearchParamsAdapter: useDirectSearchParams,
      filterActionRegistry,
      history: "push",
    });
    const { result } = renderHook(() =>
      useDirectFilters({
        descriptors: DESCRIPTORS,
        registerFilterActions: false,
      }),
    );

    act(() => {
      result.current.addFilter(DESCRIPTORS[0], {
        enumValue: DESCRIPTORS[0].options[0],
      });
    });

    expect(updateCalls).toEqual([
      { search: "tab=activity&drawer=invoice&status=OPEN", history: "push" },
    ]);
    expect(committed.toString()).toBe("tab=activity&drawer=invoice");
  });

  it("decodes Back and Forward synchronously without a mirror write", () => {
    registry = createRegistry();
    currentSearch = "";
    updateCalls = [];
    const { result, rerender } = renderHook(() =>
      useTestFilters({
        descriptors: DESCRIPTORS,
        registerFilterActions: false,
      }),
    );

    currentSearch = "status=CLOSED";
    rerender();

    expect(result.current.states.status.appliedValues).toEqual(["CLOSED"]);
    expect(result.current.signature).toBe("status=CLOSED");
    expect(updateCalls).toEqual([]);
  });

  it("hydrates repeated enum values on Back and Forward without loss", () => {
    registry = createRegistry();
    currentSearch = "status=OPEN&status=ACME%2C+Inc.";
    updateCalls = [];
    const { result, rerender } = renderHook(() =>
      useTestFilters({
        descriptors: MULTI_DESCRIPTORS,
        registerFilterActions: false,
      }),
    );

    expect(result.current.states.status.appliedValues).toEqual([
      "OPEN",
      "ACME, Inc.",
    ]);

    currentSearch = "status=ACME%2C+Inc.";
    rerender();

    expect(result.current.states.status.appliedValues).toEqual(["ACME, Inc."]);
    expect(updateCalls).toEqual([]);
  });

  it("resolves conflicting Back and Forward URLs synchronously without writing", () => {
    registry = createRegistry();
    currentSearch = "status=OPEN";
    updateCalls = [];
    const { result, rerender } = renderHook(() =>
      useTestFilters({
        descriptors: DESCRIPTORS,
        registerFilterActions: false,
      }),
    );

    currentSearch = "reason=TIMEOUT&status=CLOSED";
    rerender();

    expect(result.current.states.status.isApplied).toBe(false);
    expect(result.current.states.reason).toEqual({
      type: "string",
      isApplied: true,
      value: "TIMEOUT",
    });
    expect(result.current.signature).toBe("reason=TIMEOUT");
    expect(updateCalls).toEqual([]);
  });

  it("preserves operation callback identities across unrelated rerenders", () => {
    registry = createRegistry();
    currentSearch = "status=OPEN";
    const { result, rerender } = renderHook(
      ({ unrelated }: { unrelated: number }) => {
        void unrelated;
        return useTestFilters({
          descriptors: DESCRIPTORS,
          registerFilterActions: false,
        });
      },
      { initialProps: { unrelated: 0 } },
    );
    const callbacks = {
      addFilter: result.current.addFilter,
      updateFilter: result.current.updateFilter,
      removeFilter: result.current.removeFilter,
      clearFilters: result.current.clearFilters,
    };

    rerender({ unrelated: 1 });

    expect(result.current.addFilter).toBe(callbacks.addFilter);
    expect(result.current.updateFilter).toBe(callbacks.updateFilter);
    expect(result.current.removeFilter).toBe(callbacks.removeFilter);
    expect(result.current.clearFilters).toBe(callbacks.clearFilters);
  });

  it("does not acquire when registration is disabled", () => {
    const testRegistry = createRegistry();
    const directRegistry = { acquire: testRegistry.acquire };
    const useFilters = createUrlBackedFiltersHook({
      useSearchParamsAdapter: useTestSearchParams,
      filterActionRegistry: directRegistry,
      history: "push",
    });
    renderHook(() =>
      useFilters({ descriptors: DESCRIPTORS, registerFilterActions: false }),
    );

    expect(testRegistry.acquire).not.toHaveBeenCalled();
  });

  it("acquires enum actions without a parent onSelect", () => {
    const testRegistry = createRegistry();
    registry = testRegistry;
    currentSearch = "";
    renderHook(() => useTestFilters({ descriptors: DESCRIPTORS }));

    const actions = testRegistry.acquire.mock.calls[0]![0];
    expect(actions[0]).toEqual({
      id: "status",
      label: "Status",
      options: [
        { label: "Open", onSelect: expect.any(Function) },
        { label: "Closed", onSelect: expect.any(Function) },
      ],
    });
    expect(actions[0]).not.toHaveProperty("onSelect");
  });

  it("releases only the lease acquired by that StrictMode effect", () => {
    const leases: ReturnType<typeof createRegistry>[] = [];
    const acquire = vi.fn(() => {
      const lease = createRegistry();
      leases.push(lease);
      return lease;
    });
    const useStrictFilters = createUrlBackedFiltersHook({
      useSearchParamsAdapter: useTestSearchParams,
      filterActionRegistry: { acquire },
      history: "push",
    });
    currentSearch = "";
    const rendered = renderHook(
      () => useStrictFilters({ descriptors: DESCRIPTORS }),
      { wrapper: React.StrictMode },
    );

    expect(acquire).toHaveBeenCalledTimes(2);
    expect(leases).toHaveLength(2);
    expect(leases[0]!.release).toHaveBeenCalledTimes(1);
    expect(leases[1]!.release).not.toHaveBeenCalled();

    rendered.unmount();

    expect(leases[1]!.release).toHaveBeenCalledTimes(1);
  });

  it("acquires once and updates the existing lease when action semantics change", () => {
    const testRegistry = createRegistry();
    currentSearch = "";
    const useFilters = createUrlBackedFiltersHook({
      useSearchParamsAdapter: useTestSearchParams,
      filterActionRegistry: { acquire: testRegistry.acquire },
      history: "push",
    });
    const renamed = [
      { ...DESCRIPTORS[0], label: "Payment status" },
      DESCRIPTORS[1],
    ] as const;
    const { rerender } = renderHook(
      ({ descriptors }) => useFilters({ descriptors }),
      { initialProps: { descriptors: DESCRIPTORS } },
    );

    rerender({ descriptors: renamed });

    expect(testRegistry.acquire).toHaveBeenCalledTimes(1);
    expect(testRegistry.update).toHaveBeenCalledTimes(1);
    expect(testRegistry.update.mock.calls[0]![0][0].label).toBe(
      "Payment status",
    );
  });

  it("updates active enum action callbacks when isMulti changes", () => {
    currentSearch = "status=OPEN";
    updateCalls = [];
    let publishedActions: Parameters<FilterActionRegistry["acquire"]>[0] = [];
    const activeRegistry: FilterActionRegistry = {
      acquire(actions) {
        publishedActions = actions;
        return {
          update(actions) {
            publishedActions = actions;
          },
          release() {},
        };
      },
    };
    const useFilters = createUrlBackedFiltersHook({
      useSearchParamsAdapter: useTestSearchParams,
      filterActionRegistry: activeRegistry,
      history: "push",
    });
    const singleSelect = [DESCRIPTORS[0]] as const;
    const multiSelect = [{ ...DESCRIPTORS[0], isMulti: true }] as const;
    const { rerender } = renderHook(
      ({ descriptors }) => useFilters({ descriptors }),
      { initialProps: { descriptors: singleSelect } },
    );

    rerender({ descriptors: multiSelect });
    act(() => {
      publishedActions[0]!.options![1]!.onSelect();
    });

    expect(updateCalls).toEqual([
      { search: "status=OPEN&status=CLOSED", history: "push" },
    ]);
  });

  it("uses latest URL and model state from the active action snapshot", () => {
    const testRegistry = createRegistry();
    currentSearch = "reason=TIMEOUT";
    updateCalls = [];
    const useFilters = createUrlBackedFiltersHook({
      useSearchParamsAdapter: useTestSearchParams,
      filterActionRegistry: { acquire: testRegistry.acquire },
      history: "push",
    });
    const { rerender } = renderHook(() =>
      useFilters({ descriptors: DESCRIPTORS }),
    );
    const activeActions = testRegistry.acquire.mock.calls[0]![0];

    currentSearch = "reason=TIMEOUT&drawer=invoice";
    rerender();
    act(() => {
      activeActions[0]!.options[0]!.onSelect();
    });

    expect(updateCalls).toEqual([
      {
        search: "drawer=invoice&status=OPEN",
        history: "push",
      },
    ]);
  });

  it("serializes registration-action enum callbacks as repeated values", () => {
    const testRegistry = createRegistry();
    registry = testRegistry;
    currentSearch = "status=OPEN";
    updateCalls = [];
    renderHook(() => useTestFilters({ descriptors: MULTI_DESCRIPTORS }));
    const actions = testRegistry.acquire.mock.calls[0]![0];

    act(() => {
      actions[0]!.options![1]!.onSelect();
    });

    expect(updateCalls).toEqual([
      {
        search: "status=OPEN&status=ACME%2C+Inc.",
        history: "push",
      },
    ]);
  });
});
