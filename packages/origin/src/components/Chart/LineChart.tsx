"use client";

import * as React from "react";
import clsx from "clsx";
import {
  linearScale,
  niceTicks,
  monotonePath,
  linearPath,
  monotonePathGroups,
  linearPathGroups,
  monotoneInterpolator,
  linearInterpolator,
  thinIndices,
  axisPadForLabels,
  formatChartDatumValue,
  type Point,
} from "./utils";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import { useResizeWidth, useChartInteraction } from "./hooks";
import { useMergedRef } from "./useMergedRef";
import {
  type ChartDatum,
  type ChartDatumValue,
  type Series,
  type ResolvedSeries,
  type TooltipProp,
  type ReferenceLine,
  type ReferenceBand,
  PAD_TOP,
  PAD_RIGHT,
  PAD_BOTTOM_AXIS,
  DASH_PATTERNS,
  resolveTooltipMode,
  resolveSeries,
  axisTickTarget,
} from "./types";
import { ChartWrapper } from "./ChartWrapper";
import styles from "./Chart.module.scss";

export type { Series, TooltipProp, ReferenceLine, ReferenceBand };

const clickIndexMeta = (index: number) => ({ index });

export interface LineChartProps extends React.ComponentPropsWithoutRef<"div"> {
  /**
   * Array of data objects. Each object should contain keys matching `dataKey` or `series[].key`.
   */
  data: ChartDatum[];
  /**
   * Pre-measurement width in pixels. Used as a fallback before
   * ResizeObserver fires, enabling server-side rendering.
   */
  initialWidth?: number;
  /** Data key for single-series charts. Pass this OR `series`, not both. */
  dataKey?: string;
  /** Series configuration for multi-series charts. */
  series?: Series[];
  /** Key in data objects for x-axis labels. When omitted, no x-axis is shown. */
  xKey?: string;
  /** Chart height in pixels. */
  height?: number;
  /** Show grid lines and y-axis labels. */
  grid?: boolean;
  /**
   * Controls the hover tooltip.
   * - `false` / omitted: no tooltip
   * - `true` / `"detailed"`: full tooltip with x-label, series dots, names, and values
   * - `"simple"`: timestamp-only tooltip (just the formatted x-label)
   * - `"compact"`: inline values with dot separators
   * - `(datum, series) => ReactNode`: custom render function
   */
  tooltip?: TooltipProp;
  /** Curve interpolation. */
  curve?: "monotone" | "linear";
  /** Line stroke width in pixels. */
  strokeWidth?: number;
  /** Stroke color shorthand for single-series charts using `dataKey`. */
  color?: string;
  /** Animate line drawing on mount. */
  animate?: boolean;
  /** Enable area fill under the line. `true` for 0.12 opacity, or a number for custom. */
  fill?: boolean | number;
  /** Fade line paths to transparent on the left edge. `true` for 40px, or a custom width. */
  fadeLeft?: boolean | number;
  /** Reference lines at specific values. Supports horizontal (y) and vertical (x) lines. */
  referenceLines?: ReferenceLine[];
  /** Shaded bands spanning a value range. Rendered behind data paths. */
  referenceBands?: ReferenceBand[];
  /** Fixed Y-axis domain. When omitted, auto-scales from data. */
  yDomain?: [number, number];
  /**
   * Comparison data for "this period vs last period" overlays. Rendered as dashed lines behind the
   * main paths.
   */
  compareData?: ChartDatum[];
  /** Legend label for comparison series. Defaults to "Previous". */
  compareLabel?: string;
  /** Show a legend below the chart for multi-series. */
  legend?: boolean;
  /** Show a loading skeleton. */
  loading?: boolean;
  /** Content to show when data is empty. `true` for default message. */
  empty?: React.ReactNode;
  /** Accessible label for the chart SVG. */
  ariaLabel?: string;
  /** Disables interaction, cursor, dots, and tooltip. */
  interactive?: boolean;
  /** Called when the hovered data point changes. Receives `null` on leave. */
  onActiveChange?: (index: number | null, datum: ChartDatum | null) => void;
  /** Called when a data point is clicked. */
  onClickDatum?: (index: number, datum: ChartDatum) => void;
  /** Analytics name for event tracking. */
  analyticsName?: string;
  /** Format values in tooltips. */
  formatValue?: (value: number) => string;
  /** Format x-axis labels. */
  formatXLabel?: (value: ChartDatumValue) => string;
  /** Format y-axis labels. */
  formatYLabel?: (value: number) => string;
  /** Connect across null/NaN gaps. When false, gaps break the line. */
  connectNulls?: boolean;
}

export const Line = React.forwardRef<HTMLDivElement, LineChartProps>(
  function Line(
    {
      data,
      dataKey,
      series: seriesProp,
      xKey,
      height = 300,
      grid = false,
      tooltip: tooltipProp,
      curve = "monotone",
      strokeWidth = 2,
      color,
      animate = true,
      fill: fillProp,
      fadeLeft,
      referenceLines,
      referenceBands,
      yDomain: yDomainProp,
      compareData,
      compareLabel,
      legend,
      loading,
      empty,
      ariaLabel,
      interactive = true,
      onActiveChange,
      onClickDatum,
      analyticsName,
      formatValue,
      formatXLabel,
      formatYLabel,
      connectNulls = true,
      initialWidth,
      className,
      ...props
    },
    ref,
  ) {
    const { width, attachRef } = useResizeWidth(initialWidth);
    const trackedClick = useTrackedCallback(
      analyticsName,
      "Chart.Line",
      "click",
      onClickDatum,
      onClickDatum ? clickIndexMeta : undefined,
    );
    const uid = React.useId().replace(/:/g, "");

    const tooltipMode = resolveTooltipMode(tooltipProp);
    const showTooltip = interactive && tooltipMode !== "off";
    const tooltipRender =
      typeof tooltipProp === "function" ? tooltipProp : undefined;

    const mergedRef = useMergedRef(ref, attachRef);

    const series = React.useMemo<ResolvedSeries[]>(
      () => resolveSeries(seriesProp, dataKey, color),
      [seriesProp, dataKey, color],
    );

    if (process.env.NODE_ENV !== "production") {
      if (color && seriesProp) {
        console.warn(
          "Chart.Line: `color` is ignored when `series` is provided. " +
            "Set color on each series entry instead.",
        );
      }
    }

    const fillOpacity =
      fillProp === true ? 0.08 : typeof fillProp === "number" ? fillProp : 0.06;

    // Chart area geometry — plotHeight is independent of padLeft,
    // so we compute ticks first, then derive padLeft from label widths.
    const showXAxis = Boolean(xKey);
    const showYAxis = grid;
    const padBottom = showXAxis ? PAD_BOTTOM_AXIS : 0;
    const plotHeight = Math.max(0, height - PAD_TOP - padBottom);

    const tickTarget = axisTickTarget(plotHeight);

    const { yMin, yMax, yTicks } = React.useMemo(() => {
      if (yDomainProp) {
        const result = niceTicks(yDomainProp[0], yDomainProp[1], tickTarget);
        return { yMin: result.min, yMax: result.max, yTicks: result.ticks };
      }
      let min = Infinity;
      let max = -Infinity;
      for (const s of series) {
        for (const d of data) {
          const v = Number(d[s.key]);
          if (!isNaN(v)) {
            if (v < min) min = v;
            if (v > max) max = v;
          }
        }
      }
      if (compareData) {
        for (const s of series) {
          for (const d of compareData) {
            const v = Number(d[s.key]);
            if (!isNaN(v)) {
              if (v < min) min = v;
              if (v > max) max = v;
            }
          }
        }
      }
      if (referenceLines) {
        for (const rl of referenceLines) {
          if (rl.axis !== "x") {
            if (rl.value < min) min = rl.value;
            if (rl.value > max) max = rl.value;
          }
        }
      }
      if (referenceBands) {
        for (const rb of referenceBands) {
          if (rb.axis !== "x") {
            const lo = Math.min(rb.from, rb.to);
            const hi = Math.max(rb.from, rb.to);
            if (lo < min) min = lo;
            if (hi > max) max = hi;
          }
        }
      }
      if (min === Infinity) {
        return { yMin: 0, yMax: 1, yTicks: [0, 1] };
      }
      const result = niceTicks(min, max, tickTarget);
      return { yMin: result.min, yMax: result.max, yTicks: result.ticks };
    }, [
      data,
      series,
      compareData,
      referenceLines,
      referenceBands,
      yDomainProp,
      tickTarget,
    ]);

    const padLeft = React.useMemo(() => {
      if (!showYAxis) return 0;
      const fmt = formatYLabel ?? ((v: number) => String(v));
      return axisPadForLabels(yTicks.map(fmt));
    }, [showYAxis, yTicks, formatYLabel]);
    const plotWidth = Math.max(0, width - padLeft - PAD_RIGHT);

    // Left-edge fade
    const fadeWidth =
      fadeLeft === true ? 40 : typeof fadeLeft === "number" ? fadeLeft : 0;
    const hasFade = fadeWidth > 0 && plotWidth > 0;
    const fadeMaskId = hasFade ? `${uid}-fade` : undefined;
    const clipActiveId = `${uid}-clip-active`;
    const clipInactiveId = `${uid}-clip-inactive`;

    // Compute pixel points for each series (flat list for interpolators,
    // grouped by contiguous runs for gap rendering when connectNulls=false).
    const { seriesPoints, seriesGroups } = React.useMemo(() => {
      if (plotWidth <= 0 || plotHeight <= 0 || data.length === 0)
        return {
          seriesPoints: [] as Point[][],
          seriesGroups: [] as Point[][][],
        };
      const allPoints: Point[][] = [];
      const allGroups: Point[][][] = [];
      for (const s of series) {
        const points: Point[] = [];
        const groups: Point[][] = [];
        let currentGroup: Point[] = [];
        for (let i = 0; i < data.length; i++) {
          const v = Number(data[i][s.key]);
          if (isNaN(v)) {
            if (!connectNulls && currentGroup.length > 0) {
              groups.push(currentGroup);
              currentGroup = [];
            }
            continue;
          }
          const x =
            data.length === 1
              ? plotWidth / 2
              : (i / (data.length - 1)) * plotWidth;
          const y = linearScale(v, yMin, yMax, plotHeight, 0);
          const pt = { x, y };
          points.push(pt);
          currentGroup.push(pt);
        }
        if (currentGroup.length > 0) groups.push(currentGroup);
        allPoints.push(points);
        allGroups.push(groups);
      }
      return { seriesPoints: allPoints, seriesGroups: allGroups };
    }, [data, series, plotWidth, plotHeight, yMin, yMax, connectNulls]);

    // SVG paths
    const paths = React.useMemo(() => {
      if (connectNulls) {
        const build = curve === "monotone" ? monotonePath : linearPath;
        return seriesPoints.map((pts) => build(pts));
      }
      const build =
        curve === "monotone" ? monotonePathGroups : linearPathGroups;
      return seriesGroups.map((groups) => build(groups));
    }, [seriesPoints, seriesGroups, curve, connectNulls]);

    // Area paths
    const areaPaths = React.useMemo(() => {
      if (connectNulls) {
        return seriesPoints.map((pts, i) => {
          if (pts.length === 0) return "";
          const firstX = pts[0].x;
          const lastX = pts[pts.length - 1].x;
          return `${paths[i]} L ${lastX},${plotHeight} L ${firstX},${plotHeight} Z`;
        });
      }
      const buildPath = curve === "monotone" ? monotonePath : linearPath;
      return seriesGroups.map((groups) =>
        groups
          .map((g) => {
            if (g.length === 0) return "";
            const d = buildPath(g);
            const firstX = g[0].x;
            const lastX = g[g.length - 1].x;
            return `${d} L ${lastX},${plotHeight} L ${firstX},${plotHeight} Z`;
          })
          .join(""),
      );
    }, [seriesPoints, seriesGroups, paths, plotHeight, connectNulls, curve]);

    // Compare data: points and paths for period comparison overlay
    const compareLen = compareData
      ? Math.min(data.length, compareData.length)
      : 0;

    const compareSeriesPoints = React.useMemo(() => {
      if (!compareData || compareLen === 0 || plotWidth <= 0 || plotHeight <= 0)
        return [];
      return series.map((s) => {
        const points: Point[] = [];
        for (let i = 0; i < compareLen; i++) {
          const v = Number(compareData[i][s.key]);
          if (isNaN(v)) continue;
          const x =
            compareLen === 1
              ? plotWidth / 2
              : (i / (data.length - 1)) * plotWidth;
          const y = linearScale(v, yMin, yMax, plotHeight, 0);
          points.push({ x, y });
        }
        return points;
      });
    }, [
      compareData,
      compareLen,
      series,
      data.length,
      plotWidth,
      plotHeight,
      yMin,
      yMax,
    ]);

    const comparePaths = React.useMemo(() => {
      const build = curve === "monotone" ? monotonePath : linearPath;
      return compareSeriesPoints.map((pts) => build(pts));
    }, [compareSeriesPoints, curve]);

    // X axis labels
    const xLabels = React.useMemo(() => {
      if (!xKey || data.length === 0 || plotWidth <= 0) return [];
      const maxLabels = Math.max(2, Math.floor(plotWidth / 60));
      const indices = thinIndices(data.length, maxLabels);
      return indices.map((i) => {
        const x =
          data.length === 1
            ? plotWidth / 2
            : (i / (data.length - 1)) * plotWidth;
        const raw = data[i][xKey];
        const text = formatXLabel
          ? formatXLabel(raw)
          : formatChartDatumValue(raw);
        return { x, text, index: i };
      });
    }, [xKey, data, plotWidth, formatXLabel]);

    // Y axis labels
    const yLabels = React.useMemo(() => {
      if (!showYAxis || plotHeight <= 0) return [];
      return yTicks.map((v) => ({
        y: linearScale(v, yMin, yMax, plotHeight, 0),
        text: formatYLabel ? formatYLabel(v) : String(v),
      }));
    }, [showYAxis, yTicks, yMin, yMax, plotHeight, formatYLabel]);

    // Curve interpolators
    const interpolators = React.useMemo(() => {
      const build =
        curve === "monotone" ? monotoneInterpolator : linearInterpolator;
      return seriesPoints.map((pts) => build(pts));
    }, [seriesPoints, curve]);

    const interpolatorsRef = React.useRef(interpolators);
    React.useLayoutEffect(() => {
      interpolatorsRef.current = interpolators;
    }, [interpolators]);

    // Scrub interaction
    const scrub = useChartInteraction({
      dataLength: data.length,
      seriesCount: series.length,
      plotWidth,
      padLeft,
      tooltipMode: interactive ? tooltipMode : "off",
      interpolatorsRef,
      data,
      onActiveChange,
      onActivate: onClickDatum,
    });

    const fmtValue = React.useCallback(
      (v: number) => (formatValue ? formatValue(v) : String(v)),
      [formatValue],
    );

    const ready = width > 0;

    const handleClick = React.useCallback(() => {
      if (
        !onClickDatum ||
        scrub.activeIndex === null ||
        scrub.activeIndex >= data.length
      )
        return;
      trackedClick(scrub.activeIndex, data[scrub.activeIndex]);
    }, [onClickDatum, trackedClick, scrub.activeIndex, data]);

    const svgDesc = React.useMemo(() => {
      if (series.length === 0 || data.length === 0) return undefined;
      const names = series.map((s) => s.label).join(", ");
      const first = xKey ? formatChartDatumValue(data[0][xKey]) : "";
      const last = xKey
        ? formatChartDatumValue(data[data.length - 1][xKey])
        : "";
      const range = first && last ? ` from ${first} to ${last}` : "";
      return `Line chart with ${data.length} data points showing ${names}${range}.`;
    }, [series, data, xKey]);

    const ariaLiveContent = React.useMemo(() => {
      if (scrub.activeIndex === null || scrub.activeIndex >= data.length)
        return "";
      const d = data[scrub.activeIndex];
      const parts: string[] = [];
      if (xKey) parts.push(formatChartDatumValue(d[xKey]));
      series.forEach((s) => {
        const v = Number(d[s.key]);
        parts.push(`${s.label}: ${isNaN(v) ? "no data" : fmtValue(v)}`);
      });
      return parts.join(", ");
    }, [scrub.activeIndex, data, series, xKey, fmtValue]);

    return (
      <ChartWrapper
        ref={mergedRef}
        loading={loading}
        empty={empty}
        dataLength={data.length}
        height={height}
        legend={legend}
        series={series}
        className={className}
        ariaLiveContent={interactive ? ariaLiveContent : undefined}
      >
        <div
          ref={mergedRef}
          className={clsx(styles.root, className)}
          style={{ height }}
          {...props}
        >
          {ready && (
            <>
              <svg
                role={interactive ? "graphics-document document" : "img"}
                aria-roledescription={interactive ? "Line chart" : undefined}
                aria-label={ariaLabel ?? svgDesc ?? "Line chart"}
                tabIndex={interactive ? 0 : undefined}
                width={width}
                height={height}
                className={styles.svg}
                onMouseMove={interactive ? scrub.handleMouseMove : undefined}
                onMouseLeave={interactive ? scrub.hideHover : undefined}
                onTouchStart={interactive ? scrub.handleTouchStart : undefined}
                onTouchMove={interactive ? scrub.handleTouchMove : undefined}
                onTouchEnd={interactive ? scrub.hideHover : undefined}
                onTouchCancel={interactive ? scrub.hideHover : undefined}
                onKeyDown={interactive ? scrub.handleKeyDown : undefined}
                onClick={onClickDatum ? handleClick : undefined}
              >
                {svgDesc && <desc>{svgDesc}</desc>}

                <defs>
                  {hasFade && (
                    <>
                      <linearGradient
                        id={`${fadeMaskId}-grad`}
                        gradientUnits="userSpaceOnUse"
                        x1={0}
                        y1={0}
                        x2={fadeWidth}
                        y2={0}
                      >
                        <stop offset="0" stopColor="white" stopOpacity={0} />
                        <stop offset="1" stopColor="white" stopOpacity={1} />
                      </linearGradient>
                      <mask id={fadeMaskId}>
                        <rect
                          x={0}
                          y={-PAD_TOP}
                          width={fadeWidth}
                          height={height}
                          fill={`url(#${fadeMaskId}-grad)`}
                        />
                        <rect
                          x={fadeWidth}
                          y={-PAD_TOP}
                          width={plotWidth - fadeWidth + PAD_RIGHT}
                          height={height}
                          fill="white"
                        />
                      </mask>
                    </>
                  )}

                  {interactive && (
                    <>
                      <clipPath id={clipActiveId}>
                        <rect
                          ref={scrub.clipLeftRef}
                          x={0}
                          y={-PAD_TOP}
                          width={plotWidth + PAD_RIGHT}
                          height={height}
                        />
                      </clipPath>
                      <clipPath id={clipInactiveId}>
                        <rect
                          ref={scrub.clipRightRef}
                          x={plotWidth + PAD_RIGHT}
                          y={-PAD_TOP}
                          width={0}
                          height={height}
                        />
                      </clipPath>
                    </>
                  )}

                  {series.map((s, i) => (
                    <linearGradient
                      key={`${uid}-fill-${i}`}
                      id={`${uid}-fill-${i}`}
                      gradientUnits="userSpaceOnUse"
                      x1={0}
                      y1={0}
                      x2={0}
                      y2={plotHeight}
                    >
                      <stop
                        offset="0"
                        stopColor={s.color}
                        stopOpacity={fillOpacity}
                      />
                      <stop offset="1" stopColor={s.color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>

                <g transform={`translate(${padLeft},${PAD_TOP})`}>
                  {grid &&
                    yLabels.map(({ y }, i) => (
                      <line
                        key={i}
                        x1={0}
                        y1={y}
                        x2={plotWidth}
                        y2={y}
                        className={styles.gridLine}
                      />
                    ))}

                  {/* Reference bands */}
                  {referenceBands?.map((rb, i) => {
                    const bandColor = rb.color ?? "var(--stroke-primary)";
                    if (rb.axis === "x") {
                      const x1 =
                        data.length <= 1
                          ? 0
                          : (rb.from / (data.length - 1)) * plotWidth;
                      const x2 =
                        data.length <= 1
                          ? plotWidth
                          : (rb.to / (data.length - 1)) * plotWidth;
                      const bx = Math.min(x1, x2);
                      const bw = Math.abs(x2 - x1);
                      return (
                        <g key={`band-${i}`}>
                          <rect
                            x={bx}
                            y={0}
                            width={bw}
                            height={plotHeight}
                            fill={bandColor}
                            opacity={0.06}
                          />
                          {rb.label && (
                            <text
                              x={bx + bw / 2}
                              y={plotHeight / 2}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className={styles.referenceLineLabel}
                              fill={bandColor}
                              fillOpacity={0.45}
                            >
                              {rb.label}
                            </text>
                          )}
                        </g>
                      );
                    }
                    const y1 = linearScale(rb.from, yMin, yMax, plotHeight, 0);
                    const y2 = linearScale(rb.to, yMin, yMax, plotHeight, 0);
                    const by = Math.min(y1, y2);
                    const bh = Math.abs(y1 - y2);
                    return (
                      <g key={`band-${i}`}>
                        <rect
                          x={0}
                          y={by}
                          width={plotWidth}
                          height={bh}
                          fill={bandColor}
                          opacity={0.06}
                        />
                        {rb.label && (
                          <text
                            x={plotWidth / 2}
                            y={by + bh / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className={styles.referenceLineLabel}
                            fill={bandColor}
                            fillOpacity={0.45}
                          >
                            {rb.label}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Reference lines */}
                  {referenceLines?.map((rl, i) => {
                    const rlColor = rl.color ?? "var(--text-primary)";
                    if (rl.axis === "x") {
                      const idx = Math.round(rl.value);
                      if (idx < 0 || idx >= data.length) return null;
                      const rx =
                        data.length === 1
                          ? plotWidth / 2
                          : (idx / (data.length - 1)) * plotWidth;
                      return (
                        <g key={`ref-${i}`} className={styles.referenceLine}>
                          <line
                            x1={rx}
                            y1={0}
                            x2={rx}
                            y2={plotHeight}
                            stroke={rlColor}
                            strokeOpacity={0.15}
                            strokeWidth={1}
                            strokeDasharray="4 4"
                          />
                          {rl.label && (
                            <text
                              x={rx + 4}
                              y={8}
                              className={styles.referenceLineLabel}
                              fill={rlColor}
                              fillOpacity={0.45}
                            >
                              {rl.label}
                            </text>
                          )}
                        </g>
                      );
                    }
                    const ry = linearScale(rl.value, yMin, yMax, plotHeight, 0);
                    return (
                      <g key={`ref-${i}`} className={styles.referenceLine}>
                        <line
                          x1={0}
                          y1={ry}
                          x2={plotWidth}
                          y2={ry}
                          stroke={rlColor}
                          strokeOpacity={0.15}
                          strokeWidth={1}
                          strokeDasharray="4 4"
                        />
                        {rl.label && (
                          <text
                            x={plotWidth}
                            y={ry - 5}
                            textAnchor="end"
                            className={styles.referenceLineLabel}
                            fill={rlColor}
                            fillOpacity={0.45}
                          >
                            {rl.label}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Comparison paths (dashed, behind main data) */}
                  {comparePaths.map((d, i) =>
                    d ? (
                      <path
                        key={`compare-${series[i].key}`}
                        d={d}
                        fill="none"
                        stroke={series[i].color}
                        strokeWidth={1}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="6 4"
                        opacity={0.4}
                      />
                    ) : null,
                  )}

                  {/* Gradient fills */}
                  <g mask={fadeMaskId ? `url(#${fadeMaskId})` : undefined}>
                    {areaPaths.map((d, i) =>
                      d ? (
                        <path
                          key={`${series[i].key}-fill`}
                          d={d}
                          fill={`url(#${uid}-fill-${i})`}
                          stroke="none"
                        />
                      ) : null,
                    )}
                  </g>

                  {/* Line paths */}
                  <g mask={fadeMaskId ? `url(#${fadeMaskId})` : undefined}>
                    {interactive ? (
                      <>
                        <g clipPath={`url(#${clipActiveId})`}>
                          {paths.map((d, i) => {
                            const isDashed = series[i].style !== "solid";
                            return (
                              <path
                                key={series[i].key}
                                d={d}
                                pathLength={
                                  animate && !isDashed ? 1 : undefined
                                }
                                fill="none"
                                stroke={series[i].color}
                                strokeWidth={isDashed ? 1 : strokeWidth}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeDasharray={
                                  isDashed
                                    ? DASH_PATTERNS[series[i].style]
                                    : undefined
                                }
                                className={clsx(
                                  animate && !isDashed && styles.lineAnimate,
                                )}
                              />
                            );
                          })}
                        </g>
                        <g clipPath={`url(#${clipInactiveId})`} opacity={0.4}>
                          {paths.map((d, i) => {
                            const isDashed = series[i].style !== "solid";
                            return (
                              <path
                                key={`${series[i].key}-inactive`}
                                d={d}
                                fill="none"
                                stroke={series[i].color}
                                strokeWidth={isDashed ? 1 : strokeWidth}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeDasharray={DASH_PATTERNS[series[i].style]}
                              />
                            );
                          })}
                        </g>
                      </>
                    ) : (
                      paths.map((d, i) => {
                        const isDashed = series[i].style !== "solid";
                        return (
                          <path
                            key={series[i].key}
                            d={d}
                            pathLength={animate && !isDashed ? 1 : undefined}
                            fill="none"
                            stroke={series[i].color}
                            strokeWidth={isDashed ? 1 : strokeWidth}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray={DASH_PATTERNS[series[i].style]}
                            className={clsx(
                              animate && !isDashed && styles.lineAnimate,
                            )}
                          />
                        );
                      })
                    )}
                  </g>

                  {interactive && (
                    <>
                      <line
                        ref={scrub.cursorRef}
                        x1={0}
                        y1={0}
                        x2={0}
                        y2={plotHeight}
                        className={styles.cursorLine}
                        style={{ display: "none" }}
                      />
                      {series.map((s, i) => (
                        <circle
                          key={s.key}
                          ref={(el) => {
                            scrub.dotRefs.current[i] = el;
                          }}
                          cx={0}
                          cy={0}
                          r={3}
                          fill={s.color}
                          className={styles.activeDot}
                          style={{ display: "none" }}
                        />
                      ))}
                    </>
                  )}

                  {yLabels.map(({ y, text }, i) => (
                    <text
                      key={i}
                      x={-8}
                      y={y}
                      className={styles.axisLabel}
                      textAnchor="end"
                      dominantBaseline="middle"
                    >
                      {text}
                    </text>
                  ))}

                  {xLabels.map(({ x, text, index: labelIndex }, i) => (
                    <text
                      key={`${labelIndex}-${text}`}
                      x={x}
                      y={plotHeight + 20}
                      className={styles.axisLabel}
                      textAnchor={
                        i === 0
                          ? "start"
                          : i === xLabels.length - 1
                          ? "end"
                          : "middle"
                      }
                      dominantBaseline="auto"
                    >
                      {text}
                    </text>
                  ))}
                </g>
              </svg>

              {showTooltip && (
                <div
                  ref={scrub.tooltipRef}
                  className={clsx(
                    styles.tooltip,
                    tooltipMode === "simple" && styles.tooltipSimple,
                    tooltipMode === "compact" && styles.tooltipCompact,
                  )}
                  style={{
                    position: "absolute",
                    top: PAD_TOP,
                    left: 0,
                    pointerEvents: "none",
                    display: "none",
                  }}
                >
                  {scrub.activeIndex !== null &&
                    scrub.activeIndex < data.length &&
                    (tooltipMode === "custom" && tooltipRender ? (
                      tooltipRender(data[scrub.activeIndex], series)
                    ) : tooltipMode === "simple" ? (
                      xKey && (
                        <span className={styles.tooltipInlineTime}>
                          {formatXLabel
                            ? formatXLabel(data[scrub.activeIndex][xKey])
                            : formatChartDatumValue(
                                data[scrub.activeIndex][xKey],
                              )}
                        </span>
                      )
                    ) : tooltipMode === "compact" ? (
                      <>
                        {series.map((s, i) => {
                          const v = Number(data[scrub.activeIndex!][s.key]);
                          return (
                            <React.Fragment key={s.key}>
                              {i > 0 && (
                                <span className={styles.tooltipInlineSep}>
                                  {"  ·  "}
                                </span>
                              )}
                              <span className={styles.tooltipInlineValue}>
                                {isNaN(v) ? "--" : fmtValue(v)}
                              </span>
                            </React.Fragment>
                          );
                        })}
                        {xKey && (
                          <>
                            <span className={styles.tooltipInlineSep}>
                              {"  ·  "}
                            </span>
                            <span className={styles.tooltipInlineTime}>
                              {formatXLabel
                                ? formatXLabel(data[scrub.activeIndex][xKey])
                                : formatChartDatumValue(
                                    data[scrub.activeIndex][xKey],
                                  )}
                            </span>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {xKey && (
                          <p className={styles.tooltipLabel}>
                            {formatXLabel
                              ? formatXLabel(data[scrub.activeIndex][xKey])
                              : formatChartDatumValue(
                                  data[scrub.activeIndex][xKey],
                                )}
                          </p>
                        )}
                        <div className={styles.tooltipItems}>
                          {series.map((s) => {
                            const v = Number(data[scrub.activeIndex!][s.key]);
                            const cv =
                              compareData &&
                              scrub.activeIndex! < compareData.length
                                ? Number(compareData[scrub.activeIndex!][s.key])
                                : NaN;
                            const delta =
                              !isNaN(v) && !isNaN(cv) ? v - cv : NaN;
                            const pct =
                              !isNaN(delta) && cv !== 0
                                ? ((delta / Math.abs(cv)) * 100).toFixed(1)
                                : null;
                            return (
                              <React.Fragment key={s.key}>
                                <div className={styles.tooltipItem}>
                                  <span
                                    className={styles.tooltipIndicator}
                                    style={{ backgroundColor: s.color }}
                                  />
                                  <span className={styles.tooltipName}>
                                    {s.label}
                                  </span>
                                  <span className={styles.tooltipValue}>
                                    {isNaN(v) ? "--" : fmtValue(v)}
                                  </span>
                                </div>
                                {compareData && !isNaN(cv) && (
                                  <div className={styles.tooltipItem}>
                                    <span
                                      className={styles.tooltipIndicator}
                                      style={{
                                        backgroundColor: s.color,
                                        opacity: 0.4,
                                      }}
                                    />
                                    <span className={styles.tooltipName}>
                                      {compareLabel ?? "Previous"}
                                    </span>
                                    <span className={styles.tooltipValue}>
                                      {fmtValue(cv)}
                                      {!isNaN(delta) && (
                                        <>
                                          {" "}
                                          ({delta >= 0 ? "+" : ""}
                                          {fmtValue(delta)}
                                          {pct
                                            ? `, ${
                                                delta >= 0 ? "+" : ""
                                              }${pct}%`
                                            : ""}
                                          )
                                        </>
                                      )}
                                    </span>
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </>
                    ))}
                </div>
              )}
            </>
          )}
        </div>
        {legend && compareData && compareData.length > 0 && (
          <div
            className={styles.legend}
            style={{ paddingTop: series.length > 1 ? 0 : undefined }}
          >
            <div className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{
                  backgroundColor: "transparent",
                  border: `1.5px dashed ${
                    series[0]?.color ?? "var(--text-secondary)"
                  }`,
                }}
              />
              <span className={styles.legendLabel}>
                {compareLabel ?? "Previous"}
              </span>
            </div>
          </div>
        )}
      </ChartWrapper>
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Line.displayName = "Chart.Line";
}
