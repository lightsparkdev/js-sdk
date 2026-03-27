"use client";

import * as React from "react";
import clsx from "clsx";
import type { ResolvedSeries } from "./types";
import { Skeleton } from "../Skeleton";
import styles from "./Chart.module.scss";

export interface ChartWrapperProps {
  ref?: React.Ref<HTMLDivElement>;
  loading?: boolean;
  empty?: React.ReactNode;
  dataLength: number;
  isEmpty?: boolean;
  height: number;
  legend?: boolean;
  series?: ResolvedSeries[];
  children: React.ReactNode;
  className?: string;
  ariaLiveContent?: string;
}

export function ChartWrapper({
  ref,
  loading,
  empty,
  dataLength,
  isEmpty,
  height,
  legend,
  series,
  children,
  className,
  ariaLiveContent,
}: ChartWrapperProps) {
  const showEmpty = isEmpty ?? dataLength === 0;

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

  if (showEmpty && empty !== undefined) {
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
    <>
      {children}
      {legend && series && series.length > 1 && (
        <div className={styles.legend}>
          {series.map((s) => (
            <div key={s.key} className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{ backgroundColor: s.color }}
              />
              <span className={styles.legendLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      )}
      {ariaLiveContent !== undefined && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={styles.srOnly}
        >
          {ariaLiveContent}
        </div>
      )}
    </>
  );
}
