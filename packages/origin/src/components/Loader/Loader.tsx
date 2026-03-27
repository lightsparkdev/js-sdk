/**
 * Loader Component
 *
 * A simple 3-dot loading indicator with pulse animation.
 * Pure CSS animation - no Base UI needed.
 */

"use client";

import * as React from "react";
import styles from "./Loader.module.scss";

export interface LoaderProps {
  /** Additional CSS class */
  className?: string;
  /** Accessible label for screen readers */
  label?: string;
}

export function Loader({ className, label = "Loading" }: LoaderProps) {
  return (
    <div
      className={`${styles.loader} ${className || ""}`}
      role="status"
      aria-label={label}
    >
      <div className={styles.dot} style={{ animationDelay: "0s" }} />
      <div className={styles.dot} style={{ animationDelay: "0.15s" }} />
      <div className={styles.dot} style={{ animationDelay: "0.3s" }} />
      <span className={styles.srOnly}>{label}</span>
    </div>
  );
}

export default Loader;
