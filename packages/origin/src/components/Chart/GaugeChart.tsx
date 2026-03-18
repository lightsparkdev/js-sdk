"use client";

import * as React from "react";
import clsx from "clsx";
import { Skeleton } from "../Skeleton";
import styles from "./Chart.module.scss";

export interface GaugeThreshold {
  /** Upper bound of this zone (exclusive). The last zone extends to `max`. */
  upTo: number;
  /** Zone color. */
  color: string;
  /** Optional label for this zone (e.g., "Great", "Needs work"). */
  label?: string;
}

export interface GaugeChartProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Current value to display. */
  value: number;
  /** Minimum value. */
  min?: number;
  /** Maximum value. */
  max?: number;
  /** Threshold zones. */
  thresholds: GaugeThreshold[];
  /** Label for the marker (e.g., "P75"). */
  markerLabel?: string;
  /** Format the displayed value. */
  formatValue?: (value: number) => string;
  /** Visual density. */
  variant?: "default" | "minimal";
  loading?: boolean;
  analyticsName?: string;
  /** Accessible label. */
  ariaLabel?: string;
}

export const Gauge = React.forwardRef<HTMLDivElement, GaugeChartProps>(
  function Gauge(
    {
      value,
      min = 0,
      max = 100,
      thresholds,
      markerLabel,
      formatValue,
      variant = "default",
      loading,
      analyticsName: _analyticsName,
      ariaLabel,
      className,
      ...props
    },
    ref,
  ) {
    const range = max - min || 1;
    const pct = Math.max(0, Math.min(1, (value - min) / range));

    const activeThreshold = thresholds.find((t, i) =>
      i === thresholds.length - 1 ? true : value < t.upTo,
    );

    const fmtValue = formatValue ? formatValue(value) : String(value);

    if (loading) {
      return (
        <div ref={ref} className={clsx(styles.root, className)} {...props}>
          <div className={styles.loading} style={{ minHeight: 56 }}>
            <Skeleton style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={clsx(
          styles.gauge,
          variant === "minimal" && styles.gaugeMinimal,
          className,
        )}
        role="meter"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={ariaLabel ?? "Gauge"}
        aria-valuetext={`${fmtValue}${
          activeThreshold?.label ? `, ${activeThreshold.label}` : ""
        }`}
        {...props}
      >
        <div className={styles.gaugeHeader}>
          <span className={styles.gaugeValue}>{fmtValue}</span>
        </div>
        {variant !== "minimal" && activeThreshold?.label && (
          <div className={styles.gaugeTrailing}>
            <span className={styles.gaugeTrailingText}>
              {activeThreshold.label}
            </span>
          </div>
        )}

        {/* Track + marker container */}
        <div className={styles.gaugeTrackWrap}>
          <div className={styles.gaugeTrack}>
            {variant === "default" ? (
              thresholds.map((t, i) => {
                const prevUpTo = i === 0 ? min : thresholds[i - 1].upTo;
                const segStart = (prevUpTo - min) / range;
                const segEnd =
                  i === thresholds.length - 1 ? 1 : (t.upTo - min) / range;
                const segWidth = segEnd - segStart;
                const isActive =
                  value >= prevUpTo &&
                  (i === thresholds.length - 1 || value < t.upTo);
                return (
                  <div
                    key={i}
                    className={styles.gaugeSegment}
                    style={{
                      flex: segWidth,
                      backgroundColor: isActive
                        ? t.color
                        : "var(--surface-secondary)",
                    }}
                  />
                );
              })
            ) : (
              <div
                className={styles.gaugeFill}
                style={{
                  width: `${pct * 100}%`,
                  backgroundColor: activeThreshold?.color,
                }}
              />
            )}
          </div>

          {variant !== "minimal" && (
            <div
              className={styles.gaugeMarkerWrap}
              style={{ left: `${pct * 100}%` }}
            >
              <div className={styles.gaugeMarker} />
              {markerLabel && (
                <span className={styles.gaugeMarkerLabel}>{markerLabel}</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Gauge.displayName = "Chart.Gauge";
}
