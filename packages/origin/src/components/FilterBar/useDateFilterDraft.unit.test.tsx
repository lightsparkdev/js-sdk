import { act, renderHook } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { DateRangeDraft } from "../DatePicker";
import type { DateFilterState } from "./filter-model";
import { useDateFilterDraft } from "./useDateFilterDraft";

interface NormalizerContext {
  previousRange: DateRangeDraft;
  now: Date;
}

function createState(): DateFilterState {
  return {
    type: "date",
    isApplied: true,
    start: new Date("2026-08-10T09:00:00.000Z"),
    end: new Date("2026-08-11T17:00:00.000Z"),
    presetId: null,
  };
}

function createDescriptor(
  normalizeCustomRangeDraft: (
    range: DateRangeDraft,
    context: NormalizerContext,
  ) => DateRangeDraft,
) {
  return {
    type: "date",
    id: "createdAt",
    label: "Created",
    datePicker: {
      mode: "range",
      granularity: "date-time",
      normalizeCustomRangeDraft,
    },
  } as const;
}

afterEach(() => {
  vi.useRealTimers();
});

describe("useDateFilterDraft Custom range normalization", () => {
  it("uses the distinct normalized result as the next previous range", () => {
    const firstNormalizedRange = {
      start: new Date("2026-08-12T08:00:00.000Z"),
      end: new Date("2026-08-13T18:00:00.000Z"),
    };
    let callCount = 0;
    const normalizeCustomRangeDraft = vi.fn(
      (range: DateRangeDraft, _context: NormalizerContext) => {
        callCount += 1;
        return callCount === 1 ? firstNormalizedRange : range;
      },
    );
    const descriptor = createDescriptor(normalizeCustomRangeDraft);
    const state = createState();
    const { result } = renderHook(() => useDateFilterDraft(descriptor, state));
    const firstInputRange = {
      start: new Date("2026-08-12T09:00:00.000Z"),
      end: new Date("2026-08-13T17:00:00.000Z"),
    };
    const secondInputRange = {
      start: new Date("2026-08-14T09:00:00.000Z"),
      end: new Date("2026-08-15T17:00:00.000Z"),
    };

    act(() => {
      result.current.editRange(firstInputRange);
    });
    act(() => {
      result.current.editRange(secondInputRange);
    });

    expect(normalizeCustomRangeDraft).toHaveBeenCalledTimes(2);
    const secondContext = normalizeCustomRangeDraft.mock.calls[1]?.[1];
    expect(secondContext?.previousRange).toEqual(firstNormalizedRange);
    expect(secondContext?.previousRange).not.toEqual(firstInputRange);
    expect(result.current.draft).toMatchObject(secondInputRange);
  });

  it("isolates reducer inputs when StrictMode replays a mutating normalizer", () => {
    vi.useFakeTimers();
    const actionTime = new Date("2026-08-19T20:15:30.000Z");
    vi.setSystemTime(actionTime);
    const state = createState();
    const inputRange = {
      start: new Date("2026-08-20T09:00:00.000Z"),
      end: new Date("2026-08-21T17:00:00.000Z"),
    };
    const normalizedRange = {
      start: new Date("2026-08-20T08:00:00.000Z"),
      end: new Date("2026-08-21T18:00:00.000Z"),
    };
    const observedInputs: number[][] = [];
    const normalizeCustomRangeDraft = vi.fn(
      (
        nextRange: DateRangeDraft,
        { previousRange, now }: NormalizerContext,
      ) => {
        observedInputs.push([
          nextRange.start?.getTime() ?? 0,
          nextRange.end?.getTime() ?? 0,
          previousRange.start?.getTime() ?? 0,
          previousRange.end?.getTime() ?? 0,
          now.getTime(),
        ]);
        nextRange.start?.setTime(0);
        nextRange.end?.setTime(0);
        previousRange.start?.setTime(0);
        previousRange.end?.setTime(0);
        now.setTime(0);
        return normalizedRange;
      },
    );
    const { result } = renderHook(
      () =>
        useDateFilterDraft(createDescriptor(normalizeCustomRangeDraft), state),
      {
        wrapper: ({ children }) => <StrictMode>{children}</StrictMode>,
      },
    );
    const expectedInputs = [
      inputRange.start.getTime(),
      inputRange.end.getTime(),
      state.start?.getTime() ?? 0,
      state.end?.getTime() ?? 0,
      actionTime.getTime(),
    ];

    act(() => {
      result.current.editRange(inputRange);
    });

    expect(normalizeCustomRangeDraft).toHaveBeenCalledTimes(2);
    expect(observedInputs).toEqual([expectedInputs, expectedInputs]);
    expect(inputRange).toEqual({
      start: new Date("2026-08-20T09:00:00.000Z"),
      end: new Date("2026-08-21T17:00:00.000Z"),
    });
    expect(result.current.draft).toMatchObject(normalizedRange);
  });
});
