"use client";

import * as React from "react";
import { Separator as BaseSeparator } from "@base-ui/react/separator";
import clsx from "clsx";
import styles from "./Separator.module.scss";

export interface SeparatorProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Stroke weight variant */
  variant?: "default" | "hairline";
  /** Orientation of the separator */
  orientation?: "horizontal" | "vertical";
}

/**
 * A separator element accessible to screen readers.
 * Renders a `<div>` with `role="separator"`.
 */
export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator(props, forwardedRef) {
    const {
      variant = "default",
      orientation = "horizontal",
      className,
      ...elementProps
    } = props;

    return (
      <BaseSeparator
        ref={forwardedRef}
        orientation={orientation}
        className={clsx(
          styles.root,
          styles[variant],
          styles[orientation],
          className,
        )}
        {...elementProps}
      />
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Separator.displayName = "Separator";
}
