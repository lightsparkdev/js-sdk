/**
 * Chart Unit Tests (Vitest)
 *
 * Pure-function tests for the chart math utilities.
 * These run in JSDOM (~1ms/test) and cover edge cases,
 * defensive guards, and numerical correctness.
 */

import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useResizeWidth } from "./hooks";
import {
  linearScale,
  niceTicks,
  monotonePath,
  linearPath,
  monotoneInterpolator,
  linearInterpolator,
  filerp,
  stackData,
  thinIndices,
  measureLabelWidth,
  dynamicTickTarget,
  axisPadForLabels,
  formatChartDatumValue,
  type Point,
} from "./utils";
import {
  resolveTooltipMode,
  resolveSeries,
  SERIES_COLORS,
  axisTickTarget,
} from "./types";
import { computeSankeyLayout, sankeyLinkPath } from "./sankeyLayout";

// ---------------------------------------------------------------------------
// linearScale
// ---------------------------------------------------------------------------

describe("linearScale", () => {
  it("maps domain min to range min", () => {
    expect(linearScale(0, 0, 100, 0, 500)).toBe(0);
  });

  it("maps domain max to range max", () => {
    expect(linearScale(100, 0, 100, 0, 500)).toBe(500);
  });

  it("maps midpoint correctly", () => {
    expect(linearScale(50, 0, 100, 0, 500)).toBe(250);
  });

  it("handles inverted range (range flipped)", () => {
    // domain 0-100 mapped to range 500-0 (top-down like SVG y)
    expect(linearScale(0, 0, 100, 500, 0)).toBe(500);
    expect(linearScale(100, 0, 100, 500, 0)).toBe(0);
  });

  it("returns range midpoint when domain is zero-width", () => {
    expect(linearScale(5, 5, 5, 0, 100)).toBe(50);
  });

  it("works with negative domains", () => {
    expect(linearScale(-50, -100, 0, 0, 200)).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// niceTicks
// ---------------------------------------------------------------------------

describe("niceTicks", () => {
  it("returns sensible ticks for a typical range", () => {
    const result = niceTicks(0, 100, 5);
    expect(result.min).toBeLessThanOrEqual(0);
    expect(result.max).toBeGreaterThanOrEqual(100);
    expect(result.ticks.length).toBeGreaterThanOrEqual(2);
    // Ticks should be in ascending order
    for (let i = 1; i < result.ticks.length; i++) {
      expect(result.ticks[i]).toBeGreaterThan(result.ticks[i - 1]);
    }
  });

  it("handles equal min and max", () => {
    const result = niceTicks(50, 50, 5);
    expect(result.min).toBeLessThan(50);
    expect(result.max).toBeGreaterThan(50);
    expect(result.ticks.length).toBeGreaterThanOrEqual(2);
  });

  it("handles equal min and max at zero", () => {
    const result = niceTicks(0, 0, 5);
    expect(result.min).toBeLessThan(0);
    expect(result.max).toBeGreaterThan(0);
    expect(result.ticks.length).toBeGreaterThanOrEqual(2);
  });

  it("normalizes swapped min and max", () => {
    const normal = niceTicks(0, 100, 5);
    const swapped = niceTicks(100, 0, 5);
    expect(swapped.min).toBe(normal.min);
    expect(swapped.max).toBe(normal.max);
    expect(swapped.ticks).toEqual(normal.ticks);
  });

  it("handles very small ranges", () => {
    const result = niceTicks(0.001, 0.005, 5);
    expect(result.ticks.length).toBeGreaterThanOrEqual(2);
    expect(result.min).toBeLessThanOrEqual(0.001);
    expect(result.max).toBeGreaterThanOrEqual(0.005);
  });

  it("handles very large ranges", () => {
    const result = niceTicks(0, 1_000_000, 5);
    expect(result.ticks.length).toBeGreaterThanOrEqual(2);
    expect(result.ticks.length).toBeLessThanOrEqual(100);
  });

  it("handles negative ranges", () => {
    const result = niceTicks(-100, -20, 5);
    expect(result.min).toBeLessThanOrEqual(-100);
    expect(result.max).toBeGreaterThanOrEqual(-20);
    for (let i = 1; i < result.ticks.length; i++) {
      expect(result.ticks[i]).toBeGreaterThan(result.ticks[i - 1]);
    }
  });

  it("never exceeds MAX_TICKS (100)", () => {
    // Pathological input that could generate many ticks
    const result = niceTicks(0, 1000, 200);
    expect(result.ticks.length).toBeLessThanOrEqual(100);
  });

  it("first tick <= dataMin and last tick >= dataMax", () => {
    const cases = [
      [3, 97],
      [-15, 42],
      [0.1, 0.9],
      [1000, 5000],
    ] as const;
    for (const [min, max] of cases) {
      const result = niceTicks(min, max);
      expect(result.ticks[0]).toBeLessThanOrEqual(min);
      expect(result.ticks[result.ticks.length - 1]).toBeGreaterThanOrEqual(max);
    }
  });
});

// ---------------------------------------------------------------------------
// monotonePath
// ---------------------------------------------------------------------------

describe("monotonePath", () => {
  it("returns empty string for no points", () => {
    expect(monotonePath([])).toBe("");
  });

  it("returns M command for single point", () => {
    expect(monotonePath([{ x: 10, y: 20 }])).toBe("M10,20");
  });

  it("returns M + L for two points", () => {
    const path = monotonePath([
      { x: 0, y: 0 },
      { x: 100, y: 50 },
    ]);
    expect(path).toMatch(/^M0,0L100,50$/);
  });

  it("returns M + C commands for three or more points", () => {
    const points: Point[] = [
      { x: 0, y: 100 },
      { x: 50, y: 20 },
      { x: 100, y: 80 },
    ];
    const path = monotonePath(points);
    expect(path).toMatch(/^M/);
    expect(path).toContain("C");
  });

  it("starts at first point and ends at last point", () => {
    const points: Point[] = [
      { x: 10, y: 90 },
      { x: 50, y: 30 },
      { x: 90, y: 70 },
    ];
    const path = monotonePath(points);
    expect(path).toMatch(/^M10,90/);
    expect(path).toMatch(/90,70$/);
  });

  it("rounds coordinates to 2 decimal places", () => {
    const points: Point[] = [
      { x: 0, y: 0 },
      { x: 33.333333, y: 66.666666 },
    ];
    const path = monotonePath(points);
    // Should not contain more than 2 decimal places
    const numbers = path.match(/\d+\.\d+/g) ?? [];
    for (const n of numbers) {
      const decimals = n.split(".")[1];
      expect(decimals.length).toBeLessThanOrEqual(2);
    }
  });
});

// ---------------------------------------------------------------------------
// linearPath
// ---------------------------------------------------------------------------

describe("linearPath", () => {
  it("returns empty string for no points", () => {
    expect(linearPath([])).toBe("");
  });

  it("returns M command for single point", () => {
    expect(linearPath([{ x: 5, y: 10 }])).toBe("M5,10");
  });

  it("returns M + L commands for multiple points", () => {
    const path = linearPath([
      { x: 0, y: 0 },
      { x: 50, y: 25 },
      { x: 100, y: 50 },
    ]);
    expect(path).toBe("M0,0L50,25L100,50");
  });

  it("rounds coordinates to 2 decimal places", () => {
    const path = linearPath([
      { x: 0.12345, y: 0.67891 },
      { x: 100.999, y: 50.005 },
    ]);
    const numbers = path.match(/\d+\.\d+/g) ?? [];
    for (const n of numbers) {
      const decimals = n.split(".")[1];
      expect(decimals.length).toBeLessThanOrEqual(2);
    }
  });
});

// ---------------------------------------------------------------------------
// linearInterpolator
// ---------------------------------------------------------------------------

describe("linearInterpolator", () => {
  it("returns 0 for empty points", () => {
    const interp = linearInterpolator([]);
    expect(interp(50)).toBe(0);
  });

  it("returns constant y for single point", () => {
    const interp = linearInterpolator([{ x: 50, y: 75 }]);
    expect(interp(0)).toBe(75);
    expect(interp(100)).toBe(75);
  });

  it("interpolates linearly between two points", () => {
    const interp = linearInterpolator([
      { x: 0, y: 0 },
      { x: 100, y: 100 },
    ]);
    expect(interp(50)).toBe(50);
    expect(interp(25)).toBe(25);
    expect(interp(75)).toBe(75);
  });

  it("clamps at endpoints", () => {
    const interp = linearInterpolator([
      { x: 10, y: 20 },
      { x: 90, y: 80 },
    ]);
    expect(interp(0)).toBe(20); // before first
    expect(interp(100)).toBe(80); // after last
  });

  it("handles multiple segments", () => {
    const interp = linearInterpolator([
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 0 },
    ]);
    expect(interp(0)).toBe(0);
    expect(interp(50)).toBe(100);
    expect(interp(100)).toBe(0);
    expect(interp(25)).toBe(50); // midpoint of first segment
    expect(interp(75)).toBe(50); // midpoint of second segment
  });

  it("returns first y for coincident x values", () => {
    const interp = linearInterpolator([
      { x: 50, y: 10 },
      { x: 50, y: 90 },
    ]);
    expect(interp(50)).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// monotoneInterpolator
// ---------------------------------------------------------------------------

describe("monotoneInterpolator", () => {
  it("returns 0 for empty points", () => {
    const interp = monotoneInterpolator([]);
    expect(interp(50)).toBe(0);
  });

  it("returns constant y for single point", () => {
    const interp = monotoneInterpolator([{ x: 50, y: 75 }]);
    expect(interp(0)).toBe(75);
    expect(interp(100)).toBe(75);
  });

  it("interpolates between two points", () => {
    const interp = monotoneInterpolator([
      { x: 0, y: 0 },
      { x: 100, y: 100 },
    ]);
    // Two-point case falls back to linear
    expect(interp(50)).toBeCloseTo(50, 5);
  });

  it("clamps at endpoints", () => {
    const interp = monotoneInterpolator([
      { x: 10, y: 20 },
      { x: 50, y: 60 },
      { x: 90, y: 80 },
    ]);
    expect(interp(0)).toBe(20); // before first
    expect(interp(100)).toBe(80); // after last
  });

  it("passes through data points exactly", () => {
    const points: Point[] = [
      { x: 0, y: 10 },
      { x: 100, y: 50 },
      { x: 200, y: 30 },
      { x: 300, y: 70 },
    ];
    const interp = monotoneInterpolator(points);
    for (const p of points) {
      expect(interp(p.x)).toBeCloseTo(p.y, 5);
    }
  });

  it("is monotone between monotone data points", () => {
    // Strictly increasing data
    const points: Point[] = [
      { x: 0, y: 0 },
      { x: 100, y: 25 },
      { x: 200, y: 50 },
      { x: 300, y: 100 },
    ];
    const interp = monotoneInterpolator(points);

    // Sample between points -- values should be non-decreasing
    let prev = interp(0);
    for (let x = 1; x <= 300; x += 1) {
      const current = interp(x);
      expect(current).toBeGreaterThanOrEqual(prev - 1e-10);
      prev = current;
    }
  });

  it("returns first y for coincident x values", () => {
    const interp = monotoneInterpolator([
      { x: 50, y: 10 },
      { x: 50, y: 90 },
    ]);
    expect(interp(50)).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// resolveTooltipMode
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// resolveSeries
// ---------------------------------------------------------------------------

describe("resolveSeries", () => {
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

// ---------------------------------------------------------------------------
// filerp (frame-rate-independent lerp)
// ---------------------------------------------------------------------------

describe("filerp", () => {
  it("returns target when speed is 1", () => {
    expect(filerp(0, 100, 1, 16.67)).toBe(100);
    expect(filerp(50, 200, 1, 33)).toBe(200);
  });

  it("moves toward target (not away)", () => {
    const result = filerp(0, 100, 0.5, 16.67);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(100);

    const resultNeg = filerp(100, 0, 0.5, 16.67);
    expect(resultNeg).toBeLessThan(100);
    expect(resultNeg).toBeGreaterThan(0);
  });

  it("larger dt means more progress", () => {
    const short = filerp(0, 100, 0.5, 8);
    const long = filerp(0, 100, 0.5, 32);
    expect(long).toBeGreaterThan(short);
  });

  it("larger speed means more progress", () => {
    const slow = filerp(0, 100, 0.1, 16.67);
    const fast = filerp(0, 100, 0.9, 16.67);
    expect(fast).toBeGreaterThan(slow);
  });

  it("returns current when speed is 0", () => {
    expect(filerp(42, 100, 0, 16.67)).toBe(42);
    expect(filerp(42, 100, 0, 100)).toBe(42);
  });
});

// ---------------------------------------------------------------------------
// stackData
// ---------------------------------------------------------------------------

describe("stackData", () => {
  it("correctly computes cumulative baselines and toplines", () => {
    const data = [
      { a: 10, b: 20, c: 30 },
      { a: 5, b: 15, c: 25 },
    ];
    const result = stackData(data, ["a", "b", "c"]);

    expect(result).toHaveLength(3);
    // First series: baseline 0, topline = values
    expect(result[0].topline).toEqual([10, 5]);
    // Second series: baseline = first topline, topline = cumulative
    expect(result[1].baseline).toEqual([10, 5]);
    expect(result[1].topline).toEqual([30, 20]);
    // Third series
    expect(result[2].baseline).toEqual([30, 20]);
    expect(result[2].topline).toEqual([60, 45]);
  });

  it("first series baseline is all zeros", () => {
    const data = [{ x: 1 }, { x: 2 }, { x: 3 }];
    const result = stackData(data, ["x"]);
    expect(result[0].baseline).toEqual([0, 0, 0]);
  });

  it("second series baseline equals first series topline", () => {
    const data = [
      { a: 3, b: 7 },
      { a: 10, b: 20 },
    ];
    const result = stackData(data, ["a", "b"]);
    expect(result[1].baseline).toEqual(result[0].topline);
  });

  it("handles zero values", () => {
    const data = [
      { a: 0, b: 5 },
      { a: 10, b: 0 },
    ];
    const result = stackData(data, ["a", "b"]);
    expect(result[0].topline).toEqual([0, 10]);
    expect(result[1].baseline).toEqual([0, 10]);
    expect(result[1].topline).toEqual([5, 10]);
  });

  it("handles single-key input", () => {
    const data = [{ v: 100 }, { v: 200 }];
    const result = stackData(data, ["v"]);
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("v");
    expect(result[0].baseline).toEqual([0, 0]);
    expect(result[0].topline).toEqual([100, 200]);
  });

  it("empty data returns empty arrays", () => {
    const result = stackData([], ["a", "b"]);
    expect(result).toHaveLength(2);
    for (const band of result) {
      expect(band.baseline).toEqual([]);
      expect(band.topline).toEqual([]);
    }
  });
});

// ---------------------------------------------------------------------------
// thinIndices
// ---------------------------------------------------------------------------

describe("thinIndices", () => {
  it("returns all indices when count fits", () => {
    expect(thinIndices(5, 10)).toEqual([0, 1, 2, 3, 4]);
    expect(thinIndices(3, 3)).toEqual([0, 1, 2]);
  });

  it("returns empty array for zero count", () => {
    expect(thinIndices(0, 5)).toEqual([]);
  });

  it("returns [0] when maxVisible is 1", () => {
    expect(thinIndices(10, 1)).toEqual([0]);
  });

  it("returns first and last when maxVisible is 2", () => {
    expect(thinIndices(10, 2)).toEqual([0, 9]);
  });

  it("always includes first and last index", () => {
    const result = thinIndices(100, 5);
    expect(result[0]).toBe(0);
    expect(result[result.length - 1]).toBe(99);
  });

  it("returns evenly distributed indices", () => {
    const result = thinIndices(10, 4);
    expect(result).toHaveLength(4);
    expect(result[0]).toBe(0);
    expect(result[result.length - 1]).toBe(9);
    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeGreaterThan(result[i - 1]);
    }
  });

  it("never returns more indices than count", () => {
    expect(thinIndices(2, 10)).toHaveLength(2);
    expect(thinIndices(1, 5)).toHaveLength(1);
  });

  it("handles single item", () => {
    expect(thinIndices(1, 5)).toEqual([0]);
  });
});

// ---------------------------------------------------------------------------
// yTickTarget
// ---------------------------------------------------------------------------

describe("axisTickTarget", () => {
  it("returns at least 2 for very short charts", () => {
    expect(axisTickTarget(30)).toBe(2);
    expect(axisTickTarget(0)).toBe(2);
  });

  it("scales with plot height (vertical)", () => {
    expect(axisTickTarget(100)).toBe(3);
    expect(axisTickTarget(160)).toBe(5);
    expect(axisTickTarget(300)).toBe(9);
  });

  it("returns more ticks for tall charts", () => {
    expect(axisTickTarget(600)).toBeGreaterThan(axisTickTarget(200));
  });

  it("uses wider spacing for horizontal axis", () => {
    expect(axisTickTarget(300, true)).toBeLessThan(axisTickTarget(300, false));
    expect(axisTickTarget(300, true)).toBe(5);
    expect(axisTickTarget(300, false)).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// measureLabelWidth
// ---------------------------------------------------------------------------

describe("measureLabelWidth", () => {
  it("returns a positive number for non-empty text", () => {
    const w = measureLabelWidth("4500");
    expect(w).toBeGreaterThan(0);
  });

  it("wider text returns a larger width", () => {
    const short = measureLabelWidth("0");
    const long = measureLabelWidth("$1,234,567.00");
    expect(long).toBeGreaterThan(short);
  });

  it("returns 0 for empty string", () => {
    expect(measureLabelWidth("")).toBe(0);
  });

  it("scales proportionally to character count (fallback path)", () => {
    const w4 = measureLabelWidth("1234");
    const w8 = measureLabelWidth("12345678");
    expect(w8 / w4).toBeCloseTo(2, 0);
  });
});

// ---------------------------------------------------------------------------
// dynamicTickTarget
// ---------------------------------------------------------------------------

describe("formatChartDatumValue", () => {
  it("returns empty string for null and undefined", () => {
    expect(formatChartDatumValue(null)).toBe("");
    expect(formatChartDatumValue(undefined)).toBe("");
  });

  it("passes strings through unchanged", () => {
    expect(formatChartDatumValue("hello")).toBe("hello");
  });

  it("converts primitive values to strings", () => {
    expect(formatChartDatumValue(42)).toBe("42");
    expect(formatChartDatumValue(true)).toBe("true");
    expect(formatChartDatumValue(false)).toBe("false");
    expect(formatChartDatumValue(BigInt(9007199254740991))).toBe(
      "9007199254740991",
    );
  });

  it("preserves default Date string formatting", () => {
    const value = new Date("2025-01-15T00:00:00.000Z");
    expect(formatChartDatumValue(value)).toBe(String(value));
  });

  it("returns an empty string for unexpected object values", () => {
    expect(formatChartDatumValue({ bad: "value" })).toBe("");
  });
});

describe("dynamicTickTarget", () => {
  it("returns at least 2", () => {
    expect(dynamicTickTarget(50, ["$1,000,000.00"])).toBeGreaterThanOrEqual(2);
  });

  it("fits more ticks for shorter labels", () => {
    const shortLabels = dynamicTickTarget(400, ["0", "100"]);
    const longLabels = dynamicTickTarget(400, ["$1,234,567.00"]);
    expect(shortLabels).toBeGreaterThan(longLabels);
  });

  it("fits more ticks in wider axes", () => {
    const narrow = dynamicTickTarget(200, ["4500"]);
    const wide = dynamicTickTarget(800, ["4500"]);
    expect(wide).toBeGreaterThan(narrow);
  });

  it("falls back to 60px spacing when no samples given", () => {
    expect(dynamicTickTarget(300, [])).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// axisPadForLabels
// ---------------------------------------------------------------------------

describe("axisPadForLabels", () => {
  it("returns 0 for empty labels", () => {
    expect(axisPadForLabels([])).toBe(0);
  });

  it("returns at least MIN_AXIS_PAD for short labels", () => {
    expect(axisPadForLabels(["0", "5"])).toBeGreaterThanOrEqual(24);
  });

  it("grows with longer labels", () => {
    const short = axisPadForLabels(["0", "100"]);
    const long = axisPadForLabels(["$1,000,000", "$2,000,000"]);
    expect(long).toBeGreaterThan(short);
  });

  it("is driven by the widest label", () => {
    const withShort = axisPadForLabels(["0", "5", "10"]);
    const withLong = axisPadForLabels(["0", "5", "10", "10,000"]);
    expect(withLong).toBeGreaterThan(withShort);
  });

  it("accounts for minus sign in negative labels", () => {
    const positive = axisPadForLabels(["0", "1,000"]);
    const withNeg = axisPadForLabels(["-1,000", "0", "1,000"]);
    expect(withNeg).toBeGreaterThan(positive);
  });
});

// ---------------------------------------------------------------------------
// Sankey layout
// ---------------------------------------------------------------------------

describe("computeSankeyLayout", () => {
  const simpleData = {
    nodes: [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
      { id: "c", label: "C" },
    ],
    links: [
      { source: "a", target: "c", value: 30 },
      { source: "b", target: "c", value: 20 },
    ],
  };

  it("returns all nodes and links", () => {
    const result = computeSankeyLayout(simpleData, 400, 200, 12, 8);
    expect(result.nodes).toHaveLength(3);
    expect(result.links).toHaveLength(2);
  });

  it("assigns columns via BFS", () => {
    const result = computeSankeyLayout(simpleData, 400, 200, 12, 8);
    const nodeA = result.nodes.find((n) => n.id === "a")!;
    const nodeB = result.nodes.find((n) => n.id === "b")!;
    const nodeC = result.nodes.find((n) => n.id === "c")!;
    expect(nodeA.column).toBe(0);
    expect(nodeB.column).toBe(0);
    expect(nodeC.column).toBe(1);
  });

  it("source nodes are left of target nodes", () => {
    const result = computeSankeyLayout(simpleData, 400, 200, 12, 8);
    const nodeA = result.nodes.find((n) => n.id === "a")!;
    const nodeC = result.nodes.find((n) => n.id === "c")!;
    expect(nodeA.x1).toBeLessThanOrEqual(nodeC.x0);
  });

  it("node value equals max of in/out flow", () => {
    const result = computeSankeyLayout(simpleData, 400, 200, 12, 8);
    const nodeC = result.nodes.find((n) => n.id === "c")!;
    expect(nodeC.value).toBe(50);
  });

  it("node width matches nodeWidth param", () => {
    const result = computeSankeyLayout(simpleData, 400, 200, 16, 8);
    for (const node of result.nodes) {
      expect(node.x1 - node.x0).toBe(16);
    }
  });

  it("link widths are proportional to values", () => {
    const result = computeSankeyLayout(simpleData, 400, 200, 12, 8);
    const link30 = result.links.find((l) => l.value === 30)!;
    const link20 = result.links.find((l) => l.value === 20)!;
    expect(link30.width).toBeGreaterThan(link20.width);
  });

  it("handles empty input", () => {
    const result = computeSankeyLayout(
      { nodes: [], links: [] },
      400,
      200,
      12,
      8,
    );
    expect(result.nodes).toHaveLength(0);
    expect(result.links).toHaveLength(0);
  });

  it("handles multi-column layout", () => {
    const data = {
      nodes: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
        { id: "c", label: "C" },
      ],
      links: [
        { source: "a", target: "b", value: 50 },
        { source: "b", target: "c", value: 50 },
      ],
    };
    const result = computeSankeyLayout(data, 600, 200, 12, 8);
    const cols = result.nodes.map((n) => n.column);
    expect(new Set(cols).size).toBe(3);
  });
});

describe("sankeyLinkPath", () => {
  it("produces a valid SVG path with cubic bezier", () => {
    const data = {
      nodes: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
      links: [{ source: "a", target: "b", value: 100 }],
    };
    const result = computeSankeyLayout(data, 400, 200, 12, 8);
    const path = sankeyLinkPath(result.links[0]);
    expect(path).toMatch(/^M/);
    expect(path).toContain("C");
  });
});

// ---------------------------------------------------------------------------
// useResizeWidth
// ---------------------------------------------------------------------------

describe("useResizeWidth", () => {
  it("returns 0 when called with no arguments", () => {
    const { result } = renderHook(() => useResizeWidth());
    expect(result.current.width).toBe(0);
    expect(typeof result.current.attachRef).toBe("function");
  });

  it("returns initialWidth when no observer has fired", () => {
    const { result } = renderHook(() => useResizeWidth(800));
    expect(result.current.width).toBe(800);
  });

  it("returns initialWidth for various values", () => {
    const { result: r1 } = renderHook(() => useResizeWidth(1024));
    expect(r1.current.width).toBe(1024);

    const { result: r2 } = renderHook(() => useResizeWidth(320));
    expect(r2.current.width).toBe(320);
  });

  it("returns 0 when initialWidth is 0", () => {
    const { result } = renderHook(() => useResizeWidth(0));
    expect(result.current.width).toBe(0);
  });

  it("observer measurement takes over from initialWidth", () => {
    let observerCallback: ResizeObserverCallback;
    const mockObserver = {
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn(),
    };
    vi.stubGlobal(
      "ResizeObserver",
      vi.fn((cb: ResizeObserverCallback) => {
        observerCallback = cb;
        return mockObserver;
      }),
    );

    const { result } = renderHook(() => useResizeWidth(800));
    expect(result.current.width).toBe(800);

    const fakeNode = { clientWidth: 0 } as HTMLDivElement;
    act(() => result.current.attachRef(fakeNode));

    act(() => {
      observerCallback(
        [{ contentRect: { width: 600 } }] as ResizeObserverEntry[],
        {} as ResizeObserver,
      );
    });

    expect(result.current.width).toBe(600);

    vi.unstubAllGlobals();
  });
});
