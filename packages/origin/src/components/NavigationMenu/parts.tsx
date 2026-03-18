"use client";

import * as React from "react";
import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu";
import clsx from "clsx";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import styles from "./NavigationMenu.module.scss";

/* -------------------------------------------------------------------------------------------------
 * Root
 * -----------------------------------------------------------------------------------------------*/

export interface RootProps extends BaseNavigationMenu.Root.Props {
  className?: string;
  analyticsName?: string;
}

export const Root = React.forwardRef<HTMLElement, RootProps>(
  function Root(props, forwardedRef) {
    const { className, analyticsName, onValueChange, ...rootProps } = props;
    const trackedChange = useTrackedCallback(
      analyticsName,
      "NavigationMenu",
      "change",
      onValueChange,
      (value: unknown) => ({ value }),
    );

    return (
      <BaseNavigationMenu.Root
        ref={forwardedRef}
        className={clsx(styles.root, className)}
        onValueChange={trackedChange}
        {...rootProps}
      />
    );
  },
);

/* -------------------------------------------------------------------------------------------------
 * List
 * -----------------------------------------------------------------------------------------------*/

export interface ListProps extends BaseNavigationMenu.List.Props {
  className?: string;
}

export const List = React.forwardRef<HTMLUListElement, ListProps>(
  function List(props, forwardedRef) {
    const { className, ...listProps } = props;
    return (
      <BaseNavigationMenu.List
        ref={forwardedRef}
        className={clsx(styles.list, className)}
        {...listProps}
      />
    );
  },
);

/* -------------------------------------------------------------------------------------------------
 * Item
 * -----------------------------------------------------------------------------------------------*/

export interface ItemProps extends BaseNavigationMenu.Item.Props {
  className?: string;
}

export const Item = React.forwardRef<HTMLLIElement, ItemProps>(
  function Item(props, forwardedRef) {
    const { className, ...itemProps } = props;
    return (
      <BaseNavigationMenu.Item
        ref={forwardedRef}
        className={clsx(styles.item, className)}
        {...itemProps}
      />
    );
  },
);

/* -------------------------------------------------------------------------------------------------
 * Trigger (Button variant - opens dropdown)
 * -----------------------------------------------------------------------------------------------*/

export interface TriggerProps extends BaseNavigationMenu.Trigger.Props {
  className?: string;
}

export const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  function Trigger(props, forwardedRef) {
    const { className, ...triggerProps } = props;
    return (
      <BaseNavigationMenu.Trigger
        ref={forwardedRef}
        className={clsx(styles.trigger, className)}
        {...triggerProps}
      />
    );
  },
);

/* -------------------------------------------------------------------------------------------------
 * Icon (Chevron indicator)
 * -----------------------------------------------------------------------------------------------*/

export interface IconProps extends BaseNavigationMenu.Icon.Props {
  className?: string;
}

export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  function Icon(props, forwardedRef) {
    const { className, ...iconProps } = props;
    return (
      <BaseNavigationMenu.Icon
        ref={forwardedRef}
        className={clsx(styles.icon, className)}
        {...iconProps}
      />
    );
  },
);

/* -------------------------------------------------------------------------------------------------
 * Link (Direct navigation)
 * -----------------------------------------------------------------------------------------------*/

export interface LinkProps extends BaseNavigationMenu.Link.Props {
  className?: string;
  /** Whether the link is the currently active page */
  active?: boolean;
  /** Whether the link is disabled */
  disabled?: boolean;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function Link(props, forwardedRef) {
    const { className, active, disabled, ...linkProps } = props;
    return (
      <BaseNavigationMenu.Link
        ref={forwardedRef}
        className={clsx(styles.link, className)}
        active={active}
        data-disabled={disabled || undefined}
        aria-disabled={disabled || undefined}
        {...linkProps}
      />
    );
  },
);

/* -------------------------------------------------------------------------------------------------
 * Action (Button for actions like Sign Out)
 * -----------------------------------------------------------------------------------------------*/

export interface ActionProps extends React.ComponentPropsWithoutRef<"button"> {
  /** Whether the action is currently active */
  active?: boolean;
}

export const Action = React.forwardRef<HTMLButtonElement, ActionProps>(
  function Action(props, forwardedRef) {
    const { className, active, disabled, ...actionProps } = props;
    return (
      <button
        ref={forwardedRef}
        type="button"
        className={clsx(styles.action, className)}
        data-active={active ? "" : undefined}
        disabled={disabled}
        {...actionProps}
      />
    );
  },
);

/* -------------------------------------------------------------------------------------------------
 * ActionIcon (Icon-only button for actions)
 * -----------------------------------------------------------------------------------------------*/

export interface ActionIconProps
  extends React.ComponentPropsWithoutRef<"button"> {
  /** Whether the action is currently active */
  active?: boolean;
}

export const ActionIcon = React.forwardRef<HTMLButtonElement, ActionIconProps>(
  function ActionIcon(props, forwardedRef) {
    const { className, active, disabled, ...actionProps } = props;
    return (
      <button
        ref={forwardedRef}
        type="button"
        className={clsx(styles.actionIcon, className)}
        data-active={active ? "" : undefined}
        disabled={disabled}
        {...actionProps}
      />
    );
  },
);

/* -------------------------------------------------------------------------------------------------
 * Content (Dropdown content container)
 * -----------------------------------------------------------------------------------------------*/

export interface ContentProps extends BaseNavigationMenu.Content.Props {
  className?: string;
}

export const Content = React.forwardRef<HTMLDivElement, ContentProps>(
  function Content(props, forwardedRef) {
    const { className, ...contentProps } = props;
    return (
      <BaseNavigationMenu.Content
        ref={forwardedRef}
        className={clsx(styles.content, className)}
        {...contentProps}
      />
    );
  },
);

/* -------------------------------------------------------------------------------------------------
 * Portal
 * -----------------------------------------------------------------------------------------------*/

export interface PortalProps extends BaseNavigationMenu.Portal.Props {}

export function Portal(props: PortalProps) {
  return <BaseNavigationMenu.Portal {...props} />;
}

/* -------------------------------------------------------------------------------------------------
 * Positioner
 * -----------------------------------------------------------------------------------------------*/

export interface PositionerProps extends BaseNavigationMenu.Positioner.Props {
  className?: string;
}

export const Positioner = React.forwardRef<HTMLDivElement, PositionerProps>(
  function Positioner(props, forwardedRef) {
    const { className, ...positionerProps } = props;
    return (
      <BaseNavigationMenu.Positioner
        ref={forwardedRef}
        className={clsx(styles.positioner, className)}
        sideOffset={10}
        {...positionerProps}
      />
    );
  },
);

/* -------------------------------------------------------------------------------------------------
 * Popup (Dropdown surface)
 * -----------------------------------------------------------------------------------------------*/

export interface PopupProps extends BaseNavigationMenu.Popup.Props {
  className?: string;
}

export const Popup = React.forwardRef<HTMLElement, PopupProps>(
  function Popup(props, forwardedRef) {
    const { className, ...popupProps } = props;
    return (
      <BaseNavigationMenu.Popup
        ref={forwardedRef}
        className={clsx(styles.popup, className)}
        {...popupProps}
      />
    );
  },
);

/* -------------------------------------------------------------------------------------------------
 * Viewport
 * -----------------------------------------------------------------------------------------------*/

export interface ViewportProps extends BaseNavigationMenu.Viewport.Props {
  className?: string;
}

export const Viewport = React.forwardRef<HTMLDivElement, ViewportProps>(
  function Viewport(props, forwardedRef) {
    const { className, ...viewportProps } = props;
    return (
      <BaseNavigationMenu.Viewport
        ref={forwardedRef}
        className={clsx(styles.viewport, className)}
        {...viewportProps}
      />
    );
  },
);

/* -------------------------------------------------------------------------------------------------
 * Arrow
 * -----------------------------------------------------------------------------------------------*/

export interface ArrowProps extends BaseNavigationMenu.Arrow.Props {
  className?: string;
}

export const Arrow = React.forwardRef<HTMLDivElement, ArrowProps>(
  function Arrow(props, forwardedRef) {
    const { className, ...arrowProps } = props;
    return (
      <BaseNavigationMenu.Arrow
        ref={forwardedRef}
        className={clsx(styles.arrow, className)}
        {...arrowProps}
      />
    );
  },
);

/* -------------------------------------------------------------------------------------------------
 * Backdrop
 * -----------------------------------------------------------------------------------------------*/

export interface BackdropProps extends BaseNavigationMenu.Backdrop.Props {
  className?: string;
}

export const Backdrop = React.forwardRef<HTMLDivElement, BackdropProps>(
  function Backdrop(props, forwardedRef) {
    const { className, ...backdropProps } = props;
    return (
      <BaseNavigationMenu.Backdrop
        ref={forwardedRef}
        className={clsx(styles.backdrop, className)}
        {...backdropProps}
      />
    );
  },
);

/* -------------------------------------------------------------------------------------------------
 * PopupItem (Items inside the dropdown - custom, not from Base UI)
 * -----------------------------------------------------------------------------------------------*/

export interface PopupItemProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Trailing content (icon, shortcut) */
  trailing?: React.ReactNode;
  /** Whether the item is disabled */
  disabled?: boolean;
}

export const PopupItem = React.forwardRef<HTMLDivElement, PopupItemProps>(
  function PopupItem(props, forwardedRef) {
    const { className, children, trailing, disabled, ...itemProps } = props;
    return (
      <div
        ref={forwardedRef}
        className={clsx(styles.popupItem, className)}
        data-disabled={disabled || undefined}
        {...itemProps}
      >
        {children}
        {trailing && (
          <span className={styles.popupItemTrailing}>{trailing}</span>
        )}
      </div>
    );
  },
);

/* -------------------------------------------------------------------------------------------------
 * Group (Groups items with optional label)
 * -----------------------------------------------------------------------------------------------*/

export interface GroupProps extends React.ComponentPropsWithoutRef<"div"> {}

export const Group = React.forwardRef<HTMLDivElement, GroupProps>(
  function Group(props, forwardedRef) {
    const { className, ...groupProps } = props;
    return (
      <div
        ref={forwardedRef}
        className={clsx(styles.group, className)}
        {...groupProps}
      />
    );
  },
);

/* -------------------------------------------------------------------------------------------------
 * GroupLabel
 * -----------------------------------------------------------------------------------------------*/

export interface GroupLabelProps
  extends React.ComponentPropsWithoutRef<"div"> {}

export const GroupLabel = React.forwardRef<HTMLDivElement, GroupLabelProps>(
  function GroupLabel(props, forwardedRef) {
    const { className, ...labelProps } = props;
    return (
      <div
        ref={forwardedRef}
        className={clsx(styles.groupLabel, className)}
        {...labelProps}
      />
    );
  },
);

/* -------------------------------------------------------------------------------------------------
 * Separator
 * -----------------------------------------------------------------------------------------------*/

export interface SeparatorProps extends React.ComponentPropsWithoutRef<"div"> {}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator(props, forwardedRef) {
    const { className, ...separatorProps } = props;
    return (
      <div
        ref={forwardedRef}
        className={clsx(styles.separator, className)}
        role="separator"
        {...separatorProps}
      />
    );
  },
);

/* -------------------------------------------------------------------------------------------------
 * Compound export
 * -----------------------------------------------------------------------------------------------*/

export const NavigationMenu = {
  Root,
  List,
  Item,
  Trigger,
  Icon,
  Link,
  Action,
  ActionIcon,
  Content,
  Portal,
  Positioner,
  Popup,
  Viewport,
  Arrow,
  Backdrop,
  PopupItem,
  Group,
  GroupLabel,
  Separator,
};
