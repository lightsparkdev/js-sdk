import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as React from "react";
import { renderHook, act } from "@testing-library/react";
import { AnalyticsProvider } from "./AnalyticsContext";
import type { AnalyticsHandler, InteractionInfo } from "./AnalyticsContext";
import { useTrackedCallback } from "./useTrackedCallback";
import { useTrackedOpenChange } from "./useTrackedOpenChange";

function createMockHandler(): AnalyticsHandler & {
  calls: InteractionInfo[];
} {
  const calls: InteractionInfo[] = [];
  return {
    calls,
    onInteraction: vi.fn((info: InteractionInfo) => {
      calls.push(info);
    }),
  };
}

function wrapper(handler: AnalyticsHandler) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <AnalyticsProvider value={handler}>{children}</AnalyticsProvider>;
  };
}

describe("useTrackedCallback", () => {
  let handler: ReturnType<typeof createMockHandler>;

  beforeEach(() => {
    handler = createMockHandler();
  });

  it("calls the original callback", () => {
    const original = vi.fn();
    const { result } = renderHook(
      () => useTrackedCallback("btn", "Button", "click", original),
      { wrapper: wrapper(handler) },
    );

    act(() => result.current());
    expect(original).toHaveBeenCalledOnce();
  });

  it("emits interaction with correct shape", () => {
    const { result } = renderHook(
      () => useTrackedCallback("save-btn", "Button", "click", vi.fn()),
      { wrapper: wrapper(handler) },
    );

    act(() => result.current());
    expect(handler.onInteraction).toHaveBeenCalledWith({
      name: "save-btn",
      component: "Button",
      interaction: "click",
      metadata: undefined,
    });
  });

  it("passes metadata from getMetadata", () => {
    const getMeta = (val: string) => ({ value: val });
    const { result } = renderHook(
      () => useTrackedCallback("select", "Select", "change", vi.fn(), getMeta),
      { wrapper: wrapper(handler) },
    );

    act(() => result.current("option-a"));
    expect(handler.calls[0].metadata).toEqual({ value: "option-a" });
  });

  it("does not emit when analyticsName is undefined", () => {
    const original = vi.fn();
    const { result } = renderHook(
      () => useTrackedCallback(undefined, "Button", "click", original),
      { wrapper: wrapper(handler) },
    );

    act(() => result.current());
    expect(handler.onInteraction).not.toHaveBeenCalled();
    expect(original).toHaveBeenCalledOnce();
  });

  it("does not emit when no provider is mounted", () => {
    const original = vi.fn();
    const { result } = renderHook(() =>
      useTrackedCallback("btn", "Button", "click", original),
    );

    act(() => result.current());
    expect(original).toHaveBeenCalledOnce();
  });

  it("handles undefined callback gracefully", () => {
    const { result } = renderHook(
      () => useTrackedCallback("btn", "Button", "click", undefined),
      { wrapper: wrapper(handler) },
    );

    expect(() => act(() => result.current())).not.toThrow();
    expect(handler.onInteraction).toHaveBeenCalledOnce();
  });

  it("forwards all arguments to the original callback", () => {
    const original = vi.fn();
    const { result } = renderHook(
      () =>
        useTrackedCallback<[string, number]>(
          "btn",
          "Button",
          "click",
          original,
        ),
      { wrapper: wrapper(handler) },
    );

    act(() => result.current("arg1", 42));
    expect(original).toHaveBeenCalledWith("arg1", 42);
  });
});

describe("useTrackedOpenChange", () => {
  let handler: ReturnType<typeof createMockHandler>;

  beforeEach(() => {
    handler = createMockHandler();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls the original onOpenChange", () => {
    const original = vi.fn();
    const { result } = renderHook(
      () => useTrackedOpenChange("dlg", "Dialog", original),
      { wrapper: wrapper(handler) },
    );

    act(() => result.current(true));
    expect(original).toHaveBeenCalledWith(true);
  });

  it("emits open interaction", () => {
    const { result } = renderHook(
      () => useTrackedOpenChange("dlg", "Dialog", vi.fn()),
      { wrapper: wrapper(handler) },
    );

    act(() => result.current(true));
    expect(handler.calls).toHaveLength(1);
    expect(handler.calls[0]).toEqual({
      name: "dlg",
      component: "Dialog",
      interaction: "open",
    });
  });

  it("emits close interaction with duration_ms", () => {
    const { result } = renderHook(
      () => useTrackedOpenChange("dlg", "Dialog", vi.fn()),
      { wrapper: wrapper(handler) },
    );

    act(() => result.current(true));
    act(() => {
      vi.advanceTimersByTime(500);
      result.current(false);
    });

    expect(handler.calls).toHaveLength(2);
    expect(handler.calls[1].interaction).toBe("close");
    expect(handler.calls[1].metadata?.duration_ms).toBe(500);
  });

  it("omits duration_ms when closed without prior open", () => {
    const { result } = renderHook(
      () => useTrackedOpenChange("dlg", "Dialog", vi.fn()),
      { wrapper: wrapper(handler) },
    );

    act(() => result.current(false));
    expect(handler.calls).toHaveLength(1);
    expect(handler.calls[0].metadata).toBeUndefined();
  });

  it("does not emit when analyticsName is undefined", () => {
    const original = vi.fn();
    const { result } = renderHook(
      () => useTrackedOpenChange(undefined, "Dialog", original),
      { wrapper: wrapper(handler) },
    );

    act(() => result.current(true));
    expect(handler.onInteraction).not.toHaveBeenCalled();
    expect(original).toHaveBeenCalledOnce();
  });

  it("does not emit when no provider is mounted", () => {
    const original = vi.fn();
    const { result } = renderHook(() =>
      useTrackedOpenChange("dlg", "Dialog", original),
    );

    act(() => result.current(true));
    expect(original).toHaveBeenCalledOnce();
  });

  it("handles undefined onOpenChange gracefully", () => {
    const { result } = renderHook(
      () => useTrackedOpenChange("dlg", "Dialog", undefined),
      { wrapper: wrapper(handler) },
    );

    expect(() => act(() => result.current(true))).not.toThrow();
    expect(handler.onInteraction).toHaveBeenCalledOnce();
  });
});
