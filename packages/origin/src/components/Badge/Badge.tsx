"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./Badge.module.scss";

export type BadgeVariant =
  | "gray"
  | "purple"
  | "blue"
  | "sky"
  | "pink"
  | "green"
  | "yellow"
  | "red";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The label text */
  children: React.ReactNode;
  /** Color variant */
  variant?: BadgeVariant;
  /** Whether to use vibrant (filled) styling */
  vibrant?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Compact label for categorization or status indication.
 * Renders a `<span>` element.
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge(props, forwardedRef) {
    const {
      children,
      variant = "gray",
      vibrant = false,
      className,
      ...elementProps
    } = props;

    return (
      <span
        ref={forwardedRef}
        className={clsx(
          styles.root,
          styles[variant],
          vibrant && styles.vibrant,
          className,
        )}
        {...elementProps}
      >
        {children}
      </span>
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Badge.displayName = "Badge";
}
