import { waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { observeThemeChanges } from "./themeObserver";

describe("observeThemeChanges", () => {
  it("reports theme mutations on scoped ancestors", async () => {
    const scope = document.createElement("div");
    const chart = document.createElement("div");
    const onThemeChange = vi.fn();
    scope.append(chart);
    document.body.append(scope);

    const disconnect = observeThemeChanges(chart, onThemeChange);

    scope.setAttribute("data-theme", "dark");
    await waitFor(() => expect(onThemeChange).toHaveBeenCalledTimes(1));

    onThemeChange.mockClear();
    scope.classList.add("dark");
    await waitFor(() => expect(onThemeChange).toHaveBeenCalledTimes(1));

    disconnect();
    scope.remove();
  });
});
