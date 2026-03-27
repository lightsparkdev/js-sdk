"use client";

import * as React from "react";
import clsx from "clsx";
import { Skeleton } from "../Skeleton";
import styles from "./Chart.module.scss";

export interface UptimePoint {
  /** Status for this time period. */
  status: "up" | "down" | "degraded" | "unknown";
  /** Optional label (e.g., timestamp). Shown on hover. */
  label?: string;
}

export interface UptimeChartProps
  extends React.ComponentPropsWithoutRef<"div"> {
  /** Array of status points, ordered chronologically. */
  data: UptimePoint[];
  /** Height of the status bars in px. */
  height?: number;
  /** Color map for statuses. Defaults to green/red/yellow/gray. */
  colors?: Partial<Record<UptimePoint["status"], string>>;
  /** Accessible label. */
  ariaLabel?: string;
  /**
   * Always-visible resting label shown below the bars. On hover it
   * updates to the hovered bar's label, then returns to this value.
   * Set to `false` to hide the label row entirely.
   */
  label?: string | false;
  /**
   * Status dot color shown next to the resting label.
   * Ignored when a bar is hovered (uses the hovered bar's status color).
   */
  labelStatus?: UptimePoint["status"];
  /** Called when a bar is hovered. */
  onActiveChange?: (point: UptimePoint | null, index: number | null) => void;
  loading?: boolean;
  empty?: React.ReactNode;
  analyticsName?: string;
}

const DEFAULT_COLORS: Record<UptimePoint["status"], string> = {
  up: "var(--color-blue-700)",
  down: "var(--color-red-500)",
  degraded: "var(--color-yellow-500)",
  unknown: "var(--surface-secondary)",
};

export const Uptime = React.forwardRef<HTMLDivElement, UptimeChartProps>(
  function Uptime(
    {
      data,
      height = 32,
      colors: colorsProp,
      ariaLabel,
      label: labelProp,
      labelStatus = "up",
      onActiveChange,
      loading,
      empty,
      analyticsName: _analyticsName,
      className,
      ...props
    },
    ref,
  ) {
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
    const colors = { ...DEFAULT_COLORS, ...colorsProp };
    const showLabel = labelProp !== false;

    const onActiveChangeRef = React.useRef(onActiveChange);
    React.useLayoutEffect(() => {
      onActiveChangeRef.current = onActiveChange;
    }, [onActiveChange]);

    React.useEffect(() => {
      onActiveChangeRef.current?.(
        activeIndex !== null ? data[activeIndex] : null,
        activeIndex,
      );
    }, [activeIndex, data]);

    const handleEnter = React.useCallback((i: number) => {
      setActiveIndex(i);
    }, []);

    const handleLeave = React.useCallback(() => {
      setActiveIndex(null);
    }, []);

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
        if (data.length === 0) return;
        switch (e.key) {
          case "ArrowRight":
            e.preventDefault();
            setActiveIndex((prev) => {
              const next = prev === null ? 0 : (prev + 1) % data.length;
              return next;
            });
            break;
          case "ArrowLeft":
            e.preventDefault();
            setActiveIndex((prev) => {
              const next =
                prev === null
                  ? data.length - 1
                  : (prev - 1 + data.length) % data.length;
              return next;
            });
            break;
          case "Home":
            e.preventDefault();
            setActiveIndex(0);
            break;
          case "End":
            e.preventDefault();
            setActiveIndex(data.length - 1);
            break;
          case "Escape":
            e.preventDefault();
            setActiveIndex(null);
            break;
          default:
            return;
        }
      },
      [data],
    );

    const activePoint = activeIndex !== null ? data[activeIndex] : null;
    const displayLabel = activePoint?.label ?? labelProp ?? null;
    const displayStatus = activePoint?.status ?? labelStatus;

    if (loading) {
      return (
        <div
          ref={ref}
          className={clsx(styles.root, className)}
          style={{ height }}
        >
          <div className={styles.loading}>
            <Skeleton style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      );
    }

    if (data.length === 0 && empty !== undefined) {
      return (
        <div
          ref={ref}
          className={clsx(styles.root, className)}
          style={{ height }}
        >
          <div className={styles.empty}>
            {typeof empty === "boolean" ? "No data" : empty}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={clsx(styles.uptime, className)}
        role="graphics-document document"
        aria-roledescription="Uptime chart"
        aria-label={ariaLabel ?? `Uptime chart with ${data.length} periods`}
        {...props}
      >
        <div
          className={styles.uptimeBars}
          style={{ height }}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {data.map((point, i) => (
            <div
              key={i}
              className={styles.uptimeBar}
              role="graphics-symbol img"
              aria-roledescription="Period"
              aria-label={`${point.status}${
                point.label ? `: ${point.label}` : ""
              }`}
              data-active={activeIndex === i || undefined}
              style={{ backgroundColor: colors[point.status] }}
              onMouseEnter={() => handleEnter(i)}
              onMouseLeave={handleLeave}
            />
          ))}
        </div>
        {showLabel && (
          <div className={styles.uptimeTooltip}>
            {displayLabel ? (
              <>
                <span
                  className={styles.uptimeDot}
                  style={{ backgroundColor: colors[displayStatus] }}
                />
                <span className={styles.uptimeLabel}>{displayLabel}</span>
              </>
            ) : (
              <span className={styles.uptimeLabel} aria-hidden="true">
                &nbsp;
              </span>
            )}
          </div>
        )}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={styles.srOnly}
        >
          {activeIndex !== null && data[activeIndex]
            ? `${data[activeIndex].status}${
                data[activeIndex].label ? `: ${data[activeIndex].label}` : ""
              }`
            : ""}
        </div>
      </div>
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Uptime.displayName = "Chart.Uptime";
}
