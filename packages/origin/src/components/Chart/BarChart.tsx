"use client";

import * as React from "react";
import clsx from "clsx";
import {
  linearScale,
  niceTicks,
  thinIndices,
  dynamicTickTarget,
  measureLabelWidth,
  axisPadForLabels,
  formatChartDatumValue,
} from "./utils";
import { useResizeWidth } from "./hooks";
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
  BAR_GROUP_GAP,
  BAR_ITEM_GAP,
  TOOLTIP_GAP,
  resolveSeries,
  resolveTooltipMode,
  axisTickTarget,
} from "./types";
import { ChartWrapper } from "./ChartWrapper";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import styles from "./Chart.module.scss";

const EMPTY_TICKS = { min: 0, max: 1, ticks: [0, 1] } as const;

const clickIndexMeta = (index: number) => ({ index });

export interface BarChartProps extends React.ComponentPropsWithoutRef<"div"> {
  data: ChartDatum[];
  dataKey?: string;
  series?: Series[];
  xKey?: string;
  height?: number;
  grid?: boolean;
  tooltip?: TooltipProp;
  /** Stack bars on top of each other instead of side by side. */
  stacked?: boolean;
  /** Stroke color shorthand for single-series charts using `dataKey`. */
  color?: string;
  /** Horizontal reference lines at specific y-values. */
  referenceLines?: ReferenceLine[];
  /** Shaded bands spanning a value range. Rendered behind bars. */
  referenceBands?: ReferenceBand[];
  ariaLabel?: string;
  onActiveChange?: (index: number | null, datum: ChartDatum | null) => void;
  formatValue?: (value: number) => string;
  formatXLabel?: (value: ChartDatumValue) => string;
  formatYLabel?: (value: number) => string;
  /** Fixed Y-axis domain. Overrides auto-computed domain from data. */
  yDomain?: [number, number];
  /** Show legend below chart. */
  legend?: boolean;
  /** Show loading skeleton. */
  loading?: boolean;
  /** Content to display when data is empty. */
  empty?: React.ReactNode;
  /** Click handler called with the active data index and datum. */
  onClickDatum?: (index: number, datum: ChartDatum) => void;
  analyticsName?: string;
  /** Disables interaction, cursor, dots, and tooltip. */
  interactive?: boolean;
  /** Control bar mount animation. Defaults to `true`. */
  animate?: boolean;
  /**
   * Per-data-point color override. Return a CSS color string to override `series.color`, or
   * `undefined` to keep the default.
   */
  getBarColor?: (
    datum: ChartDatum,
    index: number,
    seriesKey: string,
  ) => string | undefined;
  /** Bar orientation. Horizontal swaps axes — categories on Y, values on X. */
  orientation?: "vertical" | "horizontal";
}

export const Bar = React.forwardRef<HTMLDivElement, BarChartProps>(function Bar(
  {
    data,
    dataKey,
    series: seriesProp,
    xKey,
    height = 300,
    grid = false,
    tooltip: tooltipProp,
    stacked = false,
    color,
    referenceLines,
    referenceBands,
    ariaLabel,
    onActiveChange,
    formatValue,
    formatXLabel,
    formatYLabel,
    yDomain,
    legend,
    loading,
    empty,
    onClickDatum,
    analyticsName,
    interactive: interactiveProp = true,
    animate = true,
    getBarColor,
    orientation = "vertical",
    className,
    ...props
  },
  ref,
) {
  const { width, attachRef } = useResizeWidth();
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const tooltipMode = resolveTooltipMode(tooltipProp);
  const showTooltip = interactiveProp && tooltipMode !== "off";
  const tooltipRender =
    typeof tooltipProp === "function" ? tooltipProp : undefined;

  const mergedRef = useMergedRef(ref, attachRef);

  const trackedClick = useTrackedCallback(
    analyticsName,
    "Chart.Bar",
    "click",
    onClickDatum,
    onClickDatum ? clickIndexMeta : undefined,
  );

  const series = React.useMemo<ResolvedSeries[]>(
    () => resolveSeries(seriesProp, dataKey, color),
    [seriesProp, dataKey, color],
  );

  const isHorizontal = orientation === "horizontal";
  const showCategoryAxis = Boolean(xKey);
  const showValueAxis = grid;
  const barAnimClass = isHorizontal
    ? styles.barAnimateHorizontal
    : styles.barAnimate;

  const padBottom = (isHorizontal ? showValueAxis : showCategoryAxis)
    ? PAD_BOTTOM_AXIS
    : 0;
  const plotHeight = Math.max(0, height - PAD_TOP - padBottom);

  // Value domain — split into raw max + tick generation so we can
  // measure formatted labels before choosing padding and tick count.
  const rawValueMax = React.useMemo(() => {
    if (yDomain) return yDomain[1];
    let max = -Infinity;
    if (stacked) {
      for (let i = 0; i < data.length; i++) {
        let sum = 0;
        for (const s of series) {
          sum += Number(data[i][s.key]) || 0;
        }
        if (sum > max) max = sum;
      }
    } else {
      for (const s of series) {
        for (const d of data) {
          const v = Number(d[s.key]);
          if (!isNaN(v) && v > max) max = v;
        }
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
    return max === -Infinity ? 1 : max;
  }, [data, series, stacked, referenceLines, referenceBands, yDomain]);

  // Vertical: compute ticks first, then measure labels for padLeft.
  // Horizontal: measure category labels for padLeft, then compute
  // plotWidth and tick count from formatted value labels.
  const verticalTickTarget = axisTickTarget(plotHeight);
  const verticalTicks = React.useMemo(() => {
    if (isHorizontal) return EMPTY_TICKS;
    const domainMin = yDomain ? yDomain[0] : 0;
    const domainMax = yDomain ? yDomain[1] : rawValueMax;
    return niceTicks(domainMin, domainMax, verticalTickTarget);
  }, [isHorizontal, rawValueMax, yDomain, verticalTickTarget]);

  const padLeft = React.useMemo(() => {
    if (isHorizontal) {
      if (!showCategoryAxis || !xKey) return 12;
      const fmt = formatXLabel ?? formatChartDatumValue;
      const maxWidth = Math.max(
        ...data.map((d) => measureLabelWidth(fmt(d[xKey]))),
      );
      return Math.max(12, Math.ceil(maxWidth) + 12);
    }
    if (!showValueAxis) return 0;
    const fmt = formatYLabel ?? ((v: number) => String(v));
    return axisPadForLabels(verticalTicks.ticks.map(fmt));
  }, [
    isHorizontal,
    showCategoryAxis,
    showValueAxis,
    xKey,
    data,
    formatXLabel,
    formatYLabel,
    verticalTicks.ticks,
  ]);
  const padRight = isHorizontal && showValueAxis ? 40 : PAD_RIGHT;
  const plotWidth = Math.max(0, width - padLeft - padRight);

  const tickTarget = React.useMemo(() => {
    if (!isHorizontal) return verticalTickTarget;
    const fmt = formatYLabel ?? ((v: number) => String(v));
    const samples = [
      fmt(0),
      fmt(rawValueMax),
      fmt(rawValueMax / 2),
      fmt(rawValueMax * 0.75),
    ];
    return dynamicTickTarget(plotWidth, samples);
  }, [isHorizontal, verticalTickTarget, plotWidth, rawValueMax, formatYLabel]);

  const { yMin, yMax, yTicks } = React.useMemo(() => {
    if (!isHorizontal)
      return {
        yMin: verticalTicks.min,
        yMax: verticalTicks.max,
        yTicks: verticalTicks.ticks,
      };
    const domainMin = yDomain ? yDomain[0] : 0;
    const domainMax = yDomain ? yDomain[1] : rawValueMax;
    const result = niceTicks(domainMin, domainMax, tickTarget);
    return { yMin: result.min, yMax: result.max, yTicks: result.ticks };
  }, [isHorizontal, verticalTicks, rawValueMax, yDomain, tickTarget]);

  // Bar geometry — slot is along the category axis, bar extends along the value axis
  const categoryLength = isHorizontal ? plotHeight : plotWidth;
  const slotSize = data.length > 0 ? categoryLength / data.length : 0;
  const groupSize = slotSize * (1 - BAR_GROUP_GAP);
  const barThickness = stacked
    ? groupSize
    : Math.max(
        1,
        (groupSize - BAR_ITEM_GAP * (series.length - 1)) / series.length,
      );

  // Value axis labels
  const valueLabels = React.useMemo(() => {
    if (!showValueAxis) return [];
    const axisLength = isHorizontal ? plotWidth : plotHeight;
    if (axisLength <= 0) return [];
    return yTicks.map((v) => ({
      pos: linearScale(
        v,
        yMin,
        yMax,
        isHorizontal ? 0 : axisLength,
        isHorizontal ? axisLength : 0,
      ),
      text: formatYLabel ? formatYLabel(v) : String(v),
    }));
  }, [
    showValueAxis,
    yTicks,
    yMin,
    yMax,
    plotHeight,
    plotWidth,
    formatYLabel,
    isHorizontal,
  ]);

  // Hover
  const onActiveChangeRef = React.useRef(onActiveChange);
  React.useLayoutEffect(() => {
    onActiveChangeRef.current = onActiveChange;
  }, [onActiveChange]);

  React.useEffect(() => {
    onActiveChangeRef.current?.(
      activeIndex,
      activeIndex !== null && activeIndex < data.length
        ? data[activeIndex]
        : null,
    );
  }, [activeIndex, data]);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (data.length === 0 || categoryLength <= 0) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const raw = isHorizontal
        ? e.clientY - rect.top - PAD_TOP
        : e.clientX - rect.left - padLeft;
      const idx = Math.max(
        0,
        Math.min(data.length - 1, Math.floor(raw / slotSize)),
      );
      setActiveIndex((prev) => (prev === idx ? prev : idx));

      const tip = tooltipRef.current;
      if (tip) {
        if (isHorizontal) {
          const absY = PAD_TOP + (idx + 0.5) * slotSize;
          tip.style.top = `${absY}px`;
          tip.style.left = `${padLeft + plotWidth + 8}px`;
          tip.style.transform = "none";
        } else {
          const absX = padLeft + (idx + 0.5) * slotSize;
          const totalW = padLeft + plotWidth + padRight;
          tip.style.display = "";
          const tipW = tip.offsetWidth;
          const fitsRight = absX + TOOLTIP_GAP + tipW <= totalW;
          const fitsLeft = absX - TOOLTIP_GAP - tipW >= 0;
          const preferRight = raw <= categoryLength / 2;
          tip.style.left = `${absX}px`;
          tip.style.top = `${PAD_TOP}px`;
          if ((preferRight && fitsRight) || !fitsLeft) {
            tip.style.transform = `translateX(${TOOLTIP_GAP}px)`;
          } else {
            tip.style.transform = `translateX(calc(-100% - ${TOOLTIP_GAP}px))`;
          }
        }
        tip.style.display = "";
      }
    },
    [
      data.length,
      categoryLength,
      padLeft,
      padRight,
      slotSize,
      isHorizontal,
      plotWidth,
    ],
  );

  const handleMouseLeave = React.useCallback(() => {
    setActiveIndex(null);
    const tip = tooltipRef.current;
    if (tip) tip.style.display = "none";
  }, []);

  const fmtValue = React.useCallback(
    (v: number) => (formatValue ? formatValue(v) : String(v)),
    [formatValue],
  );

  const ready = width > 0;

  const svgDesc = React.useMemo(() => {
    if (series.length === 0 || data.length === 0) return undefined;
    const names = series.map((s) => s.label).join(", ");
    return `Bar chart with ${data.length} data points showing ${names}.`;
  }, [series, data.length]);

  const ariaLiveContent = React.useMemo(() => {
    if (activeIndex === null || activeIndex >= data.length) return "";
    const d = data[activeIndex];
    const parts: string[] = [];
    if (xKey) parts.push(formatChartDatumValue(d[xKey]));
    series.forEach((s) => {
      const v = Number(d[s.key]);
      parts.push(`${s.label}: ${isNaN(v) ? "no data" : fmtValue(v)}`);
    });
    return parts.join(", ");
  }, [activeIndex, data, series, xKey, fmtValue]);

  const handleTouch = React.useCallback(
    (e: React.TouchEvent<SVGSVGElement>) => {
      if (!e.touches[0]) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const raw = isHorizontal
        ? e.touches[0].clientY - rect.top - PAD_TOP
        : e.touches[0].clientX - rect.left - padLeft;
      const idx = Math.max(
        0,
        Math.min(data.length - 1, Math.floor(raw / slotSize)),
      );
      setActiveIndex(idx);
    },
    [data.length, slotSize, padLeft, isHorizontal],
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (data.length === 0) return;
      let next = activeIndex ?? -1;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          next = Math.min(data.length - 1, next + 1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          next = Math.max(0, next - 1);
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = data.length - 1;
          break;
        case "Enter":
        case " ":
          if (
            onClickDatum &&
            activeIndex !== null &&
            activeIndex < data.length
          ) {
            e.preventDefault();
            trackedClick(activeIndex, data[activeIndex]);
          }
          return;
        case "Escape":
          handleMouseLeave();
          return;
        default:
          return;
      }
      e.preventDefault();
      setActiveIndex(next);
      const tip = tooltipRef.current;
      if (tip) {
        if (isHorizontal) {
          tip.style.top = `${PAD_TOP + (next + 0.5) * slotSize}px`;
          tip.style.left = `${padLeft + plotWidth + 8}px`;
          tip.style.transform = "none";
        } else {
          const absX = padLeft + (next + 0.5) * slotSize;
          const totalW = padLeft + plotWidth + padRight;
          tip.style.display = "";
          const tipW = tip.offsetWidth;
          const fitsRight = absX + TOOLTIP_GAP + tipW <= totalW;
          const fitsLeft = absX - TOOLTIP_GAP - tipW >= 0;
          const preferRight = next < data.length / 2;
          tip.style.left = `${absX}px`;
          tip.style.top = `${PAD_TOP}px`;
          if ((preferRight && fitsRight) || !fitsLeft) {
            tip.style.transform = `translateX(${TOOLTIP_GAP}px)`;
          } else {
            tip.style.transform = `translateX(calc(-100% - ${TOOLTIP_GAP}px))`;
          }
        }
        tip.style.display = "";
      }
    },
    [
      activeIndex,
      data,
      slotSize,
      padLeft,
      padRight,
      plotWidth,
      isHorizontal,
      onClickDatum,
      trackedClick,
      handleMouseLeave,
    ],
  );

  const interactive = interactiveProp;

  const handleClick = React.useCallback(() => {
    if (onClickDatum && activeIndex !== null && activeIndex < data.length) {
      trackedClick(activeIndex, data[activeIndex]);
    }
  }, [onClickDatum, activeIndex, data, trackedClick]);

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
      ariaLiveContent={interactiveProp ? ariaLiveContent : undefined}
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
              aria-roledescription="Bar chart"
              aria-label={ariaLabel ?? svgDesc ?? "Bar chart"}
              width={width}
              height={height}
              className={styles.svg}
              tabIndex={interactive ? 0 : undefined}
              onMouseMove={interactive ? handleMouseMove : undefined}
              onMouseLeave={interactive ? handleMouseLeave : undefined}
              onTouchStart={interactive ? handleTouch : undefined}
              onTouchMove={interactive ? handleTouch : undefined}
              onTouchEnd={interactive ? handleMouseLeave : undefined}
              onTouchCancel={interactive ? handleMouseLeave : undefined}
              onKeyDown={interactive ? handleKeyDown : undefined}
              onClick={onClickDatum ? handleClick : undefined}
            >
              {svgDesc && <desc>{svgDesc}</desc>}

              <g transform={`translate(${padLeft},${PAD_TOP})`}>
                {/* Grid lines along value axis */}
                {grid &&
                  valueLabels.map(({ pos }, i) =>
                    isHorizontal ? (
                      <line
                        key={i}
                        x1={pos}
                        y1={0}
                        x2={pos}
                        y2={plotHeight}
                        className={styles.gridLine}
                      />
                    ) : (
                      <line
                        key={i}
                        x1={0}
                        y1={pos}
                        x2={plotWidth}
                        y2={pos}
                        className={styles.gridLine}
                      />
                    ),
                  )}

                {/* Reference bands */}
                {referenceBands?.map((rb, i) => {
                  const bandColor = rb.color ?? "var(--stroke-primary)";
                  if (isHorizontal) {
                    const x1 = linearScale(rb.from, yMin, yMax, 0, plotWidth);
                    const x2 = linearScale(rb.to, yMin, yMax, 0, plotWidth);
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
                  if (rb.axis === "x") {
                    const bx1 = data.length > 0 ? rb.from * slotSize : 0;
                    const bx2 = data.length > 0 ? rb.to * slotSize : plotWidth;
                    const bx = Math.min(bx1, bx2);
                    const bw = Math.abs(bx2 - bx1);
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
                  if (isHorizontal) {
                    const rx = linearScale(rl.value, yMin, yMax, 0, plotWidth);
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

                {/* Hover highlight */}
                {activeIndex !== null &&
                  (isHorizontal ? (
                    <rect
                      x={0}
                      y={activeIndex * slotSize + (slotSize - groupSize) / 2}
                      width={plotWidth}
                      height={groupSize}
                      fill="var(--text-primary)"
                      fillOpacity={0.03}
                    />
                  ) : (
                    <rect
                      x={activeIndex * slotSize + (slotSize - groupSize) / 2}
                      y={0}
                      width={groupSize}
                      height={plotHeight}
                      fill="var(--text-primary)"
                      fillOpacity={0.03}
                    />
                  ))}

                {/* Bars */}
                {data.map((d, di) => {
                  const slotStart = di * slotSize + (slotSize - groupSize) / 2;
                  const delay = Math.min(di * 40, 400);

                  if (stacked) {
                    let cum = 0;
                    return (
                      <g key={di}>
                        {series.map((s) => {
                          const v = Number(d[s.key]) || 0;
                          cum += v;
                          const barFill =
                            getBarColor?.(d, di, s.key) ?? s.color;
                          if (isHorizontal) {
                            const barW =
                              ((v - yMin) / (yMax - yMin)) * plotWidth;
                            const barX = linearScale(
                              cum - v,
                              yMin,
                              yMax,
                              0,
                              plotWidth,
                            );
                            return (
                              <rect
                                key={s.key}
                                x={barX}
                                y={slotStart}
                                width={Math.max(0, barW)}
                                height={barThickness}
                                fill={barFill}
                                role="graphics-symbol img"
                                aria-roledescription="Bar"
                                aria-label={`${s.label}: ${fmtValue(v)}`}
                                className={animate ? barAnimClass : undefined}
                                style={
                                  animate
                                    ? { animationDelay: `${delay}ms` }
                                    : undefined
                                }
                              />
                            );
                          }
                          const barH =
                            ((v - yMin) / (yMax - yMin)) * plotHeight;
                          const barY = linearScale(
                            cum,
                            yMin,
                            yMax,
                            plotHeight,
                            0,
                          );
                          return (
                            <rect
                              key={s.key}
                              x={slotStart}
                              y={barY}
                              width={barThickness}
                              height={Math.max(0, barH)}
                              fill={barFill}
                              role="graphics-symbol img"
                              aria-roledescription="Bar"
                              aria-label={`${s.label}: ${fmtValue(v)}`}
                              className={animate ? barAnimClass : undefined}
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
                  }

                  return (
                    <g key={di}>
                      {series.map((s, si) => {
                        const v = Number(d[s.key]) || 0;
                        const barFill = getBarColor?.(d, di, s.key) ?? s.color;
                        const barOffset =
                          slotStart + si * (barThickness + BAR_ITEM_GAP);
                        if (isHorizontal) {
                          const barW = ((v - yMin) / (yMax - yMin)) * plotWidth;
                          return (
                            <rect
                              key={s.key}
                              x={0}
                              y={barOffset}
                              width={Math.max(0, barW)}
                              height={barThickness}
                              fill={barFill}
                              role="graphics-symbol img"
                              aria-roledescription="Bar"
                              aria-label={`${s.label}: ${fmtValue(v)}`}
                              className={animate ? barAnimClass : undefined}
                              style={
                                animate
                                  ? { animationDelay: `${delay}ms` }
                                  : undefined
                              }
                            />
                          );
                        }
                        const barH = ((v - yMin) / (yMax - yMin)) * plotHeight;
                        const barY = plotHeight - barH;
                        return (
                          <rect
                            key={s.key}
                            x={barOffset}
                            y={barY}
                            width={barThickness}
                            height={Math.max(0, barH)}
                            fill={barFill}
                            role="graphics-symbol img"
                            aria-roledescription="Bar"
                            aria-label={`${s.label}: ${fmtValue(v)}`}
                            className={animate ? barAnimClass : undefined}
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

                {/* Value axis labels */}
                {valueLabels.map(({ pos, text }, i) =>
                  isHorizontal ? (
                    <text
                      key={i}
                      x={pos}
                      y={plotHeight + 20}
                      className={styles.axisLabel}
                      textAnchor="middle"
                      dominantBaseline="auto"
                    >
                      {text}
                    </text>
                  ) : (
                    <text
                      key={i}
                      x={-8}
                      y={pos}
                      className={styles.axisLabel}
                      textAnchor="end"
                      dominantBaseline="middle"
                    >
                      {text}
                    </text>
                  ),
                )}

                {/* Category axis labels (thinned to avoid overlap) */}
                {xKey &&
                  (() => {
                    const maxLabels = isHorizontal
                      ? Math.max(2, Math.floor(plotHeight / 24))
                      : Math.max(2, Math.floor(plotWidth / 60));
                    const indices = thinIndices(data.length, maxLabels);
                    return indices.map((i) =>
                      isHorizontal ? (
                        <text
                          key={i}
                          x={-8}
                          y={(i + 0.5) * slotSize}
                          className={styles.axisLabel}
                          textAnchor="end"
                          dominantBaseline="middle"
                        >
                          {formatXLabel
                            ? formatXLabel(data[i][xKey])
                            : formatChartDatumValue(data[i][xKey])}
                        </text>
                      ) : (
                        <text
                          key={i}
                          x={(i + 0.5) * slotSize}
                          y={plotHeight + 20}
                          className={styles.axisLabel}
                          textAnchor="middle"
                          dominantBaseline="auto"
                        >
                          {formatXLabel
                            ? formatXLabel(data[i][xKey])
                            : formatChartDatumValue(data[i][xKey])}
                        </text>
                      ),
                    );
                  })()}
              </g>
            </svg>

            {showTooltip && (
              <div
                ref={tooltipRef}
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
                {activeIndex !== null &&
                  activeIndex < data.length &&
                  (tooltipMode === "custom" && tooltipRender ? (
                    tooltipRender(data[activeIndex], series)
                  ) : tooltipMode === "simple" ? (
                    xKey && (
                      <span className={styles.tooltipInlineTime}>
                        {formatXLabel
                          ? formatXLabel(data[activeIndex][xKey])
                          : formatChartDatumValue(data[activeIndex][xKey])}
                      </span>
                    )
                  ) : tooltipMode === "compact" ? (
                    <>
                      {series.map((s, i) => {
                        const v = Number(data[activeIndex][s.key]);
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
                              ? formatXLabel(data[activeIndex][xKey])
                              : formatChartDatumValue(data[activeIndex][xKey])}
                          </span>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {xKey && (
                        <p className={styles.tooltipLabel}>
                          {formatXLabel
                            ? formatXLabel(data[activeIndex][xKey])
                            : formatChartDatumValue(data[activeIndex][xKey])}
                        </p>
                      )}
                      <div className={styles.tooltipItems}>
                        {series.map((s) => {
                          const v = Number(data[activeIndex][s.key]);
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
                        {stacked && series.length > 1 && (
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
                                    (Number(data[activeIndex][s.key]) || 0),
                                  0,
                                ),
                              )}
                            </span>
                          </div>
                        )}
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
  Bar.displayName = "Chart.Bar";
}
