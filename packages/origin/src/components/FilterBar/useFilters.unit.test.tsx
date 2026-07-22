import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  getDefaultFilterStates,
  type FilterDescriptor,
  type FilterStates,
} from "./filter-model";
import { useFilters } from "./useFilters";

type TestFilterKey = "status" | "reason" | "createdAt";

const DESCRIPTORS = [
  {
    type: "enum",
    label: "Status",
    id: "status",
    isMulti: true,
    conflictsWith: ["reason"],
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "Closed", value: "CLOSED" },
    ],
  },
  { type: "string", label: "Reason", id: "reason" },
  { type: "date", label: "Created", id: "createdAt" },
] as const satisfies readonly FilterDescriptor<TestFilterKey>[];

function getDescriptor<TId extends TestFilterKey>(
  id: TId,
): Extract<(typeof DESCRIPTORS)[number], { id: TId }> {
  const descriptor = DESCRIPTORS.find((candidate) => candidate.id === id);
  if (!descriptor) {
    throw new Error(`No descriptor for ${id}`);
  }
  return descriptor as Extract<(typeof DESCRIPTORS)[number], { id: TId }>;
}

describe("useFilters (uncontrolled)", () => {
  it("starts at defaults with nothing applied", () => {
    const { result } = renderHook(() =>
      useFilters({ descriptors: DESCRIPTORS }),
    );

    expect(result.current.appliedCount).toBe(0);
    expect(result.current.signature).toBe("");
    expect(result.current.openEditorId).toBeNull();
  });

  it("addFilter applies empty and optionally opens the editor", () => {
    const { result } = renderHook(() =>
      useFilters({ descriptors: DESCRIPTORS }),
    );

    act(() => {
      result.current.addFilter(getDescriptor("reason"), { openEditor: true });
    });

    expect(result.current.states.reason.isApplied).toBe(true);
    expect(result.current.appliedCount).toBe(1);
    expect(result.current.signature).toBe("reason=");
    expect(result.current.openEditorId).toBe("reason");
  });

  it("reopens applied non-enum filters without replacing committed values", () => {
    const { result } = renderHook(() =>
      useFilters({ descriptors: DESCRIPTORS }),
    );
    const start = new Date("2026-06-01T09:30:00.000Z");
    const end = new Date("2026-06-10T17:00:00.000Z");

    act(() => {
      result.current.updateFilter("reason", {
        type: "string",
        isApplied: true,
        value: "timeout",
      });
    });
    act(() => {
      result.current.updateFilter("createdAt", {
        type: "date",
        isApplied: true,
        start,
        end,
      });
    });

    const committedStates = result.current.states;
    for (const id of ["reason", "createdAt"] as const) {
      act(() => {
        result.current.addFilter(getDescriptor(id), { openEditor: true });
      });
      expect(result.current.states).toBe(committedStates);
      expect(result.current.openEditorId).toBe(id);
    }

    expect(result.current.states.reason).toEqual({
      type: "string",
      isApplied: true,
      value: "timeout",
    });
    expect(result.current.states.createdAt).toEqual({
      type: "date",
      isApplied: true,
      start,
      end,
    });
  });

  it("addFilter with enumValue applies the option through the shared transition", () => {
    const { result } = renderHook(() =>
      useFilters({ descriptors: DESCRIPTORS }),
    );

    act(() => {
      result.current.addFilter(getDescriptor("status"), {
        enumValue: { label: "Active", value: "ACTIVE" },
      });
    });
    expect(result.current.signature).toBe("status=ACTIVE");

    // Multi-select: the same option toggles back off (applied-but-empty).
    act(() => {
      result.current.addFilter(getDescriptor("status"), {
        enumValue: { label: "Active", value: "ACTIVE" },
      });
    });
    expect(result.current.states.status.isApplied).toBe(true);
    expect(result.current.signature).toBe("status=");
  });

  it("enforces descriptor-declared conflicts on apply", () => {
    const { result } = renderHook(() =>
      useFilters({ descriptors: DESCRIPTORS }),
    );

    act(() => {
      result.current.updateFilter("reason", {
        type: "string",
        isApplied: true,
        value: "timeout",
      });
    });
    expect(result.current.states.reason.isApplied).toBe(true);

    act(() => {
      result.current.addFilter(getDescriptor("status"), {
        enumValue: { label: "Active", value: "ACTIVE" },
      });
    });

    expect(result.current.states.status.isApplied).toBe(true);
    expect(result.current.states.reason.isApplied).toBe(false);
  });

  it("removeFilter resets to default and closes that filter's editor", () => {
    const { result } = renderHook(() =>
      useFilters({ descriptors: DESCRIPTORS }),
    );

    act(() => {
      result.current.addFilter(getDescriptor("reason"), { openEditor: true });
    });
    act(() => {
      result.current.removeFilter("reason");
    });

    expect(result.current.states.reason.isApplied).toBe(false);
    expect(result.current.openEditorId).toBeNull();
  });

  it("clearFilters resets everything and closes editors", () => {
    const { result } = renderHook(() =>
      useFilters({ descriptors: DESCRIPTORS }),
    );

    act(() => {
      result.current.addFilter(getDescriptor("status"), {
        enumValue: { label: "Active", value: "ACTIVE" },
      });
    });
    act(() => {
      result.current.addFilter(getDescriptor("reason"), {
        openEditor: true,
      });
    });
    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.appliedCount).toBe(0);
    expect(result.current.signature).toBe("");
    expect(result.current.openEditorId).toBeNull();
  });

  it("setEditorOpen keeps at most one editor open", () => {
    const { result } = renderHook(() =>
      useFilters({ descriptors: DESCRIPTORS }),
    );

    act(() => {
      result.current.setEditorOpen("reason", true);
    });
    expect(result.current.openEditorId).toBe("reason");

    act(() => {
      result.current.setEditorOpen("createdAt", true);
    });
    expect(result.current.openEditorId).toBe("createdAt");

    // Closing a non-open editor is a no-op.
    act(() => {
      result.current.setEditorOpen("reason", false);
    });
    expect(result.current.openEditorId).toBe("createdAt");

    act(() => {
      result.current.setEditorOpen("createdAt", false);
    });
    expect(result.current.openEditorId).toBeNull();
  });
});

describe("useFilters (controlled)", () => {
  it("reports transitions through onStatesChange without owning state", () => {
    const onStatesChange = vi.fn();
    const states = getDefaultFilterStates(DESCRIPTORS);
    const { result } = renderHook(() =>
      useFilters({ descriptors: DESCRIPTORS, states, onStatesChange }),
    );

    act(() => {
      result.current.addFilter(getDescriptor("status"), {
        enumValue: { label: "Active", value: "ACTIVE" },
      });
    });

    // The hook did not apply the transition itself...
    expect(result.current.states.status.isApplied).toBe(false);
    // ...it reported the next states to the owner.
    expect(onStatesChange).toHaveBeenCalledTimes(1);
    const nextStates = onStatesChange.mock.calls[0]![0] as FilterStates<
      typeof DESCRIPTORS
    >;
    expect(nextStates.status).toEqual({
      type: "enum",
      isApplied: true,
      appliedValues: ["ACTIVE"],
    });
  });

  it("reflects owner-driven states updates", () => {
    const initial = getDefaultFilterStates(DESCRIPTORS);
    const applied: FilterStates<typeof DESCRIPTORS> = {
      ...initial,
      reason: { type: "string", isApplied: true, value: "timeout" },
    };

    const { result, rerender } = renderHook(
      ({ states }: { states: FilterStates<typeof DESCRIPTORS> }) =>
        useFilters({
          descriptors: DESCRIPTORS,
          states,
          onStatesChange: () => {},
        }),
      { initialProps: { states: initial } },
    );
    expect(result.current.appliedCount).toBe(0);

    rerender({ states: applied });
    expect(result.current.appliedCount).toBe(1);
    expect(result.current.signature).toBe("reason=timeout");
  });
});
