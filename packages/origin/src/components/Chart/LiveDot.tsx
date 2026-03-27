"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./Chart.module.scss";

export type LiveDotStatus = "active" | "degraded" | "down" | "unknown";

export interface LiveDotProps extends React.ComponentPropsWithoutRef<"span"> {
  status?: LiveDotStatus;
  size?: number;
}

const STATUS_COLORS: Record<LiveDotStatus, string> = {
  active: "var(--color-blue-700)",
  degraded: "var(--color-yellow-500)",
  down: "var(--color-red-500)",
  unknown: "var(--color-gray-300)",
};

export const LiveDot = React.forwardRef<HTMLSpanElement, LiveDotProps>(
  function LiveDot(
    { status = "active", size = 8, className, style, ...props },
    ref,
  ) {
    const color = STATUS_COLORS[status];
    const shouldPulse = status === "active";

    return (
      <span
        ref={ref}
        className={clsx(
          styles.liveDot,
          shouldPulse && styles.liveDotPulse,
          className,
        )}
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          ...style,
        }}
        role="status"
        aria-label={`Status: ${status}`}
        {...props}
      />
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  LiveDot.displayName = "Chart.LiveDot";
}
