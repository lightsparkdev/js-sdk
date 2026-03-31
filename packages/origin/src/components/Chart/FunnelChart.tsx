"use client";

import * as React from "react";
import clsx from "clsx";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import { useResizeWidth } from "./hooks";
import { useMergedRef } from "./useMergedRef";
import { SERIES_COLORS } from "./types";
import { ChartWrapper } from "./ChartWrapper";
import styles from "./Chart.module.scss";

export interface FunnelStage {
  key?: string;
  label: string;
  value: number;
  color?: string;
}

export interface FunnelChartProps
  extends React.ComponentPropsWithoutRef<"div"> {
  data: FunnelStage[];
  /**
   * Pre-measurement width in pixels. Used as a fallback before
   * ResizeObserver fires, enabling server-side rendering.
   */
  initialWidth?: number;
  formatValue?: (value: number) => string;
  formatRate?: (rate: number) => string;
  showRates?: boolean;
  showLabels?: boolean;
  grid?: boolean;
  height?: number;
  animate?: boolean;
  loading?: boolean;
  empty?: React.ReactNode;
  ariaLabel?: string;
  tooltip?: boolean;
  onClickDatum?: (index: number, stage: FunnelStage) => void;
  onActiveChange?: (index: number | null) => void;
  analyticsName?: string;
}

const PAD = 8;
const LABEL_ROW_HEIGHT = 18;
const LABEL_GAP = 6;

const rd = (n: number) => Math.round(n * 100) / 100;

const clickIndexMeta = (index: number) => ({ index });

export const Funnel = React.forwardRef<HTMLDivElement, FunnelChartProps>(
  function Funnel(
    {
      data,
      formatValue,
      formatRate,
      showRates = true,
      showLabels = true,
      grid = true,
      height = 140,
      animate = true,
      tooltip = true,
      loading,
      empty,
      ariaLabel,
      onClickDatum,
      onActiveChange,
      analyticsName,
      initialWidth,
      className,
      ...props
    },
    ref,
  ) {
    const { width, attachRef } = useResizeWidth(initialWidth);
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

    const onActiveChangeRef = React.useRef(onActiveChange);
    React.useLayoutEffect(() => {
      onActiveChangeRef.current = onActiveChange;
    }, [onActiveChange]);

    React.useEffect(() => {
      onActiveChangeRef.current?.(activeIndex);
    }, [activeIndex]);

    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const rootRef = React.useRef<HTMLDivElement | null>(null);

    const trackedClick = useTrackedCallback(
      analyticsName,
      "Chart.Funnel",
      "click",
      onClickDatum,
      onClickDatum ? clickIndexMeta : undefined,
    );

    const resizeRef = useMergedRef(ref, attachRef);
    const mergedRef = useMergedRef(resizeRef, rootRef);

    const fmtValue = React.useCallback(
      (v: number) => (formatValue ? formatValue(v) : String(v)),
      [formatValue],
    );

    const fmtRate = React.useCallback(
      (r: number) => (formatRate ? formatRate(r) : `${Math.round(r * 100)}%`),
      [formatRate],
    );

    const plotWidth = Math.max(0, width - PAD * 2);
    const stageWidth = data.length > 0 ? plotWidth / data.length : 0;

    const dense = stageWidth < 60;
    const effectiveShowLabels = showLabels && !dense;
    const effectiveShowGrid = grid && !dense;

    const labelSpace = effectiveShowLabels ? LABEL_ROW_HEIGHT + LABEL_GAP : 0;
    const plotHeight = Math.max(0, height - PAD * 2 - labelSpace);
    const centerY = PAD + plotHeight / 2;
    const maxValue = data.length > 0 ? data[0].value : 0;

    const flatRatio = stageWidth >= 100 ? 0.55 : stageWidth >= 60 ? 0.7 : 0.85;

    const stageColors = React.useMemo(
      () =>
        data.map((d, i) => d.color ?? SERIES_COLORS[i % SERIES_COLORS.length]),
      [data],
    );

    const stagePaths = React.useMemo(() => {
      if (data.length === 0 || plotWidth <= 0 || plotHeight <= 0) return [];

      return data.map((stage, i) => {
        const lH = maxValue > 0 ? (stage.value / maxValue) * plotHeight : 0;
        const isLast = i === data.length - 1;
        const rH = isLast
          ? lH
          : maxValue > 0
          ? (data[i + 1].value / maxValue) * plotHeight
          : 0;

        const x0 = rd(PAD + i * stageWidth);
        const x1 = rd(x0 + stageWidth);

        const topL = rd(centerY - lH / 2);
        const botL = rd(centerY + lH / 2);
        const topR = rd(centerY - rH / 2);
        const botR = rd(centerY + rH / 2);

        if (isLast) {
          return `M${x0},${topL} L${x1},${topL} L${x1},${botL} L${x0},${botL} Z`;
        }

        const flat = rd(x0 + stageWidth * flatRatio);
        const tw = stageWidth * (1 - flatRatio);
        const cp1x = rd(flat + tw * 0.45);
        const cp2x = rd(x1 - tw * 0.15);

        return [
          `M${x0},${topL}`,
          `L${flat},${topL}`,
          `C${cp1x},${topL} ${cp2x},${topR} ${x1},${topR}`,
          `L${x1},${botR}`,
          `C${cp2x},${botR} ${cp1x},${botL} ${flat},${botL}`,
          `L${x0},${botL}`,
          "Z",
        ].join(" ");
      });
    }, [data, maxValue, plotWidth, plotHeight, stageWidth, centerY, flatRatio]);

    const svgDesc = React.useMemo(() => {
      if (data.length === 0) return undefined;
      const parts = data.map((d, i) => {
        const rate =
          i > 0 && data[0].value > 0
            ? ` (${fmtRate(d.value / data[0].value)})`
            : "";
        return `${d.label}: ${fmtValue(d.value)}${rate}`;
      });
      return `Funnel chart with ${data.length} stages. ${parts.join(", ")}.`;
    }, [data, fmtValue, fmtRate]);

    const tooltipContent = React.useMemo(() => {
      if (activeIndex === null || activeIndex >= data.length) return null;
      const stage = data[activeIndex];
      const rate =
        showRates && data[0].value > 0
          ? fmtRate(stage.value / data[0].value)
          : null;
      return { label: stage.label, value: fmtValue(stage.value), rate };
    }, [activeIndex, data, fmtValue, fmtRate, showRates]);

    const positionTooltip = React.useCallback(
      (e: React.MouseEvent) => {
        const tip = tooltipRef.current;
        const root = rootRef.current;
        if (!tip || !root) return;
        const rect = root.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        tip.style.display = "";
        const tipW = tip.offsetWidth;
        const gap = 12;
        const fitsRight = x + gap + tipW <= width;
        const fitsLeft = x - gap - tipW >= 0;
        const preferRight = x <= width / 2;
        tip.style.left = `${x}px`;
        tip.style.top = `${y}px`;
        if ((preferRight && fitsRight) || !fitsLeft) {
          tip.style.transform = `translate(${gap}px, -50%)`;
        } else {
          tip.style.transform = `translate(calc(-100% - ${gap}px), -50%)`;
        }
      },
      [width],
    );

    const handleMouseLeave = React.useCallback(() => {
      setActiveIndex(null);
      const tip = tooltipRef.current;
      if (tip) tip.style.display = "none";
    }, []);

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
          const x = PAD + next * stageWidth + (stageWidth * flatRatio) / 2;
          const gap = 12;
          tip.style.left = `${x}px`;
          tip.style.top = `${centerY}px`;
          const tipW = tip.offsetWidth;
          const fitsRight = x + gap + tipW <= width;
          tip.style.transform = fitsRight
            ? `translate(${gap}px, -50%)`
            : `translate(calc(-100% - ${gap}px), -50%)`;
          tip.style.display = "";
        }
      },
      [
        activeIndex,
        data,
        stageWidth,
        flatRatio,
        centerY,
        width,
        onClickDatum,
        trackedClick,
        handleMouseLeave,
      ],
    );

    const ready = width > 0;

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
                aria-roledescription="Funnel chart"
                aria-label={ariaLabel ?? svgDesc ?? "Funnel chart"}
                width={width}
                height={height}
                className={styles.svg}
                tabIndex={0}
                onMouseLeave={handleMouseLeave}
                onTouchEnd={handleMouseLeave}
                onTouchCancel={handleMouseLeave}
                onKeyDown={handleKeyDown}
              >
                {svgDesc && <desc>{svgDesc}</desc>}

                {effectiveShowGrid &&
                  data.length > 1 &&
                  data.slice(1).map((_, i) => {
                    const x = rd(PAD + (i + 1) * stageWidth);
                    return (
                      <line
                        key={`grid-${i}`}
                        x1={x}
                        y1={PAD}
                        x2={x}
                        y2={PAD + plotHeight}
                        className={styles.gridLine}
                      />
                    );
                  })}

                {stagePaths.map((d, i) => (
                  <path
                    key={data[i].key ?? i}
                    d={d}
                    fill={stageColors[i]}
                    className={animate ? styles.funnelFlowAnimate : undefined}
                    style={
                      animate
                        ? { animationDelay: `${Math.min(i * 80, 400)}ms` }
                        : undefined
                    }
                    onMouseEnter={(e) => {
                      setActiveIndex(i);
                      positionTooltip(e);
                    }}
                    onMouseMove={positionTooltip}
                    onMouseLeave={handleMouseLeave}
                    onClick={
                      onClickDatum ? () => trackedClick(i, data[i]) : undefined
                    }
                    cursor={onClickDatum ? "pointer" : undefined}
                    role="graphics-symbol"
                    aria-roledescription="Stage"
                    aria-label={`${data[i].label}: ${fmtValue(data[i].value)}`}
                  />
                ))}

                {effectiveShowLabels &&
                  data.map((stage, i) => {
                    const x = rd(
                      PAD + i * stageWidth + (stageWidth * flatRatio) / 2,
                    );
                    const y = rd(
                      PAD + plotHeight + LABEL_GAP + LABEL_ROW_HEIGHT / 2,
                    );
                    return (
                      <text
                        key={`lbl-${stage.key ?? i}`}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className={styles.axisLabel}
                      >
                        {stage.label}
                      </text>
                    );
                  })}
              </svg>

              {tooltip !== false && (
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
                  {tooltipContent && (
                    <div className={styles.tooltipItems}>
                      <div className={styles.tooltipItem}>
                        <span className={styles.tooltipName}>
                          {tooltipContent.label}
                        </span>
                        <span className={styles.tooltipValue}>
                          {tooltipContent.value}
                        </span>
                      </div>
                      {tooltipContent.rate && (
                        <div className={styles.tooltipItem}>
                          <span className={styles.tooltipName}>Rate</span>
                          <span className={styles.tooltipValue}>
                            {tooltipContent.rate}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className={styles.srOnly}
              >
                {tooltipContent
                  ? `${tooltipContent.label}: ${tooltipContent.value}${
                      tooltipContent.rate ? ` (${tooltipContent.rate})` : ""
                    }`
                  : ""}
              </div>
            </>
          )}
        </div>
      </ChartWrapper>
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Funnel.displayName = "Chart.Funnel";
}
