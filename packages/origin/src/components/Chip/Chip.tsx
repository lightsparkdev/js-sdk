"use client";

import * as React from "react";
import clsx from "clsx";
import { CentralIcon } from "../Icon";
import styles from "./Chip.module.scss";

export interface ChangeEventDetails<E = Event> {
  reason: string;
  event: E;
  cancel: () => void;
  allowPropagation: () => void;
  isCanceled: boolean;
  isPropagationAllowed: boolean;
  trigger?: HTMLElement | undefined;
}

function createChangeEventDetails<E = Event>(
  reason: string,
  event: E,
): ChangeEventDetails<E> {
  let canceled = false;
  let allowPropagation = false;

  return {
    reason,
    event,
    cancel() {
      canceled = true;
    },
    allowPropagation() {
      allowPropagation = true;
    },
    get isCanceled() {
      return canceled;
    },
    get isPropagationAllowed() {
      return allowPropagation;
    },
  };
}

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The label text for default variant */
  children?: React.ReactNode;
  /** Size of the chip */
  size?: "sm" | "md";
  /** Variant of the chip */
  variant?: "default" | "filter";
  /** Whether the chip is disabled */
  disabled?: boolean;
  /** Callback when dismiss is clicked */
  onDismiss?: (
    details: ChangeEventDetails<React.MouseEvent | React.KeyboardEvent>,
  ) => void;
  /** Custom dismiss icon */
  dismissIcon?: React.ReactNode;
  /** Additional class name */
  className?: string;
}

export interface ChipFilterProps
  extends Omit<ChipProps, "children" | "variant"> {
  /** Property name */
  property: string;
  /** Operator text */
  operator: string;
  /** Value text */
  value: string;
}

/**
 * Compact element representing an input, attribute, or action.
 * Renders a `<span>` element with an optional dismiss button.
 */
export const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  function Chip(props, forwardedRef) {
    const {
      children,
      size = "md",
      variant = "default",
      disabled = false,
      onDismiss: onDismissProp,
      dismissIcon,
      className,
      ...elementProps
    } = props;

    const handleDismiss = (event: React.MouseEvent | React.KeyboardEvent) => {
      if (disabled) return;

      const details = createChangeEventDetails("dismiss", event);
      onDismissProp?.(details);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleDismiss(event);
      }
    };

    const label = typeof children === "string" ? children : "chip";
    const iconSize = size === "sm" ? 10 : 12;
    const resolvedDismissIcon = dismissIcon ?? (
      <CentralIcon name="IconCrossSmall" size={iconSize} />
    );

    return (
      <span
        ref={forwardedRef}
        className={clsx(styles.root, styles[size], styles[variant], className)}
        data-disabled={disabled || undefined}
        {...elementProps}
      >
        {children}
        {onDismissProp && (
          <button
            type="button"
            className={styles.dismiss}
            onClick={handleDismiss}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-label={`Remove ${label}`}
          >
            {resolvedDismissIcon}
          </button>
        )}
      </span>
    );
  },
);

/**
 * Filter variant of Chip with property, operator, and value segments.
 * Renders a `<span>` element with segmented content and dismiss button.
 */
export const ChipFilter = React.forwardRef<HTMLSpanElement, ChipFilterProps>(
  function ChipFilter(props, forwardedRef) {
    const {
      property,
      operator,
      value,
      size = "md",
      disabled = false,
      onDismiss: onDismissProp,
      dismissIcon,
      className,
      ...elementProps
    } = props;

    const handleDismiss = (event: React.MouseEvent | React.KeyboardEvent) => {
      if (disabled) return;

      const details = createChangeEventDetails("dismiss", event);
      onDismissProp?.(details);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleDismiss(event);
      }
    };

    const label = `${property} ${operator} ${value}`;
    const iconSize = size === "sm" ? 10 : 12;
    const resolvedDismissIcon = dismissIcon ?? (
      <CentralIcon name="IconCrossSmall" size={iconSize} />
    );

    return (
      <span
        ref={forwardedRef}
        className={clsx(styles.root, styles[size], styles.filter, className)}
        data-disabled={disabled || undefined}
        {...elementProps}
      >
        <span className={styles.segment}>
          <span className={styles.property}>{property}</span>
        </span>
        <span className={styles.segment}>
          <span className={styles.operator}>{operator}</span>
        </span>
        <span className={styles.segment}>
          <span className={styles.value}>{value}</span>
        </span>
        {onDismissProp && (
          <button
            type="button"
            className={styles.dismiss}
            onClick={handleDismiss}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-label={`Remove filter ${label}`}
          >
            {resolvedDismissIcon}
          </button>
        )}
      </span>
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Chip.displayName = "Chip";
  ChipFilter.displayName = "ChipFilter";
}
