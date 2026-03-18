"use client";

import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import clsx from "clsx";
import styles from "./Tooltip.module.scss";

// Provider - Groups tooltips for shared delay behavior
export interface TooltipProviderProps extends BaseTooltip.Provider.Props {}

export function TooltipProvider(props: TooltipProviderProps) {
  return <BaseTooltip.Provider {...props} />;
}

// Root - Container for trigger + popup
export interface TooltipRootProps extends BaseTooltip.Root.Props {}

export function TooltipRoot(props: TooltipRootProps) {
  return <BaseTooltip.Root {...props} />;
}

// Trigger - Element that opens tooltip on hover/focus
export interface TooltipTriggerProps extends BaseTooltip.Trigger.Props {}

export const TooltipTrigger = React.forwardRef<
  HTMLButtonElement,
  TooltipTriggerProps
>(function TooltipTrigger(props, ref) {
  return <BaseTooltip.Trigger ref={ref} {...props} />;
});

// Portal - Renders tooltip outside DOM hierarchy
export interface TooltipPortalProps extends BaseTooltip.Portal.Props {}

export function TooltipPortal(props: TooltipPortalProps) {
  return <BaseTooltip.Portal {...props} />;
}

// Positioner - Handles positioning logic
export interface TooltipPositionerProps extends BaseTooltip.Positioner.Props {}

export const TooltipPositioner = React.forwardRef<
  HTMLDivElement,
  TooltipPositionerProps
>(function TooltipPositioner({ className, ...props }, ref) {
  return (
    <BaseTooltip.Positioner
      ref={ref}
      className={clsx(styles.positioner, className)}
      {...props}
    />
  );
});

// Popup - The visible tooltip container
export interface TooltipPopupProps extends BaseTooltip.Popup.Props {}

export const TooltipPopup = React.forwardRef<HTMLDivElement, TooltipPopupProps>(
  function TooltipPopup({ className, ...props }, ref) {
    return (
      <BaseTooltip.Popup
        ref={ref}
        className={clsx(styles.popup, className)}
        {...props}
      />
    );
  },
);

// Arrow - Pointer toward trigger
export interface TooltipArrowProps extends BaseTooltip.Arrow.Props {}

export const TooltipArrow = React.forwardRef<HTMLDivElement, TooltipArrowProps>(
  function TooltipArrow({ className, ...props }, ref) {
    return (
      <BaseTooltip.Arrow
        ref={ref}
        className={clsx(styles.arrow, className)}
        {...props}
      />
    );
  },
);

// Compound component export
export const Tooltip = {
  Provider: TooltipProvider,
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Portal: TooltipPortal,
  Positioner: TooltipPositioner,
  Popup: TooltipPopup,
  Arrow: TooltipArrow,
};

// Display names for debugging
if (process.env.NODE_ENV !== "production") {
  TooltipProvider.displayName = "Tooltip.Provider";
  TooltipRoot.displayName = "Tooltip.Root";
  TooltipTrigger.displayName = "Tooltip.Trigger";
  TooltipPortal.displayName = "Tooltip.Portal";
  TooltipPositioner.displayName = "Tooltip.Positioner";
  TooltipPopup.displayName = "Tooltip.Popup";
  TooltipArrow.displayName = "Tooltip.Arrow";
}
