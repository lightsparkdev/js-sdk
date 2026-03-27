"use client";

import * as React from "react";
import clsx from "clsx";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import { ChartWrapper } from "./ChartWrapper";
import styles from "./Chart.module.scss";

export interface BarListItem {
  /** Optional stable key for React reconciliation. */
  key?: string;
  /** Row label (e.g., "/pricing", "US"). */
  name: string;
  /** Numeric value that determines bar width proportionally. */
  value: number;
  /** Optional secondary value displayed after the primary value. */
  secondaryValue?: number;
  /** Optional pre-formatted string — overrides `formatValue` for this item. */
  displayValue?: string;
  /** Optional bar color override. */
  color?: string;
  /** Optional href — makes the name a link. */
  href?: string;
  /** Change indicator arrow. */
  change?: "up" | "down" | "neutral";
}

export interface BarListProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Array of items to render as ranked bars. */
  data: BarListItem[];
  /** Bar fill color. Applies to all bars unless overridden per item. */
  color?: string;
  /** Format the numeric value for display. Used when `displayValue` is not set. */
  formatValue?: (value: number) => string;
  /** Format the secondary value for display. */
  formatSecondaryValue?: (value: number) => string;
  /** Called when a row is clicked. */
  onClickDatum?: (item: BarListItem, index: number) => void;
  analyticsName?: string;
  /** Show numbered rank in front of each row. */
  showRank?: boolean;
  /** Maximum number of items to display. */
  max?: number;
  /** Show loading skeleton. */
  loading?: boolean;
  /** Content when data is empty. */
  empty?: React.ReactNode;
  /** Accessible label for the list. */
  ariaLabel?: string;
}

const SKELETON_HEIGHT = 120;

const CHANGE_ARROWS: Record<string, string> = {
  up: "\u2191",
  down: "\u2193",
  neutral: "\u2013",
};

const barListClickMeta = (item: BarListItem) => ({ name: item.name });

export const BarList = React.forwardRef<HTMLDivElement, BarListProps>(
  function BarList(
    {
      data,
      color = "var(--surface-secondary)",
      formatValue,
      formatSecondaryValue,
      onClickDatum,
      analyticsName,
      showRank,
      max,
      loading,
      empty,
      ariaLabel,
      className,
      ...props
    },
    ref,
  ) {
    const trackedClickItem = useTrackedCallback(
      analyticsName,
      "Chart.BarList",
      "click",
      onClickDatum,
      onClickDatum ? barListClickMeta : undefined,
    );

    const items = max ? data.slice(0, max) : data;

    const maxValue = Math.max(...items.map((d) => d.value), 1);
    const fmtValue = (v: number) => (formatValue ? formatValue(v) : String(v));
    const fmtSecondary = (v: number) =>
      formatSecondaryValue ? formatSecondaryValue(v) : String(v);

    return (
      <ChartWrapper
        ref={ref}
        loading={loading}
        empty={empty}
        dataLength={data.length}
        height={SKELETON_HEIGHT}
        className={className}
      >
        <div
          ref={ref}
          className={clsx(styles.barList, className)}
          role="list"
          aria-label={ariaLabel}
          {...props}
        >
          {items.map((item, i) => {
            const pct = (item.value / maxValue) * 100;
            const barColor = item.color ?? color;
            const clickable = Boolean(onClickDatum || item.href);
            const display = item.displayValue ?? fmtValue(item.value);

            return (
              <div
                key={item.key ?? i}
                className={styles.barListRow}
                data-clickable={clickable || undefined}
                role="listitem"
                tabIndex={clickable ? 0 : undefined}
                onClick={
                  onClickDatum ? () => trackedClickItem(item, i) : undefined
                }
                onKeyDown={
                  onClickDatum
                    ? (e: React.KeyboardEvent) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          trackedClickItem(item, i);
                        }
                      }
                    : undefined
                }
              >
                <div
                  className={styles.barListBar}
                  style={{ width: `${pct}%`, backgroundColor: barColor }}
                />
                <div className={styles.barListContent}>
                  {showRank && (
                    <span className={styles.barListRank}>{i + 1}</span>
                  )}
                  <span className={styles.barListName}>
                    {item.href ? (
                      <a href={item.href} className={styles.barListLink}>
                        {item.name}
                      </a>
                    ) : (
                      item.name
                    )}
                  </span>
                  <span className={styles.barListValues}>
                    {item.change && (
                      <span
                        className={clsx(
                          styles.barListChange,
                          item.change === "up" && styles.barListChangeUp,
                          item.change === "down" && styles.barListChangeDown,
                        )}
                      >
                        {CHANGE_ARROWS[item.change]}
                      </span>
                    )}
                    <span className={styles.barListValue}>{display}</span>
                    {item.secondaryValue !== undefined && (
                      <span className={styles.barListSecondary}>
                        {fmtSecondary(item.secondaryValue)}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ChartWrapper>
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  BarList.displayName = "Chart.BarList";
}
