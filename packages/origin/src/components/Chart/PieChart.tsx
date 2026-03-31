"use client";

import * as React from "react";
import clsx from "clsx";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import { useResizeWidth } from "./hooks";
import { useMergedRef } from "./useMergedRef";
import { SERIES_COLORS } from "./types";
import { ChartWrapper } from "./ChartWrapper";
import styles from "./Chart.module.scss";

export interface PieSegment {
  name: string;
  value: number;
  color?: string;
}

export interface PieChartProps extends React.ComponentPropsWithoutRef<"div"> {
  data: PieSegment[];
  /**
   * Pre-measurement width in pixels. Used as a fallback before
   * ResizeObserver fires, enabling server-side rendering.
   */
  initialWidth?: number;
  height?: number;
  /** Inner radius ratio (0-1). Defaults to 0.65. */
  innerRadius?: number;
  /** Show a legend sidebar. */
  legend?: boolean;
  /**
   * Show tooltip on hover. Pass `true` for the default center label,
   * or a render function to display custom content in the donut center.
   */
  tooltip?:
    | boolean
    | ((segment: PieSegment, percentage: number) => React.ReactNode);
  /** Show a loading skeleton. */
  loading?: boolean;
  /** Content rendered when `data` is empty. */
  empty?: React.ReactNode;
  /** Called when the active (hovered) segment changes. */
  onActiveChange?: (index: number | null, segment: PieSegment | null) => void;
  /** Called when a segment is clicked. */
  onClickDatum?: (index: number, segment: PieSegment) => void;
  animate?: boolean;
  analyticsName?: string;
  ariaLabel?: string;
  formatValue?: (value: number) => string;
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function arcPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const sweep = endAngle - startAngle;
  const largeArc = sweep > Math.PI ? 1 : 0;

  if (sweep >= Math.PI * 2 - 0.001) {
    const mid = startAngle + Math.PI;
    const path1 = arcPath(cx, cy, outerR, innerR, startAngle, mid);
    const path2 = arcPath(cx, cy, outerR, innerR, mid, endAngle - 0.001);
    return path1 + " " + path2;
  }

  const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, endAngle);

  if (innerR > 0) {
    const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
    const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);
    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerStart.x} ${innerStart.y}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
      "Z",
    ].join(" ");
  }

  return [
    `M ${cx} ${cy}`,
    `L ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    "Z",
  ].join(" ");
}

const clickIndexMeta = (index: number) => ({ index });

const SEGMENT_GAP = 0.02;

export const Pie = React.forwardRef<HTMLDivElement, PieChartProps>(function Pie(
  {
    data,
    height = 240,
    innerRadius: innerRadiusProp = 0.65,
    legend = true,
    tooltip: tooltipProp = true,
    loading,
    empty,
    onActiveChange,
    animate = true,
    onClickDatum,
    analyticsName,
    ariaLabel,
    formatValue,
    initialWidth,
    className,
    ...props
  },
  ref,
) {
  const tooltipEnabled = !!tooltipProp;
  const customTooltip = typeof tooltipProp === "function" ? tooltipProp : null;

  const trackedClickDatum = useTrackedCallback(
    analyticsName,
    "Chart.Pie",
    "click",
    onClickDatum,
    onClickDatum ? clickIndexMeta : undefined,
  );

  const { width, attachRef } = useResizeWidth(initialWidth);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const mergedRef = useMergedRef(ref, attachRef);

  const onActiveChangeRef = React.useRef(onActiveChange);
  React.useLayoutEffect(() => {
    onActiveChangeRef.current = onActiveChange;
  }, [onActiveChange]);

  React.useEffect(() => {
    const segment = activeIndex !== null ? data[activeIndex] ?? null : null;
    onActiveChangeRef.current?.(activeIndex, segment);
  }, [activeIndex, data]);

  const innerRatio = innerRadiusProp;

  const total = React.useMemo(
    () => data.reduce((sum, d) => sum + Math.max(0, d.value), 0),
    [data],
  );

  const segments = React.useMemo(() => {
    if (total === 0) return [];
    const gap = data.length > 1 ? SEGMENT_GAP : 0;
    let angle = -Math.PI / 2;
    return data.map((d, i) => {
      const sweep = (d.value / total) * (Math.PI * 2 - gap * data.length);
      const startAngle = angle + gap / 2;
      const endAngle = startAngle + sweep;
      angle = endAngle + gap / 2;
      return {
        ...d,
        color: d.color ?? SERIES_COLORS[i % SERIES_COLORS.length],
        startAngle,
        endAngle,
        percentage: (d.value / total) * 100,
      };
    });
  }, [data, total]);

  const legendWidth = legend ? 140 : 0;
  const svgSize = Math.min(width - legendWidth, height);
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const outerR = svgSize / 2 - 4;
  const innerR = outerR * innerRatio;

  const fmtValue = React.useCallback(
    (v: number) => (formatValue ? formatValue(v) : String(v)),
    [formatValue],
  );

  const ready = width > 0;

  const svgDesc = React.useMemo(() => {
    if (data.length === 0) return undefined;
    return `Donut chart with ${data.length} segments.`;
  }, [data.length]);

  const activeSeg = activeIndex !== null ? segments[activeIndex] : null;

  const centerContent = React.useMemo(() => {
    if (!tooltipEnabled || !activeSeg) return null;
    if (customTooltip) {
      return customTooltip(
        {
          name: activeSeg.name,
          value: activeSeg.value,
          color: activeSeg.color,
        },
        activeSeg.percentage,
      );
    }
    return null;
  }, [tooltipEnabled, activeSeg, customTooltip]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (segments.length === 0) return;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev === null ? 0 : (prev + 1) % segments.length,
          );
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev === null
              ? segments.length - 1
              : (prev - 1 + segments.length) % segments.length,
          );
          break;
        case "Enter":
        case " ":
          if (onClickDatum && activeIndex !== null) {
            e.preventDefault();
            trackedClickDatum(activeIndex, data[activeIndex]);
          }
          return;
        case "Escape":
          e.preventDefault();
          setActiveIndex(null);
          break;
        default:
          return;
      }
    },
    [segments.length, onClickDatum, activeIndex, trackedClickDatum, data],
  );

  const ariaLiveText =
    activeSeg && tooltipEnabled
      ? `${activeSeg.name}: ${fmtValue(
          activeSeg.value,
        )} (${activeSeg.percentage.toFixed(0)}%)`
      : undefined;

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
        className={clsx(styles.root, styles.pieRoot, className)}
        style={{ height }}
        {...props}
      >
        {ready && (
          <>
            <svg
              role="graphics-document document"
              aria-roledescription="Pie chart"
              aria-label={ariaLabel ?? svgDesc ?? "Pie chart"}
              width={svgSize}
              height={svgSize}
              className={styles.svg}
              tabIndex={0}
              onKeyDown={handleKeyDown}
            >
              {svgDesc && <desc>{svgDesc}</desc>}

              {segments.map((seg, i) => {
                const midAngle = (seg.startAngle + seg.endAngle) / 2;
                const tx = activeIndex === i ? Math.cos(midAngle) * 4 : 0;
                const ty = activeIndex === i ? Math.sin(midAngle) * 4 : 0;
                return (
                  <path
                    key={i}
                    d={arcPath(
                      cx,
                      cy,
                      outerR,
                      innerR,
                      seg.startAngle,
                      seg.endAngle,
                    )}
                    fill={seg.color}
                    fillOpacity={1}
                    stroke="var(--surface-primary)"
                    strokeWidth={1.5}
                    transform={`translate(${tx}, ${ty})`}
                    role="graphics-symbol"
                    aria-roledescription="Segment"
                    aria-label={`${data[i].name}: ${data[i].value}`}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex(null)}
                    onClick={() => trackedClickDatum(i, data[i])}
                    className={styles.pieSegment}
                    style={{
                      animationDelay: animate ? `${i * 60}ms` : undefined,
                      animation: animate ? undefined : "none",
                      opacity: animate ? undefined : 1,
                    }}
                  />
                );
              })}

              {activeIndex !== null &&
                tooltipEnabled &&
                activeSeg &&
                !customTooltip && (
                  <g>
                    <text
                      x={cx}
                      y={cy - 6}
                      textAnchor="middle"
                      dominantBaseline="auto"
                      className={styles.pieCenter}
                    >
                      {fmtValue(activeSeg.value)}
                    </text>
                    <text
                      x={cx}
                      y={cy + 10}
                      textAnchor="middle"
                      dominantBaseline="auto"
                      className={styles.pieCenterLabel}
                    >
                      {activeSeg.name}
                    </text>
                  </g>
                )}

              {activeIndex !== null && customTooltip && centerContent && (
                <foreignObject
                  x={cx - innerR}
                  y={cy - innerR}
                  width={innerR * 2}
                  height={innerR * 2}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    {centerContent}
                  </div>
                </foreignObject>
              )}
            </svg>

            {legend && (
              <div className={styles.pieLegend} role="list">
                {segments.map((seg, i) => (
                  <div
                    key={i}
                    className={styles.pieLegendItem}
                    role="listitem"
                    tabIndex={0}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex(null)}
                    onFocus={() => setActiveIndex(i)}
                    onBlur={() => setActiveIndex(null)}
                  >
                    <span
                      className={styles.pieLegendDot}
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className={styles.pieLegendName}>{seg.name}</span>
                    <span className={styles.pieLegendValue}>
                      {seg.percentage.toFixed(0)}%
                    </span>
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
              {ariaLiveText}
            </div>
          </>
        )}
      </div>
    </ChartWrapper>
  );
});

if (process.env.NODE_ENV !== "production") {
  Pie.displayName = "Chart.Pie";
}
