"use client";

import * as React from "react";
import clsx from "clsx";
import {
  linearScale,
  niceTicks,
  monotonePath,
  linearPath,
  monotoneInterpolator,
  linearInterpolator,
  stackData,
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
  resolveTooltipMode,
  resolveSeries,
  axisTickTarget,
} from "./types";
import { ChartWrapper } from "./ChartWrapper";
import styles from "./Chart.module.scss";

const clickIndexMeta = (index: number) => ({ index });

export interface StackedAreaChartProps
  extends React.ComponentPropsWithoutRef<"div"> {
  data: ChartDatum[];
  /**
   * Pre-measurement width in pixels. Used as a fallback before
   * ResizeObserver fires, enabling server-side rendering.
   */
  initialWidth?: number;
  series: [Series, Series, ...Series[]];
  xKey?: string;
  height?: number;
  grid?: boolean;
  tooltip?: TooltipProp;
  curve?: "monotone" | "linear";
  fillOpacity?: number;
  /** Horizontal reference lines at specific y-values. */
  referenceLines?: ReferenceLine[];
  /** Shaded bands spanning a value range. Rendered behind area bands. */
  referenceBands?: ReferenceBand[];
  /** Fixed Y-axis domain. When omitted, auto-scales from stacked totals. */
  yDomain?: [number, number];
  /** Show a legend below the chart for multi-series. */
  legend?: boolean;
  /** Show a loading skeleton. */
  loading?: boolean;
  /** Content to show when data is empty. `true` for default message. */
  empty?: React.ReactNode;
  animate?: boolean;
  ariaLabel?: string;
  /** Disables interaction, cursor, dots, and tooltip. */
  interactive?: boolean;
  onActiveChange?: (index: number | null, datum: ChartDatum | null) => void;
  /** Called when a data point is clicked. */
  onClickDatum?: (index: number, datum: ChartDatum) => void;
  /** Analytics name for event tracking. */
  analyticsName?: string;
  formatValue?: (value: number) => string;
  formatXLabel?: (value: ChartDatumValue) => string;
  formatYLabel?: (value: number) => string;
}

export const StackedArea = React.forwardRef<
  HTMLDivElement,
  StackedAreaChartProps
>(function StackedArea(
  {
    data,
    series: seriesProp,
    xKey,
    height = 300,
    grid = false,
    tooltip: tooltipProp,
    curve = "monotone",
    fillOpacity = 0.4,
    referenceLines,
    referenceBands,
    yDomain: yDomainProp,
    legend,
    loading,
    empty,
    animate = true,
    ariaLabel,
    interactive = true,
    onActiveChange,
    onClickDatum,
    analyticsName,
    formatValue,
    formatXLabel,
    formatYLabel,
    initialWidth,
    className,
    ...props
  },
  ref,
) {
  const { width, attachRef } = useResizeWidth(initialWidth);
  const trackedClick = useTrackedCallback(
    analyticsName,
    "Chart.StackedArea",
    "click",
    onClickDatum,
    onClickDatum ? clickIndexMeta : undefined,
  );
  const tooltipMode = resolveTooltipMode(tooltipProp);
  const showTooltip = interactive && tooltipMode !== "off";
  const tooltipRender =
    typeof tooltipProp === "function" ? tooltipProp : undefined;

  const mergedRef = useMergedRef(ref, attachRef);

  const series = React.useMemo<ResolvedSeries[]>(
    () => resolveSeries(seriesProp, undefined, undefined),
    [seriesProp],
  );

  const showXAxis = Boolean(xKey);
  const showYAxis = grid;
  const padBottom = showXAxis ? PAD_BOTTOM_AXIS : 0;
  const plotHeight = Math.max(0, height - PAD_TOP - padBottom);

  // Stack the data
  const stacked = React.useMemo(
    () =>
      stackData(
        data,
        series.map((s) => s.key),
      ),
    [data, series],
  );

  const tickTarget = axisTickTarget(plotHeight);

  const { yMin, yMax, yTicks } = React.useMemo(() => {
    if (yDomainProp) {
      const result = niceTicks(yDomainProp[0], yDomainProp[1], tickTarget);
      return { yMin: result.min, yMax: result.max, yTicks: result.ticks };
    }
    let max = -Infinity;
    for (const band of stacked) {
      for (const v of band.topline) {
        if (v > max) max = v;
      }
    }
    if (referenceLines) {
      for (const rl of referenceLines) {
        if (rl.value > max) max = rl.value;
      }
    }
    if (referenceBands) {
      for (const rb of referenceBands) {
        const hi = Math.max(rb.from, rb.to);
        if (hi > max) max = hi;
      }
    }
    if (max === -Infinity) max = 1;
    const result = niceTicks(0, max, tickTarget);
    return { yMin: result.min, yMax: result.max, yTicks: result.ticks };
  }, [stacked, referenceLines, referenceBands, yDomainProp, tickTarget]);

  const padLeft = React.useMemo(() => {
    if (!showYAxis) return 0;
    const fmt = formatYLabel ?? ((v: number) => String(v));
    return axisPadForLabels(yTicks.map(fmt));
  }, [showYAxis, yTicks, formatYLabel]);
  const plotWidth = Math.max(0, width - padLeft - PAD_RIGHT);

  // Compute pixel points for top edge of each band (for interpolators and line paths)
  const bandTopPoints = React.useMemo(() => {
    if (plotWidth <= 0 || plotHeight <= 0 || data.length === 0) return [];
    return stacked.map((band) => {
      const points: Point[] = [];
      for (let i = 0; i < data.length; i++) {
        const x =
          data.length === 1
            ? plotWidth / 2
            : (i / (data.length - 1)) * plotWidth;
        const y = linearScale(band.topline[i], yMin, yMax, plotHeight, 0);
        points.push({ x, y });
      }
      return points;
    });
  }, [data.length, stacked, plotWidth, plotHeight, yMin, yMax]);

  // Compute pixel points for baseline of each band
  const bandBasePoints = React.useMemo(() => {
    if (plotWidth <= 0 || plotHeight <= 0 || data.length === 0) return [];
    return stacked.map((band) => {
      const points: Point[] = [];
      for (let i = 0; i < data.length; i++) {
        const x =
          data.length === 1
            ? plotWidth / 2
            : (i / (data.length - 1)) * plotWidth;
        const y = linearScale(band.baseline[i], yMin, yMax, plotHeight, 0);
        points.push({ x, y });
      }
      return points;
    });
  }, [data.length, stacked, plotWidth, plotHeight, yMin, yMax]);

  // Top edge paths (for stroke accent and interpolators)
  const topPaths = React.useMemo(() => {
    const build = curve === "monotone" ? monotonePath : linearPath;
    return bandTopPoints.map((pts) => build(pts));
  }, [bandTopPoints, curve]);

  // Area paths: top edge left-to-right, then base edge right-to-left
  const areaPaths = React.useMemo(() => {
    const build = curve === "monotone" ? monotonePath : linearPath;
    return bandTopPoints.map((topPts, i) => {
      if (topPts.length === 0) return "";
      const basePts = bandBasePoints[i];
      const topPath = build(topPts);
      const reversedBase = [...basePts].reverse();
      const basePath = build(reversedBase);
      return `${topPath} ${basePath.replace(/^M/, "L")} Z`;
    });
  }, [bandTopPoints, bandBasePoints, curve]);

  // Interpolators on top edge of each band (for dot tracking)
  const interpolators = React.useMemo(() => {
    const build =
      curve === "monotone" ? monotoneInterpolator : linearInterpolator;
    return bandTopPoints.map((pts) => build(pts));
  }, [bandTopPoints, curve]);

  const interpolatorsRef = React.useRef(interpolators);
  React.useLayoutEffect(() => {
    interpolatorsRef.current = interpolators;
  }, [interpolators]);

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

  // X axis labels
  const xLabels = React.useMemo(() => {
    if (!xKey || data.length === 0 || plotWidth <= 0) return [];
    const maxLabels = Math.max(2, Math.floor(plotWidth / 60));
    const indices = thinIndices(data.length, maxLabels);
    return indices.map((i) => {
      const x =
        data.length === 1 ? plotWidth / 2 : (i / (data.length - 1)) * plotWidth;
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
    return `Stacked area chart with ${data.length} data points showing ${names}.`;
  }, [series, data.length]);

  const ariaLiveContent = React.useMemo(() => {
    if (scrub.activeIndex === null || scrub.activeIndex >= data.length)
      return "";
    const d = data[scrub.activeIndex];
    const parts: string[] = [];
    if (xKey) parts.push(formatChartDatumValue(d[xKey]));
    for (const s of series)
      parts.push(`${s.label}: ${fmtValue(Number(d[s.key]))}`);
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
              role="graphics-document document"
              aria-roledescription="Stacked area chart"
              aria-label={ariaLabel ?? svgDesc ?? "Stacked area chart"}
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
                  const ry = linearScale(rl.value, yMin, yMax, plotHeight, 0);
                  const rlColor = rl.color ?? "var(--text-primary)";
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

                {/* Stacked area bands */}
                {areaPaths.map((d, i) =>
                  d ? (
                    <path
                      key={`${series[i].key}-area`}
                      d={d}
                      fill={series[i].color}
                      fillOpacity={fillOpacity}
                      stroke="none"
                      className={animate ? styles.pieSegment : undefined}
                      style={
                        animate ? { animationDelay: `${i * 80}ms` } : undefined
                      }
                    />
                  ) : null,
                )}
                {topPaths.map((d, i) =>
                  d ? (
                    <path
                      key={`${series[i].key}-edge`}
                      d={d}
                      fill="none"
                      stroke={series[i].color}
                      strokeWidth={1}
                      strokeOpacity={0.5}
                      strokeLinejoin="round"
                      className={animate ? styles.lineAnimate : undefined}
                      style={
                        animate ? { animationDelay: `${i * 80}ms` } : undefined
                      }
                    />
                  ) : null,
                )}

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
                          return (
                            <div key={s.key} className={styles.tooltipItem}>
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
                          );
                        })}
                        <div
                          className={clsx(
                            styles.tooltipItem,
                            styles.tooltipFooter,
                          )}
                        >
                          <span className={styles.tooltipName}>Total</span>
                          <span className={styles.tooltipValue}>
                            {fmtValue(
                              series.reduce(
                                (sum, s) =>
                                  sum +
                                  (Number(data[scrub.activeIndex!][s.key]) ||
                                    0),
                                0,
                              ),
                            )}
                          </span>
                        </div>
                      </div>
                    </>
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </ChartWrapper>
  );
});

if (process.env.NODE_ENV !== "production") {
  StackedArea.displayName = "Chart.StackedArea";
}
