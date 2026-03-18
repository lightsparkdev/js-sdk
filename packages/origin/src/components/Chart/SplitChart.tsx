"use client";

import * as React from "react";
import clsx from "clsx";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import { SERIES_COLORS } from "./types";
import { ChartWrapper } from "./ChartWrapper";
import styles from "./Chart.module.scss";

export interface SplitSegment {
  key?: string;
  label: string;
  value: number;
  color?: string;
}

export interface SplitChartProps extends React.ComponentPropsWithoutRef<"div"> {
  data: SplitSegment[];
  /**
   * Display variant. `default` shows a dot legend; `detailed` shows formatted value and percentage
   * per segment.
   */
  variant?: "default" | "detailed";
  formatValue?: (value: number) => string;
  showPercentage?: boolean;
  showValues?: boolean;
  height?: number;
  legend?: boolean;
  loading?: boolean;
  empty?: React.ReactNode;
  ariaLabel?: string;
  onClickDatum?: (segment: SplitSegment, index: number) => void;
  onActiveChange?: (index: number | null) => void;
  analyticsName?: string;
}

const splitClickMeta = (_segment: SplitSegment, index: number) => ({ index });

export const Split = React.forwardRef<HTMLDivElement, SplitChartProps>(
  function Split(
    {
      data,
      variant = "default",
      formatValue,
      showPercentage = true,
      showValues = false,
      height = 24,
      legend = true,
      loading,
      empty,
      ariaLabel,
      onClickDatum,
      onActiveChange,
      analyticsName,
      className,
      ...props
    },
    ref,
  ) {
    const trackedClickDatum = useTrackedCallback(
      analyticsName,
      "Chart.Split",
      "click",
      onClickDatum,
      onClickDatum ? splitClickMeta : undefined,
    );

    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

    const onActiveChangeRef = React.useRef(onActiveChange);
    React.useLayoutEffect(() => {
      onActiveChangeRef.current = onActiveChange;
    }, [onActiveChange]);

    React.useEffect(() => {
      onActiveChangeRef.current?.(activeIndex);
    }, [activeIndex]);

    const barRef = React.useRef<HTMLDivElement>(null);

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
          case "Escape":
            setActiveIndex(null);
            return;
          case "Enter":
          case " ":
            if (
              onClickDatum &&
              activeIndex !== null &&
              activeIndex < data.length
            ) {
              e.preventDefault();
              trackedClickDatum(data[activeIndex], activeIndex);
            }
            return;
          default:
            return;
        }
        e.preventDefault();
        setActiveIndex(next);
      },
      [activeIndex, data, onClickDatum, trackedClickDatum],
    );

    const total = data.reduce((sum, d) => sum + d.value, 0);
    const fmtValue = (v: number) => (formatValue ? formatValue(v) : String(v));

    const segments = data.map((d, i) => ({
      ...d,
      color: d.color ?? SERIES_COLORS[i % SERIES_COLORS.length],
      pct: total > 0 ? (d.value / total) * 100 : 0,
    }));

    const desc =
      ariaLabel ??
      `Distribution: ${segments
        .map((s) => `${s.label} ${Math.round(s.pct)}%`)
        .join(", ")}`;

    return (
      <ChartWrapper
        ref={ref}
        loading={loading}
        empty={empty}
        dataLength={data.length}
        height={height}
        className={className}
      >
        <div ref={ref} className={clsx(styles.splitRoot, className)} {...props}>
          <div
            ref={barRef}
            className={styles.splitBarWrap}
            style={{ height }}
            role="graphics-document document"
            aria-roledescription="Distribution chart"
            aria-label={desc}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onBlur={() => setActiveIndex(null)}
          >
            {segments.map((seg, i) => {
              return (
                <div
                  key={seg.key ?? i}
                  className={styles.splitSegment}
                  role="graphics-symbol img"
                  aria-roledescription="Segment"
                  aria-label={`${seg.label}: ${fmtValue(
                    seg.value,
                  )} (${Math.round(seg.pct)}%)`}
                  data-clickable={onClickDatum ? true : undefined}
                  style={{
                    flexBasis: `${seg.pct}%`,
                    backgroundColor: seg.color,
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onClick={
                    onClickDatum ? () => trackedClickDatum(seg, i) : undefined
                  }
                />
              );
            })}
          </div>

          {legend && variant === "default" && (
            <div className={styles.legend}>
              {activeIndex !== null && segments[activeIndex] ? (
                <div className={styles.legendItem}>
                  <span
                    className={styles.legendDot}
                    style={{ backgroundColor: segments[activeIndex].color }}
                  />
                  <span className={styles.legendLabel}>
                    {segments[activeIndex].label}
                    {showValues && ` ${fmtValue(segments[activeIndex].value)}`}
                    {showPercentage &&
                      ` (${Math.round(segments[activeIndex].pct)}%)`}
                  </span>
                </div>
              ) : (
                segments.map((seg, i) => (
                  <div key={seg.key ?? i} className={styles.legendItem}>
                    <span
                      className={styles.legendDot}
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className={styles.legendLabel}>
                      {seg.label}
                      {showPercentage && ` (${Math.round(seg.pct)}%)`}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {variant === "detailed" && (
            <div className={styles.splitDetailedLegend}>
              {segments.map((seg, i) => (
                <div key={seg.key ?? i} className={styles.splitDetailedItem}>
                  <div className={styles.splitDetailedLabel}>
                    <span
                      className={styles.legendDot}
                      style={{ backgroundColor: seg.color }}
                    />
                    {seg.label}
                  </div>
                  <div className={styles.splitDetailedValue}>
                    {fmtValue(seg.value)}
                  </div>
                  {showPercentage && (
                    <div className={styles.splitDetailedCount}>
                      {`${seg.pct.toFixed(1)}%`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={styles.srOnly}
          >
            {activeIndex !== null && segments[activeIndex]
              ? `${segments[activeIndex].label}: ${fmtValue(
                  segments[activeIndex].value,
                )} (${Math.round(segments[activeIndex].pct)}%)`
              : ""}
          </div>
        </div>
      </ChartWrapper>
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Split.displayName = "Chart.Split";
}
