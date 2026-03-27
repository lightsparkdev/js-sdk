import type { ChartDatum } from "./types";

export const CHART_LABEL_FONT =
  '11px "Suisse Intl Mono", "SF Mono", Menlo, monospace';
const LABEL_PADDING = 16;
const FALLBACK_CHAR_WIDTH = 6.6;

let _measureCtx: CanvasRenderingContext2D | null = null;

/**
 * Measure the pixel width of a chart axis label using an offscreen canvas.
 * Falls back to a character-count estimate when running outside a browser.
 */
export function measureLabelWidth(text: string): number {
  if (typeof document === "undefined") return text.length * FALLBACK_CHAR_WIDTH;
  if (!_measureCtx) {
    _measureCtx = document.createElement("canvas").getContext("2d");
  }
  if (!_measureCtx) return text.length * FALLBACK_CHAR_WIDTH;
  _measureCtx.font = CHART_LABEL_FONT;
  return _measureCtx.measureText(text).width;
}

/**
 * Compute how many axis labels fit along an axis of the given pixel length.
 * Measures representative label texts to determine spacing dynamically.
 */
export function dynamicTickTarget(
  axisLength: number,
  sampleTexts: string[],
): number {
  if (sampleTexts.length === 0) return Math.max(2, Math.floor(axisLength / 60));
  const maxWidth = Math.max(...sampleTexts.map(measureLabelWidth));
  return Math.max(2, Math.floor(axisLength / (maxWidth + LABEL_PADDING)));
}

/** Minimum left padding so very short labels (e.g. "0") don't crowd the axis. */
const MIN_AXIS_PAD = 24;
/** Gap between label right edge and plot area left edge. */
const AXIS_LABEL_GAP = 8;
/** Extra margin on the left side to prevent label clipping at the container edge. */
const AXIS_LABEL_INSET = 4;

/**
 * Compute the left padding needed to fit the widest label plus a gap.
 * Used for Y-axis labels on vertical charts and category labels on horizontal.
 */
export function axisPadForLabels(labels: string[]): number {
  if (labels.length === 0) return 0;
  const maxWidth = Math.max(...labels.map(measureLabelWidth));
  return Math.max(
    MIN_AXIS_PAD,
    Math.ceil(maxWidth) + AXIS_LABEL_GAP + AXIS_LABEL_INSET,
  );
}

export function formatChartDatumValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }
  if (value instanceof Date) return String(value);
  return "";
}

export function filerp(
  current: number,
  target: number,
  speed: number,
  dt: number,
): number {
  const factor = 1 - Math.pow(1 - speed, dt / 16.67);
  return current + (target - current) * factor;
}

export interface Point {
  x: number;
  y: number;
}

export interface TickResult {
  min: number;
  max: number;
  ticks: number[];
}

export function linearScale(
  value: number,
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number,
): number {
  if (domainMax === domainMin) return (rangeMin + rangeMax) / 2;
  return (
    rangeMin +
    ((value - domainMin) / (domainMax - domainMin)) * (rangeMax - rangeMin)
  );
}

function niceNum(range: number, round: boolean): number {
  if (range <= 0) return 1;
  const exp = Math.floor(Math.log10(range));
  const frac = range / Math.pow(10, exp);
  let nice: number;
  if (round) {
    if (frac < 1.5) nice = 1;
    else if (frac < 3) nice = 2;
    else if (frac < 7) nice = 5;
    else nice = 10;
  } else {
    if (frac <= 1) nice = 1;
    else if (frac <= 2) nice = 2;
    else if (frac <= 5) nice = 5;
    else nice = 10;
  }
  return nice * Math.pow(10, exp);
}

const MAX_TICKS = 100;

export function niceTicks(
  dataMin: number,
  dataMax: number,
  targetCount: number = 5,
): TickResult {
  if (dataMin > dataMax) {
    [dataMin, dataMax] = [dataMax, dataMin];
  }

  if (dataMin === dataMax) {
    const padding = dataMin === 0 ? 1 : Math.abs(dataMin) * 0.1;
    return niceTicks(dataMin - padding, dataMax + padding, targetCount);
  }

  const range = niceNum(dataMax - dataMin, false);
  const step = niceNum(range / (targetCount - 1), true);
  const niceMin = Math.floor(dataMin / step) * step;
  const niceMax = Math.ceil(dataMax / step) * step;
  const precision = Math.max(-Math.floor(Math.log10(step)), 0);

  const ticks: number[] = [];
  for (
    let v = niceMin;
    v <= niceMax + step * 0.001 && ticks.length < MAX_TICKS;
    v += step
  ) {
    ticks.push(parseFloat(v.toFixed(precision)));
  }

  return { min: niceMin, max: niceMax, ticks };
}

// Shared tangent computation for monotone cubic Hermite (Fritsch-Carlson)

interface TangentResult {
  dx: number[];
  m: number[];
}

function computeMonotoneTangents(points: Point[]): TangentResult {
  const n = points.length;
  const dx: number[] = [];
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const dxi = points[i + 1].x - points[i].x;
    dx.push(dxi);
    slopes.push(dxi === 0 ? 0 : (points[i + 1].y - points[i].y) / dxi);
  }

  const m = new Array<number>(n).fill(0);
  m[0] = slopes[0];
  m[n - 1] = slopes[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (slopes[i - 1] * slopes[i] <= 0) {
      m[i] = 0;
    } else {
      m[i] = (slopes[i - 1] + slopes[i]) / 2;
    }
  }

  for (let i = 0; i < n - 1; i++) {
    if (Math.abs(slopes[i]) < 1e-10) {
      m[i] = 0;
      m[i + 1] = 0;
    } else {
      const alpha = m[i] / slopes[i];
      const beta = m[i + 1] / slopes[i];
      const s = alpha * alpha + beta * beta;
      if (s > 9) {
        const tau = 3 / Math.sqrt(s);
        m[i] = tau * alpha * slopes[i];
        m[i + 1] = tau * beta * slopes[i];
      }
    }
  }

  return { dx, m };
}

// Round to 2 decimal places for cleaner SVG output
const r = (n: number) => Math.round(n * 100) / 100;

// SVG path from monotone cubic Hermite interpolation

export function monotonePath(points: Point[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M${r(points[0].x)},${r(points[0].y)}`;
  if (points.length === 2) {
    return `M${r(points[0].x)},${r(points[0].y)}L${r(points[1].x)},${r(
      points[1].y,
    )}`;
  }

  const { dx, m } = computeMonotoneTangents(points);

  const segments = [`M${r(points[0].x)},${r(points[0].y)}`];
  for (let i = 0; i < points.length - 1; i++) {
    const d = dx[i];
    const cp1x = r(points[i].x + d / 3);
    const cp1y = r(points[i].y + (m[i] * d) / 3);
    const cp2x = r(points[i + 1].x - d / 3);
    const cp2y = r(points[i + 1].y - (m[i + 1] * d) / 3);
    segments.push(
      `C${cp1x},${cp1y},${cp2x},${cp2y},${r(points[i + 1].x)},${r(
        points[i + 1].y,
      )}`,
    );
  }

  return segments.join("");
}

export function linearPath(points: Point[]): string {
  if (points.length === 0) return "";
  const segments = [`M${r(points[0].x)},${r(points[0].y)}`];
  for (let i = 1; i < points.length; i++) {
    segments.push(`L${r(points[i].x)},${r(points[i].y)}`);
  }
  return segments.join("");
}

export function monotonePathGroups(groups: Point[][]): string {
  return groups.map((g) => monotonePath(g)).join("");
}

export function linearPathGroups(groups: Point[][]): string {
  return groups.map((g) => linearPath(g)).join("");
}

// Interpolators: given screen-space points, return a function that
// evaluates the curve's y at any screen x. These assume data points
// are evenly spaced on x (index-based), which makes the Bezier x-component
// exactly linear and allows direct parameter mapping.

export type CurveInterpolator = (screenX: number) => number;

function findSegment(points: Point[], screenX: number): number {
  let lo = 0;
  let hi = points.length - 2;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (screenX > points[mid + 1].x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function monotoneInterpolator(points: Point[]): CurveInterpolator {
  if (points.length === 0) return () => 0;
  if (points.length === 1) return () => points[0].y;
  if (points.length === 2) {
    return (screenX: number) => {
      const d = points[1].x - points[0].x;
      if (d === 0) return points[0].y;
      const t = Math.max(0, Math.min(1, (screenX - points[0].x) / d));
      return points[0].y + (points[1].y - points[0].y) * t;
    };
  }

  const n = points.length;
  const { dx, m } = computeMonotoneTangents(points);

  return (screenX: number) => {
    if (screenX <= points[0].x) return points[0].y;
    if (screenX >= points[n - 1].x) return points[n - 1].y;

    const seg = findSegment(points, screenX);
    const d = dx[seg];
    if (d === 0) return points[seg].y;

    const t = (screenX - points[seg].x) / d;
    const t2 = t * t;
    const t3 = t2 * t;
    const omt = 1 - t;
    const omt2 = omt * omt;
    const omt3 = omt2 * omt;

    const cp1y = points[seg].y + (m[seg] * d) / 3;
    const cp2y = points[seg + 1].y - (m[seg + 1] * d) / 3;

    return (
      omt3 * points[seg].y +
      3 * omt2 * t * cp1y +
      3 * omt * t2 * cp2y +
      t3 * points[seg + 1].y
    );
  };
}

/**
 * Return evenly-spaced indices that always include the first and last item.
 * Used to thin axis labels so they don't overlap.
 */
export function thinIndices(count: number, maxVisible: number): number[] {
  if (count <= 0) return [];
  if (count <= maxVisible) return Array.from({ length: count }, (_, i) => i);
  if (maxVisible <= 1) return [0];
  if (maxVisible === 2) return [0, count - 1];

  const indices: number[] = [0];
  const step = (count - 1) / (maxVisible - 1);
  for (let i = 1; i < maxVisible - 1; i++) {
    indices.push(Math.round(i * step));
  }
  indices.push(count - 1);
  return indices;
}

export interface StackedBand {
  key: string;
  baseline: number[];
  topline: number[];
}

export function stackData(data: ChartDatum[], keys: string[]): StackedBand[] {
  const result: StackedBand[] = [];
  const cumulative = new Array<number>(data.length).fill(0);

  for (const key of keys) {
    const baseline = [...cumulative];
    const topline: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const v = Number(data[i][key]) || 0;
      cumulative[i] += v;
      topline.push(cumulative[i]);
    }
    result.push({ key, baseline, topline });
  }

  return result;
}

export function linearInterpolator(points: Point[]): CurveInterpolator {
  if (points.length === 0) return () => 0;
  if (points.length === 1) return () => points[0].y;

  const n = points.length;

  return (screenX: number) => {
    if (screenX <= points[0].x) return points[0].y;
    if (screenX >= points[n - 1].x) return points[n - 1].y;

    const seg = findSegment(points, screenX);
    const d = points[seg + 1].x - points[seg].x;
    if (d === 0) return points[seg].y;
    const t = (screenX - points[seg].x) / d;
    return points[seg].y + (points[seg + 1].y - points[seg].y) * t;
  };
}
