import type * as React from "react";

export interface Series {
  /** Data key in the data object for this series. */
  key: string;
  /** Display name in tooltips and legends. Defaults to `key`. */
  label?: string;
  /** Series color. Uses the default palette if omitted. */
  color?: string;
  /** Line stroke style. Only applies to line-based charts. */
  style?: "solid" | "dashed" | "dotted";
}

export type ResolvedSeries = {
  key: string;
  label: string;
  color: string;
  style: "solid" | "dashed" | "dotted";
};

export interface ReferenceLine {
  /** Y-axis value for horizontal reference lines, or x-axis index for vertical. */
  value: number;
  /** Label text rendered at the line edge. */
  label?: string;
  /** Line color. Defaults to text-primary at 15% opacity. */
  color?: string;
  /** Render as a vertical line at this x-axis data index. */
  axis?: "x" | "y";
}

export interface ReferenceBand {
  /** Start value (Y-axis value for horizontal bands, x-axis index for vertical). */
  from: number;
  /** End value. */
  to: number;
  /** Optional label text rendered inside the band. */
  label?: string;
  /** Fill color. Defaults to stroke-primary at 6% opacity. */
  color?: string;
  /** Band direction. Defaults to 'y' (horizontal band spanning a Y range). */
  axis?: "x" | "y";
}

export type TooltipProp =
  | boolean
  | "simple"
  | "compact"
  | "detailed"
  | ((
      datum: Record<string, unknown>,
      series: ResolvedSeries[],
    ) => React.ReactNode);

export type TooltipMode = "off" | "simple" | "compact" | "detailed" | "custom";

export const SERIES_COLORS = [
  "var(--stroke-primary)",
  "var(--text-secondary)",
  "var(--surface-blue-strong)",
  "var(--surface-purple-strong)",
  "var(--surface-green-strong)",
  "var(--surface-pink-strong)",
];

export const PAD_TOP = 8;
export const PAD_RIGHT = 8;
export const PAD_BOTTOM_AXIS = 28;
export const TOOLTIP_GAP = 12;

export function resolveTooltipMode(prop: TooltipProp | undefined): TooltipMode {
  if (!prop) return "off";
  if (prop === true || prop === "detailed") return "detailed";
  if (prop === "simple") return "simple";
  if (prop === "compact") return "compact";
  return "custom";
}

export function resolveSeries(
  seriesProp: Series[] | undefined,
  dataKey: string | undefined,
  color: string | undefined,
): ResolvedSeries[] {
  if (seriesProp) {
    return seriesProp.map((s, i) => ({
      key: s.key,
      label: s.label ?? s.key,
      color: s.color ?? SERIES_COLORS[i % SERIES_COLORS.length],
      style: s.style ?? "solid",
    }));
  }
  if (dataKey) {
    return [
      {
        key: dataKey,
        label: dataKey,
        color: color ?? SERIES_COLORS[0],
        style: "solid",
      },
    ];
  }
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "Chart: No series to render. Pass `dataKey` for a single series or `series` for multiple.",
    );
  }
  return [];
}

export const BAR_GROUP_GAP = 0.12;
export const BAR_ITEM_GAP = 1;

/** Minimum vertical spacing (px) between tick labels at 11px font. */
export const MIN_TICK_SPACING_VERTICAL = 32;
/** Minimum horizontal spacing (px) between tick labels at 11px font. */
export const MIN_TICK_SPACING_HORIZONTAL = 60;

export function axisTickTarget(axisLength: number, horizontal = false): number {
  const spacing = horizontal
    ? MIN_TICK_SPACING_HORIZONTAL
    : MIN_TICK_SPACING_VERTICAL;
  return Math.max(2, Math.floor(axisLength / spacing));
}

export const DASH_PATTERNS: Record<string, string | undefined> = {
  solid: undefined,
  dashed: "4 4",
  dotted: "1 3",
};
