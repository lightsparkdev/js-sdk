/**
 * Loader Component
 *
 * Loading indicator with two visual variants:
 * - "dots": 3-dot pulse animation (default)
 * - "ring": circular track with a rotating quarter-arc indicator
 *
 * Pure CSS animation - no Base UI needed.
 */

"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./Loader.module.scss";

export type LoaderVariant = "dots" | "ring";

export interface LoaderProps {
  /** Additional CSS class */
  className?: string;
  /** Accessible label for screen readers */
  label?: string;
  /** Visual style of the loader */
  variant?: LoaderVariant;
  /**
   * Ring diameter in pixels (ring variant only). The 2px stroke scales
   * proportionally with size, matching CentralIcon behavior.
   */
  size?: number;
}

export function Loader({
  className,
  label = "Loading",
  variant = "dots",
  size = 24,
}: LoaderProps) {
  return (
    <div
      className={clsx(styles.loader, styles[variant], className)}
      role="status"
      aria-label={label}
    >
      {variant === "ring" ? (
        <svg
          className={styles.ringSvg}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle className={styles.ringTrack} cx="12" cy="12" r="9" />
          <path className={styles.ringIndicator} d="M12 3A9 9 0 0 1 21 12" />
        </svg>
      ) : (
        <>
          <div className={styles.dot} style={{ animationDelay: "0s" }} />
          <div className={styles.dot} style={{ animationDelay: "0.15s" }} />
          <div className={styles.dot} style={{ animationDelay: "0.3s" }} />
        </>
      )}
      <span className={styles.srOnly}>{label}</span>
    </div>
  );
}

export default Loader;
