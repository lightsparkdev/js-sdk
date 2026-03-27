"use client";

import * as React from "react";
import clsx from "clsx";
import { linearScale, niceTicks, thinIndices, axisPadForLabels } from "./utils";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import { useResizeWidth } from "./hooks";
import { useMergedRef } from "./useMergedRef";
import {
  type TooltipProp,
  type ReferenceLine,
  type ReferenceBand,
  PAD_TOP,
  PAD_RIGHT,
  PAD_BOTTOM_AXIS,
  SERIES_COLORS,
  TOOLTIP_GAP,
  resolveTooltipMode,
  axisTickTarget,
} from "./types";
import { ChartWrapper } from "./ChartWrapper";
import styles from "./Chart.module.scss";

export interface ScatterPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
  size?: number;
}

export interface ScatterSeries {
  key: string;
  label?: string;
  color?: string;
  data: ScatterPoint[];
}

export interface ScatterChartProps
  extends React.ComponentPropsWithoutRef<"div"> {
  data: ScatterSeries[];
  height?: number;
  grid?: boolean;
  tooltip?: TooltipProp;
  dotSize?: number;
  referenceLines?: ReferenceLine[];
  /** Shaded bands spanning a value range. Rendered behind dots. */
  referenceBands?: ReferenceBand[];
  ariaLabel?: string;
  animate?: boolean;
  legend?: boolean;
  loading?: boolean;
  empty?: React.ReactNode;
  formatValue?: (value: number) => string;
  formatXLabel?: (value: unknown) => string;
  formatYLabel?: (value: number) => string;
  xDomain?: [number, number];
  yDomain?: [number, number];
  onClickDatum?: (
    seriesKey: string,
    point: ScatterPoint,
    index: number,
  ) => void;
  onActiveChange?: (
    activeDot: { seriesIndex: number; pointIndex: number } | null,
  ) => void;
  analyticsName?: string;
  /** Disables interaction, cursor, dots, and tooltip. */
  interactive?: boolean;
}

const scatterClickMeta = (
  seriesKey: string,
  _point: ScatterPoint,
  index: number,
) => ({ seriesKey, index });

interface ResolvedScatterSeries {
  key: string;
  label: string;
  color: string;
  data: ScatterPoint[];
}

interface ActiveDot {
  seriesIndex: number;
  pointIndex: number;
  point: ScatterPoint;
  series: ResolvedScatterSeries;
}

export const Scatter = React.forwardRef<HTMLDivElement, ScatterChartProps>(
  function Scatter(
    {
      data,
      height = 300,
      grid = false,
      tooltip: tooltipProp,
      dotSize = 4,
      referenceLines,
      referenceBands,
      ariaLabel,
      animate = true,
      legend,
      loading,
      empty,
      formatValue,
      formatXLabel,
      formatYLabel,
      xDomain: xDomainProp,
      yDomain: yDomainProp,
      onClickDatum,
      onActiveChange,
      analyticsName,
      interactive = true,
      className,
      ...props
    },
    ref,
  ) {
    const trackedClickDatum = useTrackedCallback(
      analyticsName,
      "Chart.Scatter",
      "click",
      onClickDatum,
      onClickDatum ? scatterClickMeta : undefined,
    );

    const { width, attachRef } = useResizeWidth();
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const [activeDot, setActiveDot] = React.useState<ActiveDot | null>(null);

    const tooltipMode = resolveTooltipMode(tooltipProp);
    const showTooltip = interactive && tooltipMode !== "off";
    const tooltipRender =
      typeof tooltipProp === "function" ? tooltipProp : undefined;

    const mergedRef = useMergedRef(ref, attachRef);

    const series = React.useMemo<ResolvedScatterSeries[]>(
      () =>
        data.map((s, i) => ({
          key: s.key,
          label: s.label ?? s.key,
          color: s.color ?? SERIES_COLORS[i % SERIES_COLORS.length],
          data: s.data,
        })),
      [data],
    );

    const totalPoints = React.useMemo(
      () => series.reduce((sum, s) => sum + s.data.length, 0),
      [series],
    );

    const showXAxis = true;
    const showYAxis = grid;
    const padBottom = showXAxis ? PAD_BOTTOM_AXIS : 0;
    const plotHeight = Math.max(0, height - PAD_TOP - padBottom);

    const yTickTarget = axisTickTarget(plotHeight);

    const { yMin, yMax, yTicks } = React.useMemo(() => {
      if (yDomainProp) {
        const result = niceTicks(yDomainProp[0], yDomainProp[1], yTickTarget);
        return { yMin: result.min, yMax: result.max, yTicks: result.ticks };
      }
      let min = Infinity;
      let max = -Infinity;
      for (const s of series) {
        for (const p of s.data) {
          if (p.y < min) min = p.y;
          if (p.y > max) max = p.y;
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
      if (min === Infinity) return { yMin: 0, yMax: 1, yTicks: [0, 1] };
      const result = niceTicks(min, max, yTickTarget);
      return { yMin: result.min, yMax: result.max, yTicks: result.ticks };
    }, [series, referenceLines, referenceBands, yDomainProp, yTickTarget]);

    const padLeft = React.useMemo(() => {
      if (!showYAxis) return 0;
      const fmt = formatYLabel ?? ((v: number) => String(v));
      return axisPadForLabels(yTicks.map(fmt));
    }, [showYAxis, yTicks, formatYLabel]);
    const plotWidth = Math.max(0, width - padLeft - PAD_RIGHT);

    const xTickTarget = axisTickTarget(plotWidth, true);

    const { xMin, xMax, xTicks } = React.useMemo(() => {
      if (xDomainProp) {
        const result = niceTicks(xDomainProp[0], xDomainProp[1], xTickTarget);
        return { xMin: result.min, xMax: result.max, xTicks: result.ticks };
      }
      let min = Infinity;
      let max = -Infinity;
      for (const s of series) {
        for (const p of s.data) {
          if (p.x < min) min = p.x;
          if (p.x > max) max = p.x;
        }
      }
      if (min === Infinity) return { xMin: 0, xMax: 1, xTicks: [0, 1] };
      const result = niceTicks(min, max, xTickTarget);
      return { xMin: result.min, xMax: result.max, xTicks: result.ticks };
    }, [series, xDomainProp, xTickTarget]);

    const yLabels = React.useMemo(() => {
      if (!showYAxis || plotHeight <= 0) return [];
      return yTicks.map((v) => ({
        y: linearScale(v, yMin, yMax, plotHeight, 0),
        text: formatYLabel ? formatYLabel(v) : String(v),
      }));
    }, [showYAxis, yTicks, yMin, yMax, plotHeight, formatYLabel]);

    const xLabels = React.useMemo(() => {
      if (plotWidth <= 0) return [];
      const maxLabels = Math.max(2, Math.floor(plotWidth / 60));
      const indices = thinIndices(xTicks.length, maxLabels);
      return indices.map((i) => ({
        x: linearScale(xTicks[i], xMin, xMax, 0, plotWidth),
        text: formatXLabel ? formatXLabel(xTicks[i]) : String(xTicks[i]),
      }));
    }, [xTicks, xMin, xMax, plotWidth, formatXLabel]);

    const screenPoints = React.useMemo(() => {
      if (plotWidth <= 0 || plotHeight <= 0) return [];
      return series.map((s) =>
        s.data.map((p) => ({
          sx: linearScale(p.x, xMin, xMax, 0, plotWidth),
          sy: linearScale(p.y, yMin, yMax, plotHeight, 0),
          point: p,
        })),
      );
    }, [series, xMin, xMax, yMin, yMax, plotWidth, plotHeight]);

    const findNearest = React.useCallback(
      (mouseX: number, mouseY: number): ActiveDot | null => {
        let best: ActiveDot | null = null;
        let bestDist = Infinity;
        const threshold = 20;
        for (let si = 0; si < screenPoints.length; si++) {
          for (let pi = 0; pi < screenPoints[si].length; pi++) {
            const { sx, sy, point } = screenPoints[si][pi];
            const dx = mouseX - sx;
            const dy = mouseY - sy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < bestDist && dist < threshold) {
              bestDist = dist;
              best = {
                seriesIndex: si,
                pointIndex: pi,
                point,
                series: series[si],
              };
            }
          }
        }
        return best;
      },
      [screenPoints, series],
    );

    const positionTooltip = React.useCallback(
      (sx: number, sy: number) => {
        const tip = tooltipRef.current;
        if (!tip) return;
        const absX = padLeft + sx;
        const absY = PAD_TOP + sy;
        const totalW = padLeft + plotWidth + PAD_RIGHT;
        tip.style.display = "";
        const tipW = tip.offsetWidth;
        const fitsRight = absX + TOOLTIP_GAP + tipW <= totalW;
        const fitsLeft = absX - TOOLTIP_GAP - tipW >= 0;
        const preferRight = sx <= plotWidth / 2;
        tip.style.left = `${absX}px`;
        tip.style.top = `${absY}px`;
        if ((preferRight && fitsRight) || !fitsLeft) {
          tip.style.transform = `translate(${TOOLTIP_GAP}px, -50%)`;
        } else {
          tip.style.transform = `translate(calc(-100% - ${TOOLTIP_GAP}px), -50%)`;
        }
      },
      [padLeft, plotWidth],
    );

    const handleMouseMove = React.useCallback(
      (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mx = e.clientX - rect.left - padLeft;
        const my = e.clientY - rect.top - PAD_TOP;
        const nearest = findNearest(mx, my);
        setActiveDot(nearest);
        if (nearest) {
          const sp = screenPoints[nearest.seriesIndex][nearest.pointIndex];
          positionTooltip(sp.sx, sp.sy);
        } else {
          const tip = tooltipRef.current;
          if (tip) tip.style.display = "none";
        }
      },
      [padLeft, findNearest, screenPoints, positionTooltip],
    );

    const handleMouseLeave = React.useCallback(() => {
      setActiveDot(null);
      const tip = tooltipRef.current;
      if (tip) tip.style.display = "none";
    }, []);

    const fmtValue = React.useCallback(
      (v: number) => (formatValue ? formatValue(v) : String(v)),
      [formatValue],
    );

    const handleClick = React.useCallback(() => {
      if (!onClickDatum || !activeDot) return;
      trackedClickDatum(
        activeDot.series.key,
        activeDot.point,
        activeDot.pointIndex,
      );
    }, [onClickDatum, activeDot, trackedClickDatum]);

    const ready = width > 0;

    const svgDesc = React.useMemo(() => {
      if (series.length === 0 || totalPoints === 0) return undefined;
      const names = series.map((s) => s.label).join(", ");
      return `Scatter chart with ${totalPoints} points showing ${names}.`;
    }, [series, totalPoints]);

    const ariaLiveContent = React.useMemo(() => {
      if (!activeDot) return "";
      const parts = [activeDot.series.label];
      if (activeDot.point.label) parts.push(activeDot.point.label);
      parts.push(
        `x: ${fmtValue(activeDot.point.x)}, y: ${fmtValue(activeDot.point.y)}`,
      );
      return parts.join(", ");
    }, [activeDot, fmtValue]);

    const allPointsFlat = React.useMemo<ActiveDot[]>(() => {
      const result: ActiveDot[] = [];
      for (let si = 0; si < series.length; si++) {
        for (let pi = 0; pi < series[si].data.length; pi++) {
          result.push({
            seriesIndex: si,
            pointIndex: pi,
            point: series[si].data[pi],
            series: series[si],
          });
        }
      }
      return result;
    }, [series]);

    const onActiveChangeRef = React.useRef(onActiveChange);
    React.useLayoutEffect(() => {
      onActiveChangeRef.current = onActiveChange;
    }, [onActiveChange]);

    React.useEffect(() => {
      onActiveChangeRef.current?.(
        activeDot
          ? {
              seriesIndex: activeDot.seriesIndex,
              pointIndex: activeDot.pointIndex,
            }
          : null,
      );
    }, [activeDot]);

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
        if (allPointsFlat.length === 0) return;
        const currentIdx = activeDot
          ? allPointsFlat.findIndex(
              (p) =>
                p.seriesIndex === activeDot.seriesIndex &&
                p.pointIndex === activeDot.pointIndex,
            )
          : -1;
        let next = currentIdx;
        switch (e.key) {
          case "ArrowRight":
          case "ArrowDown":
            next = Math.min(allPointsFlat.length - 1, next + 1);
            break;
          case "ArrowLeft":
          case "ArrowUp":
            next = Math.max(0, next - 1);
            break;
          case "Home":
            next = 0;
            break;
          case "End":
            next = allPointsFlat.length - 1;
            break;
          case "Enter":
          case " ":
            if (onClickDatum && activeDot) {
              e.preventDefault();
              trackedClickDatum(
                activeDot.series.key,
                activeDot.point,
                activeDot.pointIndex,
              );
            }
            return;
          case "Escape":
            handleMouseLeave();
            return;
          default:
            return;
        }
        e.preventDefault();
        const dot = allPointsFlat[next];
        setActiveDot(dot);
        const sp = screenPoints[dot.seriesIndex][dot.pointIndex];
        positionTooltip(sp.sx, sp.sy);
      },
      [
        allPointsFlat,
        activeDot,
        screenPoints,
        onClickDatum,
        trackedClickDatum,
        handleMouseLeave,
        positionTooltip,
      ],
    );

    const legendSeries = React.useMemo(
      () =>
        series.map((s) => ({
          key: s.key,
          label: s.label,
          color: s.color,
          style: "solid" as const,
        })),
      [series],
    );

    return (
      <ChartWrapper
        ref={mergedRef}
        loading={loading}
        empty={empty}
        dataLength={totalPoints}
        height={height}
        legend={legend}
        series={legendSeries}
        className={className}
        ariaLiveContent={showTooltip ? ariaLiveContent : undefined}
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
                aria-roledescription="Scatter chart"
                aria-label={ariaLabel ?? svgDesc ?? "Scatter chart"}
                tabIndex={interactive ? 0 : undefined}
                width={width}
                height={height}
                className={styles.svg}
                onMouseMove={interactive ? handleMouseMove : undefined}
                onMouseLeave={interactive ? handleMouseLeave : undefined}
                onClick={onClickDatum ? handleClick : undefined}
                onTouchStart={
                  interactive
                    ? (e) => {
                        if (!e.touches[0]) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const mx = e.touches[0].clientX - rect.left - padLeft;
                        const my = e.touches[0].clientY - rect.top - PAD_TOP;
                        const nearest = findNearest(mx, my);
                        setActiveDot(nearest);
                        if (nearest) {
                          const sp =
                            screenPoints[nearest.seriesIndex][
                              nearest.pointIndex
                            ];
                          positionTooltip(sp.sx, sp.sy);
                        }
                      }
                    : undefined
                }
                onTouchMove={
                  interactive
                    ? (e) => {
                        if (!e.touches[0]) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const mx = e.touches[0].clientX - rect.left - padLeft;
                        const my = e.touches[0].clientY - rect.top - PAD_TOP;
                        const nearest = findNearest(mx, my);
                        setActiveDot(nearest);
                        if (nearest) {
                          const sp =
                            screenPoints[nearest.seriesIndex][
                              nearest.pointIndex
                            ];
                          positionTooltip(sp.sx, sp.sy);
                        } else {
                          const tip = tooltipRef.current;
                          if (tip) tip.style.display = "none";
                        }
                      }
                    : undefined
                }
                onTouchEnd={interactive ? handleMouseLeave : undefined}
                onTouchCancel={interactive ? handleMouseLeave : undefined}
                onKeyDown={interactive ? handleKeyDown : undefined}
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
                      const x1 = linearScale(rb.from, xMin, xMax, 0, plotWidth);
                      const x2 = linearScale(rb.to, xMin, xMax, 0, plotWidth);
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

                  {referenceLines?.map((rl, i) => {
                    const rlColor = rl.color ?? "var(--text-primary)";
                    if (rl.axis === "x") {
                      const rx = linearScale(
                        rl.value,
                        xMin,
                        xMax,
                        0,
                        plotWidth,
                      );
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

                  {screenPoints.map((pts, si) =>
                    pts.map(({ sx, sy, point }, pi) => {
                      const isActive =
                        interactive &&
                        activeDot?.seriesIndex === si &&
                        activeDot?.pointIndex === pi;
                      const r = point.size ?? dotSize;
                      return (
                        <circle
                          key={`${si}-${pi}`}
                          cx={sx}
                          cy={sy}
                          r={isActive ? r + 2 : r}
                          fill={point.color ?? series[si].color}
                          opacity={1}
                          role="graphics-symbol img"
                          aria-roledescription="Data point"
                          aria-label={`${series[si].label}: ${fmtValue(
                            point.x,
                          )}, ${fmtValue(point.y)}`}
                          className={
                            animate ? styles.scatterDotAnimate : undefined
                          }
                          style={
                            animate
                              ? {
                                  animationDelay: `${Math.min(pi * 15, 300)}ms`,
                                }
                              : undefined
                          }
                        />
                      );
                    }),
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

                  {xLabels.map(({ x, text }, i) => (
                    <text
                      key={i}
                      x={x}
                      y={plotHeight + 20}
                      className={styles.axisLabel}
                      textAnchor="middle"
                      dominantBaseline="auto"
                    >
                      {text}
                    </text>
                  ))}
                </g>
              </svg>

              {interactive && showTooltip && (
                <div
                  ref={tooltipRef}
                  className={styles.tooltip}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    pointerEvents: "none",
                    display: "none",
                  }}
                >
                  {activeDot &&
                    (tooltipMode === "custom" && tooltipRender ? (
                      tooltipRender(
                        {
                          x: activeDot.point.x,
                          y: activeDot.point.y,
                          label: activeDot.point.label,
                        },
                        legendSeries,
                      )
                    ) : (
                      <>
                        {activeDot.point.label && (
                          <p className={styles.tooltipLabel}>
                            {activeDot.point.label}
                          </p>
                        )}
                        <div className={styles.tooltipItems}>
                          <div className={styles.tooltipItem}>
                            <span
                              className={styles.tooltipIndicator}
                              style={{
                                backgroundColor: activeDot.series.color,
                              }}
                            />
                            <span className={styles.tooltipName}>
                              {activeDot.series.label}
                            </span>
                          </div>
                          <div className={styles.tooltipItem}>
                            <span className={styles.tooltipName}>x</span>
                            <span className={styles.tooltipValue}>
                              {fmtValue(activeDot.point.x)}
                            </span>
                          </div>
                          <div className={styles.tooltipItem}>
                            <span className={styles.tooltipName}>y</span>
                            <span className={styles.tooltipValue}>
                              {fmtValue(activeDot.point.y)}
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
  },
);

if (process.env.NODE_ENV !== "production") {
  Scatter.displayName = "Chart.Scatter";
}
