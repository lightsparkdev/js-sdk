import { describe, expect, it, vi } from "vitest";
import { resolveSeries, resolveTooltipMode, SERIES_COLORS } from "./types";

describe("resolveTooltipMode", () => {
  it('returns "off" for undefined', () => {
    expect(resolveTooltipMode(undefined)).toBe("off");
  });

  it('returns "off" for false', () => {
    expect(resolveTooltipMode(false)).toBe("off");
  });

  it('returns "detailed" for true', () => {
    expect(resolveTooltipMode(true)).toBe("detailed");
  });

  it('returns "detailed" for "detailed"', () => {
    expect(resolveTooltipMode("detailed")).toBe("detailed");
  });

  it('returns "simple" for "simple"', () => {
    expect(resolveTooltipMode("simple")).toBe("simple");
  });

  it('returns "compact" for "compact"', () => {
    expect(resolveTooltipMode("compact")).toBe("compact");
  });

  it('returns "custom" for a render function', () => {
    const renderFn = () => null;
    expect(resolveTooltipMode(renderFn)).toBe("custom");
  });
});

describe("resolveSeries", () => {
  it("uses the success icon token for the green chart series", () => {
    expect(SERIES_COLORS[4]).toBe("var(--icon-success)");
  });

  it("resolves a series array with all fields", () => {
    const result = resolveSeries(
      [{ key: "revenue", label: "Revenue", color: "red", style: "dashed" }],
      undefined,
      undefined,
    );
    expect(result).toEqual([
      { key: "revenue", label: "Revenue", color: "red", style: "dashed" },
    ]);
  });

  it("fills defaults for omitted series fields", () => {
    const result = resolveSeries(
      [{ key: "a" }, { key: "b" }],
      undefined,
      undefined,
    );
    expect(result).toEqual([
      { key: "a", label: "a", color: SERIES_COLORS[0], style: "solid" },
      { key: "b", label: "b", color: SERIES_COLORS[1], style: "solid" },
    ]);
  });

  it("cycles through SERIES_COLORS when index exceeds palette length", () => {
    const series = SERIES_COLORS.map((_, i) => ({ key: `s${i}` }));
    series.push({ key: "extra" });
    const result = resolveSeries(series, undefined, undefined);
    expect(result[result.length - 1].color).toBe(SERIES_COLORS[0]);
  });

  it("falls back to dataKey when series is undefined", () => {
    const result = resolveSeries(undefined, "value", undefined);
    expect(result).toEqual([
      { key: "value", label: "value", color: SERIES_COLORS[0], style: "solid" },
    ]);
  });

  it("uses provided color with dataKey fallback", () => {
    const result = resolveSeries(undefined, "value", "var(--custom)");
    expect(result[0].color).toBe("var(--custom)");
  });

  it("prefers series over dataKey when both are provided", () => {
    const result = resolveSeries(
      [{ key: "from-series" }],
      "from-dataKey",
      undefined,
    );
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("from-series");
  });

  it("returns empty array and warns when neither series nor dataKey is provided", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = resolveSeries(undefined, undefined, undefined);
    expect(result).toEqual([]);
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });
});
