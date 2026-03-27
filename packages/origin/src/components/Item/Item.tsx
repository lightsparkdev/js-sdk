"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./Item.module.scss";

export interface ItemProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
  title: string;
  description?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  trailingPadding?: "sm" | "lg";
  clickable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  render?: React.ReactElement;
}

export const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  function Item(props, forwardedRef) {
    const {
      title,
      description,
      leading,
      trailing,
      trailingPadding,
      clickable = true,
      selected,
      disabled,
      onClick,
      render,
      className,
      ...elementProps
    } = props;

    const isInteractive = clickable && !disabled;

    const handleClick = (event: React.MouseEvent) => {
      if (disabled) return;
      onClick?.(event as React.MouseEvent<HTMLDivElement>);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick?.(event as unknown as React.MouseEvent<HTMLDivElement>);
      }
    };

    const itemProps = {
      ref: forwardedRef,
      className: clsx(styles.root, clickable && styles.clickable, className),
      "data-clickable": clickable ? undefined : "false",
      "data-selected": selected || undefined,
      "data-disabled": disabled || undefined,
      onClick: isInteractive && onClick ? handleClick : undefined,
      onKeyDown: isInteractive && onClick ? handleKeyDown : undefined,
      tabIndex: isInteractive && onClick ? 0 : undefined,
      ...elementProps,
    };

    const content = (
      <>
        <div className={styles.container}>
          {leading && <div className={styles.leading}>{leading}</div>}
          <div className={styles.content}>
            <span className={styles.title}>{title}</span>
            {description && (
              <span className={styles.description}>{description}</span>
            )}
          </div>
        </div>
        {trailing && (
          <div
            className={clsx(
              styles.trailing,
              trailingPadding === "sm" && styles.trailingSm,
              trailingPadding === "lg" && styles.trailingLg,
            )}
          >
            {trailing}
          </div>
        )}
      </>
    );

    if (render) {
      return React.cloneElement(render, itemProps, content);
    }

    return (
      <div
        role={isInteractive && onClick ? "button" : undefined}
        {...itemProps}
      >
        {content}
      </div>
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Item.displayName = "Item";
}
