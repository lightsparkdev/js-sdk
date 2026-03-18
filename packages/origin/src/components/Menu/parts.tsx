"use client";

import * as React from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import clsx from "clsx";
import styles from "./Menu.module.scss";
import { CentralIcon } from "../Icon";
import { useTrackedOpenChange } from "../Analytics/useTrackedOpenChange";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";

// ============================================================================
// Root
// ============================================================================

export interface RootProps extends BaseMenu.Root.Props {
  analyticsName?: string;
}

export function Root({ analyticsName, onOpenChange, ...props }: RootProps) {
  const trackedOpenChange = useTrackedOpenChange(
    analyticsName,
    "Menu",
    onOpenChange,
  );
  return <BaseMenu.Root onOpenChange={trackedOpenChange} {...props} />;
}

// ============================================================================
// Trigger - Use with Button component via render prop
// Example: <Menu.Trigger render={<Button variant="secondary" />}>Actions</Menu.Trigger>
// ============================================================================

export interface TriggerProps extends BaseMenu.Trigger.Props {}

export const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  function Trigger(props, ref) {
    return <BaseMenu.Trigger ref={ref} {...props} />;
  },
);

// ============================================================================
// Portal
// ============================================================================

export interface PortalProps extends BaseMenu.Portal.Props {}

export function Portal(props: PortalProps) {
  return <BaseMenu.Portal {...props} />;
}

// ============================================================================
// Positioner
// ============================================================================

export interface PositionerProps extends BaseMenu.Positioner.Props {}

export const Positioner = React.forwardRef<HTMLDivElement, PositionerProps>(
  function Positioner({ className, sideOffset = 4, ...props }, ref) {
    return (
      <BaseMenu.Positioner
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

export interface PopupProps extends BaseMenu.Popup.Props {}

export const Popup = React.forwardRef<HTMLDivElement, PopupProps>(
  function Popup({ className, ...props }, ref) {
    return (
      <BaseMenu.Popup
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

export interface ItemProps extends BaseMenu.Item.Props {
  analyticsName?: string;
  analyticsValue?: string;
}

export const Item = React.forwardRef<HTMLDivElement, ItemProps>(function Item(
  { className, analyticsName, analyticsValue, onClick, ...props },
  ref,
) {
  const trackedClick = useTrackedCallback(
    analyticsName,
    "Menu.Item",
    "select",
    onClick,
    analyticsValue != null ? () => ({ value: analyticsValue }) : undefined,
  );

  return (
    <BaseMenu.Item
      ref={ref}
      className={clsx(styles.item, className)}
      onClick={trackedClick}
      {...props}
    />
  );
});

// ============================================================================
// CheckboxItem
// ============================================================================

export interface CheckboxItemProps extends BaseMenu.CheckboxItem.Props {}

export const CheckboxItem = React.forwardRef<HTMLDivElement, CheckboxItemProps>(
  function CheckboxItem({ className, ...props }, ref) {
    return (
      <BaseMenu.CheckboxItem
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
  extends BaseMenu.CheckboxItemIndicator.Props {}

export const CheckboxItemIndicator = React.forwardRef<
  HTMLSpanElement,
  CheckboxItemIndicatorProps
>(function CheckboxItemIndicator(
  { className, keepMounted = true, children, ...props },
  ref,
) {
  return (
    <BaseMenu.CheckboxItemIndicator
      ref={ref}
      className={clsx(styles.checkboxIndicator, className)}
      keepMounted={keepMounted}
      {...props}
    >
      {children ?? <span className={styles.checkboxIndicatorDot} />}
    </BaseMenu.CheckboxItemIndicator>
  );
});

// ============================================================================
// RadioGroup
// ============================================================================

export interface RadioGroupProps extends BaseMenu.RadioGroup.Props {}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup({ className, ...props }, ref) {
    return (
      <BaseMenu.RadioGroup
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

export interface RadioItemProps extends BaseMenu.RadioItem.Props {}

export const RadioItem = React.forwardRef<HTMLDivElement, RadioItemProps>(
  function RadioItem({ className, ...props }, ref) {
    return (
      <BaseMenu.RadioItem
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
  extends BaseMenu.RadioItemIndicator.Props {}

export const RadioItemIndicator = React.forwardRef<
  HTMLSpanElement,
  RadioItemIndicatorProps
>(function RadioItemIndicator(
  { className, keepMounted = true, children, ...props },
  ref,
) {
  return (
    <BaseMenu.RadioItemIndicator
      ref={ref}
      className={clsx(styles.radioIndicator, className)}
      keepMounted={keepMounted}
      {...props}
    >
      {children ?? <CentralIcon name="IconCheckmark2Small" size={16} />}
    </BaseMenu.RadioItemIndicator>
  );
});

// ============================================================================
// LinkItem - Renders as <a>, semantically correct for navigation links in menus
// ============================================================================

export interface LinkItemProps extends BaseMenu.LinkItem.Props {}

export const LinkItem = React.forwardRef<Element, LinkItemProps>(
  function LinkItem({ className, ...props }, ref) {
    return (
      <BaseMenu.LinkItem
        ref={ref}
        className={clsx(styles.item, className)}
        {...props}
      />
    );
  },
);

// ============================================================================
// Separator
// ============================================================================

export interface SeparatorProps extends BaseMenu.Separator.Props {}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator({ className, ...props }, ref) {
    return (
      <BaseMenu.Separator
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

export interface GroupProps extends BaseMenu.Group.Props {}

export const Group = React.forwardRef<HTMLDivElement, GroupProps>(
  function Group({ className, ...props }, ref) {
    return (
      <BaseMenu.Group
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

export interface GroupLabelProps extends BaseMenu.GroupLabel.Props {}

export const GroupLabel = React.forwardRef<HTMLDivElement, GroupLabelProps>(
  function GroupLabel({ className, ...props }, ref) {
    return (
      <BaseMenu.GroupLabel
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

export interface SubmenuRootProps extends BaseMenu.SubmenuRoot.Props {}

export function SubmenuRoot(props: SubmenuRootProps) {
  return <BaseMenu.SubmenuRoot {...props} />;
}

// ============================================================================
// SubmenuTrigger
// ============================================================================

export interface SubmenuTriggerProps extends BaseMenu.SubmenuTrigger.Props {}

export const SubmenuTrigger = React.forwardRef<
  HTMLDivElement,
  SubmenuTriggerProps
>(function SubmenuTrigger({ className, ...props }, ref) {
  return (
    <BaseMenu.SubmenuTrigger
      ref={ref}
      className={clsx(styles.submenuTrigger, className)}
      {...props}
    />
  );
});

// ============================================================================
// Arrow (optional)
// ============================================================================

export interface ArrowProps extends BaseMenu.Arrow.Props {}

export const Arrow = React.forwardRef<HTMLDivElement, ArrowProps>(
  function Arrow({ className, ...props }, ref) {
    return (
      <BaseMenu.Arrow
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

export interface BackdropProps extends BaseMenu.Backdrop.Props {}

export const Backdrop = React.forwardRef<HTMLDivElement, BackdropProps>(
  function Backdrop({ className, ...props }, ref) {
    return (
      <BaseMenu.Backdrop
        ref={ref}
        className={clsx(styles.backdrop, className)}
        {...props}
      />
    );
  },
);
