"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import clsx from "clsx";
import { useTrackedOpenChange } from "../Analytics/useTrackedOpenChange";
import styles from "./Popover.module.scss";

// Root - Groups all parts, manages open state
export interface PopoverRootProps extends BasePopover.Root.Props {
  analyticsName?: string;
}

export function PopoverRoot({
  analyticsName,
  onOpenChange,
  ...props
}: PopoverRootProps) {
  const trackedOpenChange = useTrackedOpenChange(
    analyticsName,
    "Popover",
    onOpenChange,
  );
  return <BasePopover.Root onOpenChange={trackedOpenChange} {...props} />;
}

// Trigger - Button that opens the popover
export interface PopoverTriggerProps extends BasePopover.Trigger.Props {}

export const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  PopoverTriggerProps
>(function PopoverTrigger(props, ref) {
  return <BasePopover.Trigger ref={ref} {...props} />;
});

// Portal - Renders popover outside DOM hierarchy
export interface PopoverPortalProps extends BasePopover.Portal.Props {}

export function PopoverPortal(props: PopoverPortalProps) {
  return <BasePopover.Portal {...props} />;
}

// Positioner - Handles anchored positioning
export interface PopoverPositionerProps extends BasePopover.Positioner.Props {}

export const PopoverPositioner = React.forwardRef<
  HTMLDivElement,
  PopoverPositionerProps
>(function PopoverPositioner({ className, sideOffset = 6, ...props }, ref) {
  return (
    <BasePopover.Positioner
      ref={ref}
      className={clsx(styles.positioner, className)}
      sideOffset={sideOffset}
      {...props}
    />
  );
});

// Popup - The visible popover surface
export interface PopoverPopupProps extends BasePopover.Popup.Props {}

export const PopoverPopup = React.forwardRef<HTMLDivElement, PopoverPopupProps>(
  function PopoverPopup({ className, ...props }, ref) {
    return (
      <BasePopover.Popup
        ref={ref}
        className={clsx(styles.popup, className)}
        {...props}
      />
    );
  },
);

// Backdrop - Overlay behind the popover in modal mode
export interface PopoverBackdropProps extends BasePopover.Backdrop.Props {}

export const PopoverBackdrop = React.forwardRef<
  HTMLDivElement,
  PopoverBackdropProps
>(function PopoverBackdrop({ className, ...props }, ref) {
  return (
    <BasePopover.Backdrop
      ref={ref}
      className={clsx(styles.backdrop, className)}
      {...props}
    />
  );
});

// Viewport - Enables content transitions when multiple triggers share one popover
// See: https://base-ui.com/react/components/popover (detached triggers section)
export interface PopoverViewportProps extends BasePopover.Viewport.Props {}

export const PopoverViewport = React.forwardRef<
  HTMLDivElement,
  PopoverViewportProps
>(function PopoverViewport(props, ref) {
  return <BasePopover.Viewport ref={ref} {...props} />;
});

// Arrow - Optional pointer toward trigger
export interface PopoverArrowProps extends BasePopover.Arrow.Props {}

export const PopoverArrow = React.forwardRef<HTMLDivElement, PopoverArrowProps>(
  function PopoverArrow({ className, ...props }, ref) {
    return (
      <BasePopover.Arrow
        ref={ref}
        className={clsx(styles.arrow, className)}
        {...props}
      />
    );
  },
);

// Close - Button that closes the popover
export interface PopoverCloseProps extends BasePopover.Close.Props {}

export const PopoverClose = React.forwardRef<
  HTMLButtonElement,
  PopoverCloseProps
>(function PopoverClose(props, ref) {
  return <BasePopover.Close ref={ref} {...props} />;
});

// Title - Accessible popover title
export interface PopoverTitleProps extends BasePopover.Title.Props {}

export const PopoverTitle = React.forwardRef<
  HTMLHeadingElement,
  PopoverTitleProps
>(function PopoverTitle(props, ref) {
  return <BasePopover.Title ref={ref} {...props} />;
});

// Description - Accessible popover description
export interface PopoverDescriptionProps
  extends BasePopover.Description.Props {}

export const PopoverDescription = React.forwardRef<
  HTMLParagraphElement,
  PopoverDescriptionProps
>(function PopoverDescription(props, ref) {
  return <BasePopover.Description ref={ref} {...props} />;
});

// Compound component export
export const Popover = {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Portal: PopoverPortal,
  Positioner: PopoverPositioner,
  Popup: PopoverPopup,
  Backdrop: PopoverBackdrop,
  Viewport: PopoverViewport,
  Arrow: PopoverArrow,
  Close: PopoverClose,
  Title: PopoverTitle,
  Description: PopoverDescription,
};

// Display names for debugging
if (process.env.NODE_ENV !== "production") {
  PopoverRoot.displayName = "Popover.Root";
  PopoverTrigger.displayName = "Popover.Trigger";
  PopoverPortal.displayName = "Popover.Portal";
  PopoverPositioner.displayName = "Popover.Positioner";
  PopoverPopup.displayName = "Popover.Popup";
  PopoverBackdrop.displayName = "Popover.Backdrop";
  PopoverViewport.displayName = "Popover.Viewport";
  PopoverArrow.displayName = "Popover.Arrow";
  PopoverClose.displayName = "Popover.Close";
  PopoverTitle.displayName = "Popover.Title";
  PopoverDescription.displayName = "Popover.Description";
}
