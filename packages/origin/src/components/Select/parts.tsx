"use client";

import * as React from "react";
import {
  Select as BaseSelect,
  type SelectRootProps,
} from "@base-ui/react/select";
import { CentralIcon } from "../Icon";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import clsx from "clsx";
import styles from "./Select.module.scss";

// Root - generic component, pass through props
export interface RootProps<
  Value = string,
  Multiple extends boolean | undefined = false,
> extends SelectRootProps<Value, Multiple> {
  analyticsName?: string;
}

export function Root<
  Value = string,
  Multiple extends boolean | undefined = false,
>({ analyticsName, onValueChange, ...props }: RootProps<Value, Multiple>) {
  const trackedChange = useTrackedCallback(
    analyticsName,
    "Select",
    "change",
    onValueChange,
    (value: unknown) => ({ value }),
  );
  return <BaseSelect.Root onValueChange={trackedChange} {...props} />;
}

// Trigger
export interface TriggerProps extends BaseSelect.Trigger.Props {
  /**
   * Visual variant:
   * - "default" for form fields (bordered, full width)
   * - "ghost" for minimal inline selects (no border, hover bg)
   * - "hybrid" for navigation/toolbars (label + icon button)
   */
  variant?: "default" | "ghost" | "hybrid";
}

export const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  function Trigger({ className, variant = "default", ...props }, ref) {
    return (
      <BaseSelect.Trigger
        ref={ref}
        className={clsx(
          styles.trigger,
          variant === "ghost" && styles.triggerGhost,
          variant === "hybrid" && styles.triggerHybrid,
          className,
        )}
        data-variant={variant}
        {...props}
      />
    );
  },
);

// Value - uses Base UI's built-in placeholder prop and data-placeholder attribute for styling
export interface ValueProps extends BaseSelect.Value.Props {
  /** Placeholder text shown when no value is selected */
  placeholder?: React.ReactNode;
}

export const Value = React.forwardRef<HTMLSpanElement, ValueProps>(
  function Value({ className, ...props }, ref) {
    return (
      <BaseSelect.Value
        ref={ref}
        className={clsx(styles.value, className)}
        {...props}
      />
    );
  },
);

// Icon - renders chevron using CentralIcon
export interface IconProps extends Omit<BaseSelect.Icon.Props, "children"> {
  children?: React.ReactNode;
}

export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(function Icon(
  { className, children, ...props },
  ref,
) {
  return (
    <BaseSelect.Icon
      ref={ref}
      className={clsx(styles.icon, className)}
      {...props}
    >
      {children ?? <CentralIcon name="IconChevronDownSmall" size={20} />}
    </BaseSelect.Icon>
  );
});

// HybridIcon - icon for hybrid variant with its own hover/focus container
export interface HybridIconProps
  extends Omit<BaseSelect.Icon.Props, "children"> {
  children?: React.ReactNode;
}

export const HybridIcon = React.forwardRef<HTMLSpanElement, HybridIconProps>(
  function HybridIcon({ className, children, ...props }, ref) {
    return (
      <BaseSelect.Icon
        ref={ref}
        className={clsx(styles.hybridIcon, className)}
        {...props}
      >
        <span className={styles.hybridIconButton}>
          {children ?? (
            <CentralIcon name="IconChevronGrabberVertical" size={16} />
          )}
        </span>
      </BaseSelect.Icon>
    );
  },
);

/** @deprecated Use HybridIcon instead */
export const GhostIcon = HybridIcon;

// Portal
export interface PortalProps extends BaseSelect.Portal.Props {}

export function Portal(props: PortalProps) {
  return <BaseSelect.Portal {...props} />;
}

// Positioner - defaults to dropdown style (below trigger, left-aligned) like Combobox
export interface PositionerProps extends BaseSelect.Positioner.Props {}

export const Positioner = React.forwardRef<HTMLDivElement, PositionerProps>(
  function Positioner(
    {
      className,
      sideOffset = 4,
      align = "start",
      alignItemWithTrigger = false,
      ...props
    },
    ref,
  ) {
    return (
      <BaseSelect.Positioner
        ref={ref}
        className={clsx(styles.positioner, className)}
        sideOffset={sideOffset}
        align={align}
        alignItemWithTrigger={alignItemWithTrigger}
        {...props}
      />
    );
  },
);

// Popup
export interface PopupProps extends BaseSelect.Popup.Props {}

export const Popup = React.forwardRef<HTMLDivElement, PopupProps>(
  function Popup({ className, ...props }, ref) {
    return (
      <BaseSelect.Popup
        ref={ref}
        className={clsx(styles.popup, className)}
        {...props}
      />
    );
  },
);

// List - container for items with gap and padding
export interface ListProps extends BaseSelect.List.Props {}

export const List = React.forwardRef<HTMLDivElement, ListProps>(function List(
  { className, ...props },
  ref,
) {
  return (
    <BaseSelect.List
      ref={ref}
      className={clsx(styles.list, className)}
      {...props}
    />
  );
});

// Item - supports optional leading/trailing icon slots
export interface ItemProps extends BaseSelect.Item.Props {
  /** Optional leading icon (renders before children, e.g. flags) */
  leadingIcon?: React.ReactNode;
  /** Optional trailing icon (renders after ItemText) */
  trailingIcon?: React.ReactNode;
}

export const Item = React.forwardRef<HTMLDivElement, ItemProps>(function Item(
  { className, leadingIcon, trailingIcon, children, ...props },
  ref,
) {
  return (
    <BaseSelect.Item
      ref={ref}
      className={clsx(styles.item, className)}
      {...props}
    >
      {leadingIcon}
      {children}
      {trailingIcon && (
        <span className={styles.itemTrailing}>{trailingIcon}</span>
      )}
    </BaseSelect.Item>
  );
});

// ItemFlag - flag container for country selectors (matches PhoneInput pattern)
export interface ItemFlagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Flag image src */
  src: string;
  /** Alt text for the flag */
  alt?: string;
}

export const ItemFlag = React.forwardRef<HTMLSpanElement, ItemFlagProps>(
  function ItemFlag({ className, src, alt = "", ...props }, ref) {
    return (
      <span ref={ref} className={clsx(styles.itemFlag, className)} {...props}>
        <img src={src} alt={alt} />
      </span>
    );
  },
);

// ItemIndicator - renders selection dot (visibility handled via CSS on parent [data-selected])
export interface ItemIndicatorProps
  extends Omit<BaseSelect.ItemIndicator.Props, "children"> {
  children?: React.ReactNode;
}

export const ItemIndicator = React.forwardRef<
  HTMLSpanElement,
  ItemIndicatorProps
>(function ItemIndicator(
  { className, children, keepMounted = true, ...props },
  ref,
) {
  return (
    <BaseSelect.ItemIndicator
      ref={ref}
      className={clsx(styles.itemIndicator, className)}
      keepMounted={keepMounted}
      {...props}
    >
      {children ?? <span className={styles.itemIndicatorDot} />}
    </BaseSelect.ItemIndicator>
  );
});

// ItemText
export interface ItemTextProps extends BaseSelect.ItemText.Props {}

export const ItemText = React.forwardRef<HTMLDivElement, ItemTextProps>(
  function ItemText({ className, ...props }, ref) {
    return (
      <BaseSelect.ItemText
        ref={ref}
        className={clsx(styles.itemText, className)}
        {...props}
      />
    );
  },
);

// Empty - shown when no options available
export interface EmptyProps extends React.ComponentPropsWithoutRef<"div"> {}

export const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  function Empty({ className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx(styles.empty, className)} {...props}>
        {children ?? "No options available"}
      </div>
    );
  },
);

// Separator
export interface SeparatorProps extends BaseSelect.Separator.Props {}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator({ className, ...props }, ref) {
    return (
      <BaseSelect.Separator
        ref={ref}
        className={clsx(styles.separator, className)}
        {...props}
      />
    );
  },
);

// Group
export interface GroupProps extends BaseSelect.Group.Props {}

export const Group = React.forwardRef<HTMLDivElement, GroupProps>(
  function Group({ className, ...props }, ref) {
    return (
      <BaseSelect.Group
        ref={ref}
        className={clsx(styles.group, className)}
        {...props}
      />
    );
  },
);

// GroupLabel
export interface GroupLabelProps extends BaseSelect.GroupLabel.Props {}

export const GroupLabel = React.forwardRef<HTMLDivElement, GroupLabelProps>(
  function GroupLabel({ className, ...props }, ref) {
    return (
      <BaseSelect.GroupLabel
        ref={ref}
        className={clsx(styles.groupLabel, className)}
        {...props}
      />
    );
  },
);
