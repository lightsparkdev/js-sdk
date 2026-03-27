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
  SERIES_COLORS,
  DASH_PATTERNS,
  PAD_TOP,
  PAD_RIGHT,
  PAD_BOTTOM_AXIS,
  BAR_GROUP_GAP,
  BAR_ITEM_GAP,
  resolveTooltipMode,
  axisTickTarget,
} from "./types";
import { ChartWrapper } from "./ChartWrapper";
import styles from "./Chart.module.scss";

export interface ComposedSeries extends Series {
  /** Render this series as bars or a line. */
  type: "bar" | "line";
  /** Which Y axis this series binds to. Default: 'left'. */
  axis?: "left" | "right";
}

type ResolvedComposedSeries = {
  key: string;
  label: string;
  color: string;
  style: "solid" | "dashed" | "dotted";
  type: "bar" | "line";
  axis: "left" | "right";
};

export interface ComposedChartProps
  extends React.ComponentPropsWithoutRef<"div"> {
  data: ChartDatum[];
  series: ComposedSeries[];
  xKey?: string;
  height?: number;
  grid?: boolean;
  tooltip?: TooltipProp;
  curve?: "monotone" | "linear";
  /** Reference lines on the left Y axis. */
  referenceLines?: ReferenceLine[];
  /** Shaded bands spanning a value range on the left Y axis. Rendered behind bars and lines. */
  referenceBands?: ReferenceBand[];
  /** Show legend below chart. */
  legend?: boolean;
  /** Show loading skeleton. */
  loading?: boolean;
  /** Content when data is empty. */
  empty?: React.ReactNode;
  /** Control animation. */
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
  /** Formatter for the right Y axis labels. */
  formatYLabelRight?: (value: number) => string;
  /** Connect across null/NaN gaps in line series. When false, gaps break the line. */
  connectNulls?: boolean;
  /** Lock the left Y-axis domain instead of auto-scaling from data. */
  yDomain?: [number, number];
  /** Lock the right Y-axis domain instead of auto-scaling from data. */
  yDomainRight?: [number, number];
}

const EMPTY_TICKS = { min: 0, max: 1, ticks: [0, 1] } as const;

const clickIndexMeta = (index: number) => ({ index });

export const Composed = React.forwardRef<HTMLDivElement, ComposedChartProps>(
  function Composed(
    {
      data,
      series: seriesProp,
      xKey,
      height = 300,
      grid = false,
      tooltip: tooltipProp,
      curve = "monotone",
      referenceLines,
      referenceBands,
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
      formatYLabelRight,
      connectNulls = true,
      yDomain: yDomainProp,
      yDomainRight: yDomainRightProp,
      className,
      ...props
    },
    ref,
  ) {
    const { width, attachRef } = useResizeWidth();
    const trackedClick = useTrackedCallback(
      analyticsName,
      "Chart.Composed",
      "click",
      onClickDatum,
      onClickDatum ? clickIndexMeta : undefined,
    );
    const tooltipMode = resolveTooltipMode(tooltipProp);
    const showTooltip = interactive && tooltipMode !== "off";
    const tooltipRender =
      typeof tooltipProp === "function" ? tooltipProp : undefined;

    const mergedRef = useMergedRef(ref, attachRef);

    // Resolve series
    const series = React.useMemo<ResolvedComposedSeries[]>(
      () =>
        seriesProp.map((s, i) => ({
          key: s.key,
          label: s.label ?? s.key,
          color: s.color ?? SERIES_COLORS[i % SERIES_COLORS.length],
          style: s.style ?? "solid",
          type: s.type,
          axis: s.axis ?? "left",
        })),
      [seriesProp],
    );

    const barSeries = React.useMemo(
      () => series.filter((s) => s.type === "bar"),
      [series],
    );
    const lineSeries = React.useMemo(
      () => series.filter((s) => s.type === "line"),
      [series],
    );
    const hasRightAxis = React.useMemo(
      () => series.some((s) => s.axis === "right"),
      [series],
    );

    // Geometry — plotHeight is independent of padLeft,
    // so compute ticks first, then derive padLeft from label widths.
    const showXAxis = Boolean(xKey);
    const showYAxis = grid;
    const padBottom = showXAxis ? PAD_BOTTOM_AXIS : 0;
    const plotHeight = Math.max(0, height - PAD_TOP - padBottom);

    const tickTarget = axisTickTarget(plotHeight);

    // Left Y domain (bar series + left-axis lines)
    const leftDomain = React.useMemo(() => {
      if (yDomainProp)
        return niceTicks(yDomainProp[0], yDomainProp[1], tickTarget);
      let max = -Infinity;
      for (const s of series.filter((s) => s.axis === "left")) {
        for (const d of data) {
          const v = Number(d[s.key]);
          if (!isNaN(v) && v > max) max = v;
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
      return niceTicks(0, max, tickTarget);
    }, [data, series, referenceLines, referenceBands, tickTarget, yDomainProp]);

    // Right Y domain (right-axis lines)
    const rightDomain = React.useMemo(() => {
      if (!hasRightAxis) return EMPTY_TICKS;
      if (yDomainRightProp)
        return niceTicks(yDomainRightProp[0], yDomainRightProp[1], tickTarget);
      let min = Infinity;
      let max = -Infinity;
      for (const s of series.filter((s) => s.axis === "right")) {
        for (const d of data) {
          const v = Number(d[s.key]);
          if (!isNaN(v)) {
            if (v < min) min = v;
            if (v > max) max = v;
          }
        }
      }
      if (min === Infinity) return EMPTY_TICKS;
      return niceTicks(min, max, tickTarget);
    }, [data, series, hasRightAxis, tickTarget, yDomainRightProp]);

    const padLeft = React.useMemo(() => {
      if (!showYAxis) return 0;
      const fmt = formatYLabel ?? ((v: number) => String(v));
      return axisPadForLabels(leftDomain.ticks.map(fmt));
    }, [showYAxis, leftDomain.ticks, formatYLabel]);
    const padRight = React.useMemo(() => {
      if (!hasRightAxis) return PAD_RIGHT;
      const fmt = formatYLabelRight ?? ((v: number) => String(v));
      return axisPadForLabels(rightDomain.ticks.map(fmt));
    }, [hasRightAxis, rightDomain.ticks, formatYLabelRight]);
    const plotWidth = Math.max(0, width - padLeft - padRight);

    // Bar geometry
    const slotWidth = data.length > 0 ? plotWidth / data.length : 0;
    const groupWidth = slotWidth * (1 - BAR_GROUP_GAP);
    const barWidth =
      barSeries.length > 0
        ? Math.max(
            1,
            (groupWidth - BAR_ITEM_GAP * (barSeries.length - 1)) /
              barSeries.length,
          )
        : 0;

    // Line points and paths
    const { linePoints, lineGroups } = React.useMemo(() => {
      if (plotWidth <= 0 || plotHeight <= 0 || data.length === 0)
        return { linePoints: [] as Point[][], lineGroups: [] as Point[][][] };
      const allPoints: Point[][] = [];
      const allGroups: Point[][][] = [];
      for (const s of lineSeries) {
        const domain = s.axis === "right" ? rightDomain : leftDomain;
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
          const x = data.length === 1 ? plotWidth / 2 : (i + 0.5) * slotWidth;
          const y = linearScale(v, domain.min, domain.max, plotHeight, 0);
          const pt = { x, y };
          points.push(pt);
          currentGroup.push(pt);
        }
        if (currentGroup.length > 0) groups.push(currentGroup);
        allPoints.push(points);
        allGroups.push(groups);
      }
      return { linePoints: allPoints, lineGroups: allGroups };
    }, [
      data,
      lineSeries,
      plotWidth,
      plotHeight,
      slotWidth,
      leftDomain,
      rightDomain,
      connectNulls,
    ]);

    const linePaths = React.useMemo(() => {
      if (connectNulls) {
        const build = curve === "monotone" ? monotonePath : linearPath;
        return linePoints.map((pts) => build(pts));
      }
      const build =
        curve === "monotone" ? monotonePathGroups : linearPathGroups;
      return lineGroups.map((groups) => build(groups));
    }, [linePoints, lineGroups, curve, connectNulls]);

    // Interpolators for line dot tracking
    const interpolators = React.useMemo(() => {
      const build =
        curve === "monotone" ? monotoneInterpolator : linearInterpolator;
      return linePoints.map((pts) => build(pts));
    }, [linePoints, curve]);

    const interpolatorsRef = React.useRef(interpolators);
    React.useLayoutEffect(() => {
      interpolatorsRef.current = interpolators;
    }, [interpolators]);

    // Scrub
    const scrub = useChartInteraction({
      dataLength: data.length,
      seriesCount: lineSeries.length,
      plotWidth,
      padLeft,
      tooltipMode: interactive ? tooltipMode : "off",
      interpolatorsRef,
      data,
      onActiveChange,
      onActivate: onClickDatum,
    });

    // Y axis labels
    const yLabelsLeft = React.useMemo(() => {
      if (!showYAxis || plotHeight <= 0) return [];
      return leftDomain.ticks.map((v) => ({
        y: linearScale(v, leftDomain.min, leftDomain.max, plotHeight, 0),
        text: formatYLabel ? formatYLabel(v) : String(v),
      }));
    }, [showYAxis, leftDomain, plotHeight, formatYLabel]);

    const yLabelsRight = React.useMemo(() => {
      if (!hasRightAxis || !showYAxis || plotHeight <= 0) return [];
      return rightDomain.ticks.map((v) => ({
        y: linearScale(v, rightDomain.min, rightDomain.max, plotHeight, 0),
        text: formatYLabelRight ? formatYLabelRight(v) : String(v),
      }));
    }, [hasRightAxis, showYAxis, rightDomain, plotHeight, formatYLabelRight]);

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
      return `Composed chart with ${data.length} data points showing ${names}.`;
    }, [series, data.length]);

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

    const wrapperSeries = React.useMemo<ResolvedSeries[]>(
      () =>
        series.map((s) => ({
          key: s.key,
          label: s.label,
          color: s.color,
          style: s.style,
        })),
      [series],
    );

    return (
      <ChartWrapper
        ref={mergedRef}
        loading={loading}
        empty={empty}
        dataLength={data.length}
        height={height}
        legend={legend}
        series={wrapperSeries}
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
                aria-roledescription="Chart"
                aria-label={ariaLabel ?? svgDesc ?? "Composed chart"}
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
                  {/* Grid lines from left axis */}
                  {grid &&
                    yLabelsLeft.map(({ y }, i) => (
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
                        data.length > 0 ? (rb.from + 0.5) * slotWidth : 0;
                      const x2 =
                        data.length > 0 ? (rb.to + 0.5) * slotWidth : plotWidth;
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
                    const y1 = linearScale(
                      rb.from,
                      leftDomain.min,
                      leftDomain.max,
                      plotHeight,
                      0,
                    );
                    const y2 = linearScale(
                      rb.to,
                      leftDomain.min,
                      leftDomain.max,
                      plotHeight,
                      0,
                    );
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
                    const ry = linearScale(
                      rl.value,
                      leftDomain.min,
                      leftDomain.max,
                      plotHeight,
                      0,
                    );
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

                  {/* Bars */}
                  {data.map((d, di) => {
                    const slotX = di * slotWidth + (slotWidth - groupWidth) / 2;
                    const delay = Math.min(di * 40, 400);
                    return (
                      <g key={di}>
                        {barSeries.map((s, si) => {
                          const v = Number(d[s.key]) || 0;
                          const domain =
                            s.axis === "right" ? rightDomain : leftDomain;
                          const barH =
                            ((v - domain.min) / (domain.max - domain.min)) *
                            plotHeight;
                          const barY = plotHeight - barH;
                          const barX = slotX + si * (barWidth + BAR_ITEM_GAP);
                          return (
                            <rect
                              key={s.key}
                              x={barX}
                              y={barY}
                              width={barWidth}
                              height={Math.max(0, barH)}
                              fill={s.color}
                              className={clsx(animate && styles.barAnimate)}
                              style={
                                animate
                                  ? { animationDelay: `${delay}ms` }
                                  : undefined
                              }
                            />
                          );
                        })}
                      </g>
                    );
                  })}

                  {/* Line paths */}
                  {linePaths.map((d, i) => {
                    const s = lineSeries[i];
                    const isDashed = s.style !== "solid";
                    return (
                      <path
                        key={s.key}
                        d={d}
                        pathLength={animate && !isDashed ? 1 : undefined}
                        fill="none"
                        stroke={s.color}
                        strokeWidth={isDashed ? 1 : 2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={DASH_PATTERNS[s.style]}
                        className={clsx(
                          animate && !isDashed && styles.lineAnimate,
                        )}
                      />
                    );
                  })}

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

                      {lineSeries.map((s, i) => (
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

                  {/* Left Y axis labels */}
                  {yLabelsLeft.map(({ y, text }, i) => (
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

                  {/* Right Y axis labels */}
                  {yLabelsRight.map(({ y, text }, i) => (
                    <text
                      key={i}
                      x={plotWidth + 8}
                      y={y}
                      className={styles.axisLabel}
                      textAnchor="start"
                      dominantBaseline="middle"
                    >
                      {text}
                    </text>
                  ))}

                  {/* X axis labels (thinned to avoid overlap) */}
                  {xKey &&
                    (() => {
                      const maxLabels = Math.max(2, Math.floor(plotWidth / 60));
                      const indices = thinIndices(data.length, maxLabels);
                      return indices.map((i) => (
                        <text
                          key={i}
                          x={(i + 0.5) * slotWidth}
                          y={plotHeight + 20}
                          className={styles.axisLabel}
                          textAnchor="middle"
                          dominantBaseline="auto"
                        >
                          {formatXLabel
                            ? formatXLabel(data[i][xKey])
                            : formatChartDatumValue(data[i][xKey])}
                        </text>
                      ));
                    })()}
                </g>
              </svg>

              {showTooltip && (
                <div
                  ref={scrub.tooltipRef}
                  className={styles.tooltip}
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
                      tooltipRender(
                        data[scrub.activeIndex],
                        series.map((s) => ({
                          key: s.key,
                          label: s.label,
                          color: s.color,
                          style: s.style,
                        })),
                      )
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
  },
);

if (process.env.NODE_ENV !== "production") {
  Composed.displayName = "Chart.Composed";
}
