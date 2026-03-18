"use client";

import * as React from "react";
import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import clsx from "clsx";
// Reuse Menu styles - visually identical
import styles from "../Menu/Menu.module.scss";
import { CentralIcon } from "../Icon";
import { useTrackedOpenChange } from "../Analytics/useTrackedOpenChange";

// ============================================================================
// Root
// ============================================================================

export interface RootProps extends BaseContextMenu.Root.Props {
  analyticsName?: string;
}

export function Root({ analyticsName, onOpenChange, ...props }: RootProps) {
  const trackedOpenChange = useTrackedOpenChange(
    analyticsName,
    "ContextMenu",
    onOpenChange,
  );
  return <BaseContextMenu.Root onOpenChange={trackedOpenChange} {...props} />;
}

// ============================================================================
// Trigger - Wraps content that can be right-clicked
// Example: <ContextMenu.Trigger><Card>Right-click me</Card></ContextMenu.Trigger>
// ============================================================================

export interface TriggerProps extends BaseContextMenu.Trigger.Props {}

export const Trigger = React.forwardRef<HTMLDivElement, TriggerProps>(
  function Trigger(props, ref) {
    return <BaseContextMenu.Trigger ref={ref} {...props} />;
  },
);

// ============================================================================
// Portal
// ============================================================================

export interface PortalProps extends BaseContextMenu.Portal.Props {}

export function Portal(props: PortalProps) {
  return <BaseContextMenu.Portal {...props} />;
}

// ============================================================================
// Positioner
// ============================================================================

export interface PositionerProps extends BaseContextMenu.Positioner.Props {}

export const Positioner = React.forwardRef<HTMLDivElement, PositionerProps>(
  function Positioner({ className, sideOffset = 4, ...props }, ref) {
    return (
      <BaseContextMenu.Positioner
        ref={ref}
        className={clsx(styles.positioner, className)}
        sideOffset={sideOffset}
        {...props}
      />
    );
  },
);

// ============================================================================
// Popup
// ============================================================================

export interface PopupProps extends BaseContextMenu.Popup.Props {}

export const Popup = React.forwardRef<HTMLDivElement, PopupProps>(
  function Popup({ className, ...props }, ref) {
    return (
      <BaseContextMenu.Popup
        ref={ref}
        className={clsx(styles.popup, className)}
        {...props}
      />
    );
  },
);

// ============================================================================
// Item
// ============================================================================

export interface ItemProps extends BaseContextMenu.Item.Props {}

export const Item = React.forwardRef<HTMLDivElement, ItemProps>(function Item(
  { className, ...props },
  ref,
) {
  return (
    <BaseContextMenu.Item
      ref={ref}
      className={clsx(styles.item, className)}
      {...props}
    />
  );
});

// ============================================================================
// CheckboxItem
// ============================================================================

export interface CheckboxItemProps extends BaseContextMenu.CheckboxItem.Props {}

export const CheckboxItem = React.forwardRef<HTMLDivElement, CheckboxItemProps>(
  function CheckboxItem({ className, ...props }, ref) {
    return (
      <BaseContextMenu.CheckboxItem
        ref={ref}
        className={clsx(styles.checkboxItem, className)}
        {...props}
      />
    );
  },
);

// ============================================================================
// CheckboxItemIndicator
// Figma spec: 8x8px dot with --icon-primary background, --corner-radius-2xs
// ============================================================================

export interface CheckboxItemIndicatorProps
  extends BaseContextMenu.CheckboxItemIndicator.Props {}

export const CheckboxItemIndicator = React.forwardRef<
  HTMLSpanElement,
  CheckboxItemIndicatorProps
>(function CheckboxItemIndicator(
  { className, keepMounted = true, children, ...props },
  ref,
) {
  return (
    <BaseContextMenu.CheckboxItemIndicator
      ref={ref}
      className={clsx(styles.checkboxIndicator, className)}
      keepMounted={keepMounted}
      {...props}
    >
      {children ?? <span className={styles.checkboxIndicatorDot} />}
    </BaseContextMenu.CheckboxItemIndicator>
  );
});

// ============================================================================
// RadioGroup
// ============================================================================

export interface RadioGroupProps extends BaseContextMenu.RadioGroup.Props {}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup({ className, ...props }, ref) {
    return (
      <BaseContextMenu.RadioGroup
        ref={ref}
        className={clsx(styles.radioGroup, className)}
        {...props}
      />
    );
  },
);

// ============================================================================
// RadioItem
// ============================================================================

export interface RadioItemProps extends BaseContextMenu.RadioItem.Props {}

export const RadioItem = React.forwardRef<HTMLDivElement, RadioItemProps>(
  function RadioItem({ className, ...props }, ref) {
    return (
      <BaseContextMenu.RadioItem
        ref={ref}
        className={clsx(styles.radioItem, className)}
        {...props}
      />
    );
  },
);

// ============================================================================
// RadioItemIndicator
// Figma spec: IconCheckmark2Small with --icon-primary color
// ============================================================================

export interface RadioItemIndicatorProps
  extends BaseContextMenu.RadioItemIndicator.Props {}

export const RadioItemIndicator = React.forwardRef<
  HTMLSpanElement,
  RadioItemIndicatorProps
>(function RadioItemIndicator(
  { className, keepMounted = true, children, ...props },
  ref,
) {
  return (
    <BaseContextMenu.RadioItemIndicator
      ref={ref}
      className={clsx(styles.radioIndicator, className)}
      keepMounted={keepMounted}
      {...props}
    >
      {children ?? <CentralIcon name="IconCheckmark2Small" size={16} />}
    </BaseContextMenu.RadioItemIndicator>
  );
});

// ============================================================================
// Separator
// ============================================================================

export interface SeparatorProps extends BaseContextMenu.Separator.Props {}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator({ className, ...props }, ref) {
    return (
      <BaseContextMenu.Separator
        ref={ref}
        className={clsx(styles.separator, className)}
        {...props}
      />
    );
  },
);

// ============================================================================
// Group
// ============================================================================

export interface GroupProps extends BaseContextMenu.Group.Props {}

export const Group = React.forwardRef<HTMLDivElement, GroupProps>(
  function Group({ className, ...props }, ref) {
    return (
      <BaseContextMenu.Group
        ref={ref}
        className={clsx(styles.group, className)}
        {...props}
      />
    );
  },
);

// ============================================================================
// GroupLabel
// ============================================================================

export interface GroupLabelProps extends BaseContextMenu.GroupLabel.Props {}

export const GroupLabel = React.forwardRef<HTMLDivElement, GroupLabelProps>(
  function GroupLabel({ className, ...props }, ref) {
    return (
      <BaseContextMenu.GroupLabel
        ref={ref}
        className={clsx(styles.groupLabel, className)}
        {...props}
      />
    );
  },
);

// ============================================================================
// SubmenuRoot
// ============================================================================

export interface SubmenuRootProps extends BaseContextMenu.SubmenuRoot.Props {}

export function SubmenuRoot(props: SubmenuRootProps) {
  return <BaseContextMenu.SubmenuRoot {...props} />;
}

// ============================================================================
// SubmenuTrigger
// ============================================================================

export interface SubmenuTriggerProps
  extends BaseContextMenu.SubmenuTrigger.Props {}

export const SubmenuTrigger = React.forwardRef<
  HTMLDivElement,
  SubmenuTriggerProps
>(function SubmenuTrigger({ className, ...props }, ref) {
  return (
    <BaseContextMenu.SubmenuTrigger
      ref={ref}
      className={clsx(styles.submenuTrigger, className)}
      {...props}
    />
  );
});

// ============================================================================
// Arrow (optional)
// ============================================================================

export interface ArrowProps extends BaseContextMenu.Arrow.Props {}

export const Arrow = React.forwardRef<HTMLDivElement, ArrowProps>(
  function Arrow({ className, ...props }, ref) {
    return (
      <BaseContextMenu.Arrow
        ref={ref}
        className={clsx(styles.arrow, className)}
        {...props}
      />
    );
  },
);

// ============================================================================
// Backdrop (optional)
// ============================================================================

export interface BackdropProps extends BaseContextMenu.Backdrop.Props {}

export const Backdrop = React.forwardRef<HTMLDivElement, BackdropProps>(
  function Backdrop({ className, ...props }, ref) {
    return (
      <BaseContextMenu.Backdrop
        ref={ref}
        className={clsx(styles.backdrop, className)}
        {...props}
      />
    );
  },
);
