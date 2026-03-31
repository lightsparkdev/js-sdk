"use client";

import * as React from "react";
import clsx from "clsx";
import { linearScale, niceTicks, thinIndices, axisPadForLabels } from "./utils";
import { useResizeWidth } from "./hooks";
import { useMergedRef } from "./useMergedRef";
import {
  type TooltipProp,
  PAD_TOP,
  PAD_RIGHT,
  PAD_BOTTOM_AXIS,
  TOOLTIP_GAP,
  axisTickTarget,
} from "./types";
import { ChartWrapper } from "./ChartWrapper";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import styles from "./Chart.module.scss";

export interface WaterfallSegment {
  key?: string;
  label: string;
  value: number;
  type?: "increase" | "decrease" | "total";
  color?: string;
}

export interface WaterfallChartProps
  extends React.ComponentPropsWithoutRef<"div"> {
  data: WaterfallSegment[];
  /**
   * Pre-measurement width in pixels. Used as a fallback before
   * ResizeObserver fires, enabling server-side rendering.
   */
  initialWidth?: number;
  formatValue?: (value: number) => string;
  formatYLabel?: (value: number) => string;
  showConnectors?: boolean;
  showValues?: boolean;
  height?: number;
  grid?: boolean;
  animate?: boolean;
  tooltip?: TooltipProp;
  loading?: boolean;
  empty?: React.ReactNode;
  ariaLabel?: string;
  onClickDatum?: (index: number, segment: WaterfallSegment) => void;
  onActiveChange?: (index: number | null) => void;
  analyticsName?: string;
  /** Disables interaction, cursor, dots, and tooltip. */
  interactive?: boolean;
}

interface ComputedBar {
  y0: number;
  y1: number;
  runningTotal: number;
  segmentType: "increase" | "decrease" | "total";
  fill: string;
}

function resolveType(seg: WaterfallSegment): "increase" | "decrease" | "total" {
  if (seg.type) return seg.type;
  return seg.value >= 0 ? "increase" : "decrease";
}

const DEFAULT_COLORS: Record<string, string> = {
  increase: "var(--color-green-500)",
  decrease: "var(--color-red-500)",
  total: "var(--color-blue-500)",
};

const clickIndexMeta = (index: number) => ({ index });

export const Waterfall = React.forwardRef<HTMLDivElement, WaterfallChartProps>(
  function Waterfall(
    {
      data,
      formatValue,
      formatYLabel,
      showConnectors = true,
      showValues = false,
      height = 300,
      grid = false,
      animate = true,
      tooltip: tooltipProp = false,
      loading,
      empty,
      ariaLabel,
      onClickDatum,
      onActiveChange,
      analyticsName,
      interactive: interactiveProp = true,
      initialWidth,
      className,
      ...props
    },
    ref,
  ) {
    const { width, attachRef } = useResizeWidth(initialWidth);
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

    const onActiveChangeRef = React.useRef(onActiveChange);
    React.useLayoutEffect(() => {
      onActiveChangeRef.current = onActiveChange;
    }, [onActiveChange]);

    React.useEffect(() => {
      onActiveChangeRef.current?.(activeIndex);
    }, [activeIndex]);

    const mergedRef = useMergedRef(ref, attachRef);

    const trackedClick = useTrackedCallback(
      analyticsName,
      "Chart.Waterfall",
      "click",
      onClickDatum,
      onClickDatum ? clickIndexMeta : undefined,
    );

    const bars = React.useMemo<ComputedBar[]>(() => {
      let running = 0;
      return data.map((seg) => {
        const segType = resolveType(seg);
        const fill = seg.color ?? DEFAULT_COLORS[segType];

        if (segType === "total") {
          const bar: ComputedBar = {
            y0: 0,
            y1: running,
            runningTotal: running,
            segmentType: segType,
            fill,
          };
          return bar;
        }

        const prevRunning = running;
        running += seg.value;
        return {
          y0: prevRunning,
          y1: running,
          runningTotal: running,
          segmentType: segType,
          fill,
        };
      });
    }, [data]);

    const padBottom = PAD_BOTTOM_AXIS;
    const plotHeight = Math.max(0, height - PAD_TOP - padBottom);

    const allValues = React.useMemo(() => {
      const vals: number[] = [0];
      for (const bar of bars) {
        vals.push(bar.y0, bar.y1);
      }
      return vals;
    }, [bars]);

    const tickTarget = axisTickTarget(plotHeight);
    const { yMin, yMax, yTicks } = React.useMemo(() => {
      const dataMin = Math.min(...allValues);
      const dataMax = Math.max(...allValues);
      const result = niceTicks(dataMin, dataMax, tickTarget);
      return { yMin: result.min, yMax: result.max, yTicks: result.ticks };
    }, [allValues, tickTarget]);

    const padLeft = React.useMemo(() => {
      if (!grid) return 0;
      const fmt = formatYLabel ?? ((v: number) => String(v));
      return axisPadForLabels(yTicks.map(fmt));
    }, [grid, yTicks, formatYLabel]);

    const plotWidth = Math.max(0, width - padLeft - PAD_RIGHT);

    const slotSize = data.length > 0 ? plotWidth / data.length : 0;
    const barWidth = slotSize * 0.6;

    const valueLabels = React.useMemo(() => {
      if (!grid) return [];
      if (plotHeight <= 0) return [];
      const fmt = formatYLabel ?? ((v: number) => String(v));
      return yTicks.map((v) => ({
        pos: linearScale(v, yMin, yMax, plotHeight, 0),
        text: fmt(v),
      }));
    }, [grid, yTicks, yMin, yMax, plotHeight, formatYLabel]);

    const fmtValue = React.useCallback(
      (v: number) => (formatValue ? formatValue(v) : String(v)),
      [formatValue],
    );

    const handleMouseMove = React.useCallback(
      (e: React.MouseEvent<SVGSVGElement>) => {
        if (data.length === 0 || plotWidth <= 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const raw = e.clientX - rect.left - padLeft;
        const idx = Math.max(
          0,
          Math.min(data.length - 1, Math.floor(raw / slotSize)),
        );
        setActiveIndex((prev) => (prev === idx ? prev : idx));

        const tip = tooltipRef.current;
        if (tip) {
          const absX = padLeft + (idx + 0.5) * slotSize;
          const isLeftHalf = raw <= plotWidth / 2;
          tip.style.left = `${absX}px`;
          tip.style.top = `${PAD_TOP}px`;
          tip.style.transform = isLeftHalf
            ? `translateX(${TOOLTIP_GAP}px)`
            : `translateX(calc(-100% - ${TOOLTIP_GAP}px))`;
          tip.style.display = "";
        }
      },
      [data.length, plotWidth, padLeft, slotSize],
    );

    const handleMouseLeave = React.useCallback(() => {
      setActiveIndex(null);
      const tip = tooltipRef.current;
      if (tip) tip.style.display = "none";
    }, []);

    const handleTouch = React.useCallback(
      (e: React.TouchEvent<SVGSVGElement>) => {
        if (!e.touches[0]) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const raw = e.touches[0].clientX - rect.left - padLeft;
        const idx = Math.max(
          0,
          Math.min(data.length - 1, Math.floor(raw / slotSize)),
        );
        setActiveIndex(idx);
      },
      [data.length, slotSize, padLeft],
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
          const absX = padLeft + (next + 0.5) * slotSize;
          tip.style.left = `${absX}px`;
          tip.style.top = `${PAD_TOP}px`;
          tip.style.transform =
            next < data.length / 2
              ? `translateX(${TOOLTIP_GAP}px)`
              : `translateX(calc(-100% - ${TOOLTIP_GAP}px))`;
          tip.style.display = "";
        }
      },
      [
        activeIndex,
        data,
        slotSize,
        padLeft,
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

    const ready = width > 0;

    const svgDesc = React.useMemo(() => {
      if (data.length === 0) return undefined;
      return `Waterfall chart with ${data.length} segments.`;
    }, [data.length]);

    const xLabelIndices = React.useMemo(() => {
      const maxLabels = Math.max(2, Math.floor(plotWidth / 60));
      return thinIndices(data.length, maxLabels);
    }, [data.length, plotWidth]);

    return (
      <ChartWrapper
        ref={mergedRef}
        loading={loading}
        empty={empty}
        dataLength={data.length}
        height={height}
        className={className}
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
                aria-roledescription="Waterfall chart"
                aria-label={ariaLabel ?? svgDesc ?? "Waterfall chart"}
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
                  {grid &&
                    valueLabels.map(({ pos }, i) => (
                      <line
                        key={i}
                        x1={0}
                        y1={pos}
                        x2={plotWidth}
                        y2={pos}
                        className={styles.gridLine}
                      />
                    ))}

                  {activeIndex !== null && (
                    <rect
                      x={activeIndex * slotSize + (slotSize - barWidth) / 2}
                      y={0}
                      width={barWidth}
                      height={plotHeight}
                      fill="var(--text-primary)"
                      fillOpacity={0.03}
                    />
                  )}

                  {showConnectors &&
                    bars.map((bar, i) => {
                      if (i >= bars.length - 1) return null;
                      const endValue = bar.y1;
                      const connectorY = linearScale(
                        endValue,
                        yMin,
                        yMax,
                        plotHeight,
                        0,
                      );
                      const x1 = (i + 0.5) * slotSize + barWidth / 2;
                      const x2 = (i + 1 + 0.5) * slotSize - barWidth / 2;
                      return (
                        <line
                          key={`c-${i}`}
                          x1={x1}
                          y1={connectorY}
                          x2={x2}
                          y2={connectorY}
                          stroke="var(--text-tertiary)"
                          strokeOpacity={0.3}
                          strokeWidth={1}
                          strokeDasharray="2 2"
                          className={styles.waterfallConnector}
                        />
                      );
                    })}

                  {bars.map((bar, i) => {
                    const topVal = Math.max(bar.y0, bar.y1);
                    const bottomVal = Math.min(bar.y0, bar.y1);
                    const yTop = linearScale(topVal, yMin, yMax, plotHeight, 0);
                    const yBottom = linearScale(
                      bottomVal,
                      yMin,
                      yMax,
                      plotHeight,
                      0,
                    );
                    const barH = Math.max(1, yBottom - yTop);
                    const barX = (i + 0.5) * slotSize - barWidth / 2;
                    const delay = Math.min(i * 40, 400);

                    return (
                      <rect
                        key={i}
                        x={barX}
                        y={yTop}
                        width={barWidth}
                        height={barH}
                        fill={bar.fill}
                        role="graphics-symbol img"
                        aria-roledescription="Bar"
                        aria-label={`${data[i].label}: ${fmtValue(
                          data[i].value,
                        )}`}
                        className={animate ? styles.barAnimate : undefined}
                        style={
                          animate ? { animationDelay: `${delay}ms` } : undefined
                        }
                      />
                    );
                  })}

                  {showValues &&
                    bars.map((bar, i) => {
                      const seg = data[i];
                      const val =
                        bar.segmentType === "total" ? bar.y1 : seg.value;
                      const topVal = Math.max(bar.y0, bar.y1);
                      const bottomVal = Math.min(bar.y0, bar.y1);
                      const isNeg =
                        bar.segmentType === "decrease" || seg.value < 0;
                      const labelY =
                        isNeg && bar.segmentType !== "total"
                          ? linearScale(bottomVal, yMin, yMax, plotHeight, 0) +
                            14
                          : linearScale(topVal, yMin, yMax, plotHeight, 0) - 6;

                      return (
                        <text
                          key={`v-${i}`}
                          x={(i + 0.5) * slotSize}
                          y={labelY}
                          className={clsx(
                            styles.axisLabel,
                            styles.waterfallValue,
                          )}
                          textAnchor="middle"
                          dominantBaseline="auto"
                        >
                          {fmtValue(val)}
                        </text>
                      );
                    })}

                  {grid &&
                    valueLabels.map(({ pos, text }, i) => (
                      <text
                        key={`yl-${i}`}
                        x={-8}
                        y={pos}
                        className={styles.axisLabel}
                        textAnchor="end"
                        dominantBaseline="middle"
                      >
                        {text}
                      </text>
                    ))}

                  {xLabelIndices.map((i) => (
                    <text
                      key={`xl-${i}`}
                      x={(i + 0.5) * slotSize}
                      y={plotHeight + 20}
                      className={styles.axisLabel}
                      textAnchor="middle"
                      dominantBaseline="auto"
                    >
                      {data[i].label}
                    </text>
                  ))}
                </g>
              </svg>

              {tooltipProp && (
                <div
                  ref={tooltipRef}
                  className={styles.tooltip}
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
                    (typeof tooltipProp === "function" ? (
                      tooltipProp(
                        {
                          label: data[activeIndex].label,
                          value: data[activeIndex].value,
                          type: bars[activeIndex].segmentType,
                          runningTotal: bars[activeIndex].runningTotal,
                        },
                        [],
                      )
                    ) : (
                      <>
                        <p className={styles.tooltipLabel}>
                          {data[activeIndex].label}
                        </p>
                        <div className={styles.tooltipItems}>
                          <div className={styles.tooltipItem}>
                            <span
                              className={styles.tooltipIndicator}
                              style={{
                                backgroundColor: bars[activeIndex].fill,
                              }}
                            />
                            <span className={styles.tooltipName}>
                              {bars[activeIndex].segmentType === "total"
                                ? "Total"
                                : "Change"}
                            </span>
                            <span className={styles.tooltipValue}>
                              {fmtValue(
                                bars[activeIndex].segmentType === "total"
                                  ? bars[activeIndex].y1
                                  : data[activeIndex].value,
                              )}
                            </span>
                          </div>
                          <div
                            className={clsx(
                              styles.tooltipItem,
                              styles.tooltipFooter,
                            )}
                          >
                            <span className={styles.tooltipName}>
                              Running total
                            </span>
                            <span className={styles.tooltipValue}>
                              {fmtValue(bars[activeIndex].runningTotal)}
                            </span>
                          </div>
                        </div>
                      </>
                    ))}
                </div>
              )}
            </>
          )}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={styles.srOnly}
          >
            {activeIndex !== null && activeIndex < data.length
              ? `${data[activeIndex].label}: ${fmtValue(
                  data[activeIndex].value,
                )}`
              : ""}
          </div>
        </div>
      </ChartWrapper>
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Waterfall.displayName = "Chart.Waterfall";
}
