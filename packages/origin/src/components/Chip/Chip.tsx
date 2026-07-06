"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import clsx from "clsx";
import { CentralIcon } from "../Icon";
import { devWarnOnce } from "../../lib/dev-warn";
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

// Origin's standard small icon size for both chip sizes. IconCrossSmall's
// glyph fills only the center of its viewBox, so at 16px it reads ~6px —
// appropriately subtle for the 24px sm and 28px md chips.
const DISMISS_ICON_SIZE = 16;

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
  /**
   * Value content. Strings render as static text. To make the value segment
   * interactive, pass a `<ChipFilter.Trigger>` (for example composed with a
   * menu or popover trigger via its `render` prop) — the trigger then takes
   * over the segment's padding and hover/focus affordances. Elements that
   * carry a raw `data-chip-trigger` attribute opt in the same way; other
   * elements render unstyled.
   */
  value: React.ReactNode;
  /**
   * Plain-text description of the value, used in the dismiss button's
   * accessible label when `value` is not plain text. Provide it for every
   * element value so the label doesn't dangle ("Remove filter Status
   * is"); a dev-mode warning fires when it's missing. Ignored when
   * `value` is a string, number, or bigint — those describe themselves.
   */
  valueLabel?: string;
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
    const resolvedDismissIcon = dismissIcon ?? (
      <CentralIcon name="IconCrossSmall" size={DISMISS_ICON_SIZE} />
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

// Lets ChipFilter.Trigger inherit the root's disabled state, since the
// root only communicates it via `data-disabled` (opacity + pointer-events)
// which doesn't stop keyboard activation on a composed trigger.
const ChipFilterDisabledContext = React.createContext(false);

const ChipFilterRoot = React.forwardRef<HTMLSpanElement, ChipFilterProps>(
  function ChipFilter(props, forwardedRef) {
    const {
      property,
      operator,
      value,
      valueLabel,
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

    // Strings, numbers, and bigints are self-describing; everything else
    // needs `valueLabel` to appear in the dismiss button's accessible label.
    const valueText =
      typeof value === "string"
        ? value
        : typeof value === "number" || typeof value === "bigint"
        ? String(value)
        : valueLabel;

    if (valueText === undefined && value != null && onDismissProp) {
      devWarnOnce(
        "ChipFilter: a non-string `value` was provided without `valueLabel`. " +
          "The dismiss button's accessible label will omit the value " +
          `("Remove filter ${property} ${operator}"). Pass \`valueLabel\` ` +
          "to describe the value for screen readers.",
      );
    }

    // Empty text (e.g. an explicit `valueLabel=""`) drops out of the label
    // entirely so it can't leave a trailing space.
    const label = valueText
      ? `${property} ${operator} ${valueText}`
      : `${property} ${operator}`;
    const resolvedDismissIcon = dismissIcon ?? (
      <CentralIcon name="IconCrossSmall" size={DISMISS_ICON_SIZE} />
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
          <span className={styles.value}>
            <ChipFilterDisabledContext.Provider value={disabled}>
              {value}
            </ChipFilterDisabledContext.Provider>
          </span>
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

export interface ChipFilterTriggerProps
  extends React.ComponentPropsWithoutRef<"button"> {
  /** Override the rendered element. Defaults to `<button>`. */
  render?: useRender.RenderProp;
}

/**
 * Interactive trigger for the `ChipFilter` value segment. Pass it as (or
 * compose it into) the `value` prop — it takes over the segment's padding
 * and hover/focus affordances so the whole segment becomes the hit target.
 * Compose with menu or popover triggers via the `render` prop, e.g.
 * `<Menu.Trigger render={<ChipFilter.Trigger />}>Active</Menu.Trigger>`.
 *
 * Renders a `<button>` carrying the `data-chip-trigger` attribute that the
 * value-segment styling keys off; elements setting the attribute directly
 * keep working.
 */
export const ChipFilterTrigger = React.forwardRef<
  HTMLButtonElement,
  ChipFilterTriggerProps
>(function ChipFilterTrigger(props, forwardedRef) {
  const { render, ...elementProps } = props;
  const rootDisabled = React.useContext(ChipFilterDisabledContext);

  return useRender({
    defaultTagName: "button",
    render,
    ref: forwardedRef,
    props: {
      type: "button",
      ...elementProps,
      // A disabled ChipFilter root only sets `data-disabled` (opacity +
      // pointer-events) on itself, which doesn't remove the trigger from
      // the tab order or block Enter/Space — the real attribute does.
      disabled: rootDisabled || elementProps.disabled,
      "data-chip-trigger": "",
    },
  });
});

/**
 * Filter variant of Chip with property, operator, and value segments.
 * Renders a `<span>` element with segmented content and dismiss button.
 */
export const ChipFilter = Object.assign(ChipFilterRoot, {
  Trigger: ChipFilterTrigger,
});

if (process.env.NODE_ENV !== "production") {
  Chip.displayName = "Chip";
  ChipFilterRoot.displayName = "ChipFilter";
  ChipFilterTrigger.displayName = "ChipFilter.Trigger";
}
