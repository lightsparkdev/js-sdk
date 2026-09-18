/**
 * Row activation factory tests. Pins modifier-key routing: internal
 * navigation for plain clicks, new-tab opener for Meta/Ctrl clicks.
 */

import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRowActivationHook } from "./createRowActivationHook";

describe("createRowActivationHook", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("navigates internally on a plain click", () => {
    const navigateTarget = vi.fn();
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const useTestActivation = createRowActivationHook<{ id: string }>({
      useNavigateTarget: () => navigateTarget,
      toHref: ({ id }) => `/rows/${id}`,
    });

    const { result } = renderHook(() => useTestActivation());
    const { activateRow } = result.current;

    act(() => {
      activateRow({ metaKey: false, ctrlKey: false }, { id: "a" });
    });

    expect(navigateTarget).toHaveBeenCalledWith({ id: "a" });
    expect(openSpy).not.toHaveBeenCalled();
  });

  it.each([
    { modifier: "metaKey", event: { metaKey: true, ctrlKey: false } },
    { modifier: "ctrlKey", event: { metaKey: false, ctrlKey: true } },
  ])("opens a new tab on $modifier click", ({ event }) => {
    const navigateTarget = vi.fn();
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const useTestActivation = createRowActivationHook<{ id: string }>({
      useNavigateTarget: () => navigateTarget,
      toHref: ({ id }) => `/rows/${id}`,
    });

    const { result } = renderHook(() => useTestActivation());

    act(() => {
      result.current.activateRow(event, { id: "a" });
    });

    expect(openSpy).toHaveBeenCalledWith("/rows/a", "_blank", "noopener");
    expect(navigateTarget).not.toHaveBeenCalled();
  });
});
