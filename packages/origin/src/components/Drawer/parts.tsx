"use client";

import * as React from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import clsx from "clsx";
import { useTrackedOpenChange } from "../Analytics/useTrackedOpenChange";
import styles from "./Drawer.module.scss";

// Provider
export interface DrawerProviderProps extends BaseDrawer.Provider.Props {}

export function DrawerProvider(props: DrawerProviderProps) {
  return <BaseDrawer.Provider {...props} />;
}

// Root
export interface DrawerRootProps extends BaseDrawer.Root.Props {
  analyticsName?: string;
}

export function DrawerRoot({
  analyticsName,
  onOpenChange,
  ...props
}: DrawerRootProps) {
  const trackedOpenChange = useTrackedOpenChange(
    analyticsName,
    "Drawer",
    onOpenChange,
  );
  return <BaseDrawer.Root onOpenChange={trackedOpenChange} {...props} />;
}

// Trigger
export interface DrawerTriggerProps extends BaseDrawer.Trigger.Props {}

export const DrawerTrigger = React.forwardRef<
  HTMLButtonElement,
  DrawerTriggerProps
>(function DrawerTrigger(props, ref) {
  return <BaseDrawer.Trigger ref={ref} {...props} />;
});

// Portal
export interface DrawerPortalProps extends BaseDrawer.Portal.Props {}

export function DrawerPortal(props: DrawerPortalProps) {
  return <BaseDrawer.Portal {...props} />;
}

// Backdrop
export interface DrawerBackdropProps extends BaseDrawer.Backdrop.Props {}

export const DrawerBackdrop = React.forwardRef<
  HTMLDivElement,
  DrawerBackdropProps
>(function DrawerBackdrop({ className, ...props }, ref) {
  return (
    <BaseDrawer.Backdrop
      ref={ref}
      className={clsx(styles.backdrop, className)}
      {...props}
    />
  );
});

// Viewport
export interface DrawerViewportProps extends BaseDrawer.Viewport.Props {}

export const DrawerViewport = React.forwardRef<
  HTMLDivElement,
  DrawerViewportProps
>(function DrawerViewport({ className, ...props }, ref) {
  return (
    <BaseDrawer.Viewport
      ref={ref}
      className={clsx(styles.viewport, className)}
      {...props}
    />
  );
});

// Popup
export interface DrawerPopupProps extends BaseDrawer.Popup.Props {
  nestedMotion?: "stack";
}

export const DrawerPopup = React.forwardRef<HTMLDivElement, DrawerPopupProps>(
  function DrawerPopup({ className, nestedMotion, ...props }, ref) {
    return (
      <BaseDrawer.Popup
        ref={ref}
        className={clsx(styles.popup, className)}
        data-nested-motion={nestedMotion}
        {...props}
      />
    );
  },
);

// Content
export interface DrawerContentProps extends BaseDrawer.Content.Props {}

export const DrawerContent = React.forwardRef<
  HTMLDivElement,
  DrawerContentProps
>(function DrawerContent({ className, ...props }, ref) {
  return (
    <BaseDrawer.Content
      ref={ref}
      className={clsx(styles.content, className)}
      {...props}
    />
  );
});

// Title
export interface DrawerTitleProps extends BaseDrawer.Title.Props {}

export const DrawerTitle = React.forwardRef<
  HTMLHeadingElement,
  DrawerTitleProps
>(function DrawerTitle({ className, ...props }, ref) {
  return (
    <BaseDrawer.Title
      ref={ref}
      className={clsx(styles.title, className)}
      {...props}
    />
  );
});

// Description
export interface DrawerDescriptionProps extends BaseDrawer.Description.Props {}

export const DrawerDescription = React.forwardRef<
  HTMLParagraphElement,
  DrawerDescriptionProps
>(function DrawerDescription({ className, ...props }, ref) {
  return (
    <BaseDrawer.Description
      ref={ref}
      className={clsx(styles.description, className)}
      {...props}
    />
  );
});

// Close
export interface DrawerCloseProps extends BaseDrawer.Close.Props {}

export const DrawerClose = React.forwardRef<
  HTMLButtonElement,
  DrawerCloseProps
>(function DrawerClose(props, ref) {
  return <BaseDrawer.Close ref={ref} {...props} />;
});

// Indent
export interface DrawerIndentProps extends BaseDrawer.Indent.Props {}

export const DrawerIndent = React.forwardRef<HTMLDivElement, DrawerIndentProps>(
  function DrawerIndent({ className, ...props }, ref) {
    return (
      <BaseDrawer.Indent
        ref={ref}
        className={clsx(styles.indent, className)}
        {...props}
      />
    );
  },
);

// IndentBackground
export interface DrawerIndentBackgroundProps
  extends BaseDrawer.IndentBackground.Props {}

export const DrawerIndentBackground = React.forwardRef<
  HTMLDivElement,
  DrawerIndentBackgroundProps
>(function DrawerIndentBackground({ className, ...props }, ref) {
  return (
    <BaseDrawer.IndentBackground
      ref={ref}
      className={clsx(styles.indentBackground, className)}
      {...props}
    />
  );
});

// Handle (drag bar for bottom sheets)
export interface DrawerHandleProps extends React.ComponentPropsWithRef<"div"> {}

export const DrawerHandle = React.forwardRef<HTMLDivElement, DrawerHandleProps>(
  function DrawerHandle({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={clsx(styles.handle, className)}
        {...props}
      />
    );
  },
);

// Display names
if (process.env.NODE_ENV !== "production") {
  DrawerProvider.displayName = "Drawer.Provider";
  DrawerRoot.displayName = "Drawer.Root";
  DrawerTrigger.displayName = "Drawer.Trigger";
  DrawerPortal.displayName = "Drawer.Portal";
  DrawerBackdrop.displayName = "Drawer.Backdrop";
  DrawerViewport.displayName = "Drawer.Viewport";
  DrawerPopup.displayName = "Drawer.Popup";
  DrawerContent.displayName = "Drawer.Content";
  DrawerTitle.displayName = "Drawer.Title";
  DrawerDescription.displayName = "Drawer.Description";
  DrawerClose.displayName = "Drawer.Close";
  DrawerHandle.displayName = "Drawer.Handle";
  DrawerIndent.displayName = "Drawer.Indent";
  DrawerIndentBackground.displayName = "Drawer.IndentBackground";
}
