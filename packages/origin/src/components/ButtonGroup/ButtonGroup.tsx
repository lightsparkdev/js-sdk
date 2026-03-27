"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./ButtonGroup.module.scss";

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  variant?: "filled" | "outline" | "secondary";
}

const variantClass = {
  filled: "filled",
  outline: "outline",
  secondary: "secondary",
} as const;

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup(
    {
      orientation = "horizontal",
      variant = "filled",
      className,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        role="group"
        className={clsx(
          styles.root,
          orientation === "vertical" && styles.vertical,
          styles[variantClass[variant]],
          className,
        )}
        data-button-group=""
        data-orientation={orientation}
        data-variant={variant}
        {...props}
      >
        {children}
      </div>
    );
  },
);
