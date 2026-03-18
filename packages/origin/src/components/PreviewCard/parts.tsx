"use client";

import * as React from "react";
import { PreviewCard as BasePreviewCard } from "@base-ui/react/preview-card";
import clsx from "clsx";
import { useTrackedOpenChange } from "../Analytics/useTrackedOpenChange";
import styles from "./PreviewCard.module.scss";

export interface PreviewCardRootProps extends BasePreviewCard.Root.Props {
  analyticsName?: string;
}

export function PreviewCardRoot({
  analyticsName,
  onOpenChange,
  ...props
}: PreviewCardRootProps) {
  const trackedOpenChange = useTrackedOpenChange(
    analyticsName,
    "PreviewCard",
    onOpenChange,
  );
  return <BasePreviewCard.Root onOpenChange={trackedOpenChange} {...props} />;
}

export interface PreviewCardTriggerProps
  extends BasePreviewCard.Trigger.Props {}

export const PreviewCardTrigger = React.forwardRef<
  HTMLAnchorElement,
  PreviewCardTriggerProps
>(function PreviewCardTrigger(props, ref) {
  return <BasePreviewCard.Trigger ref={ref} {...props} />;
});

export interface PreviewCardPortalProps extends BasePreviewCard.Portal.Props {}

export function PreviewCardPortal(props: PreviewCardPortalProps) {
  return <BasePreviewCard.Portal {...props} />;
}

export interface PreviewCardPositionerProps
  extends BasePreviewCard.Positioner.Props {}

export const PreviewCardPositioner = React.forwardRef<
  HTMLDivElement,
  PreviewCardPositionerProps
>(function PreviewCardPositioner({ className, sideOffset = 8, ...props }, ref) {
  return (
    <BasePreviewCard.Positioner
      ref={ref}
      className={clsx(styles.positioner, className)}
      sideOffset={sideOffset}
      {...props}
    />
  );
});

export interface PreviewCardPopupProps extends BasePreviewCard.Popup.Props {}

export const PreviewCardPopup = React.forwardRef<
  HTMLDivElement,
  PreviewCardPopupProps
>(function PreviewCardPopup({ className, ...props }, ref) {
  return (
    <BasePreviewCard.Popup
      ref={ref}
      className={clsx(styles.popup, className)}
      {...props}
    />
  );
});

export interface PreviewCardArrowProps extends BasePreviewCard.Arrow.Props {}

export const PreviewCardArrow = React.forwardRef<
  HTMLDivElement,
  PreviewCardArrowProps
>(function PreviewCardArrow({ className, ...props }, ref) {
  return (
    <BasePreviewCard.Arrow
      ref={ref}
      className={clsx(styles.arrow, className)}
      {...props}
    />
  );
});

if (process.env.NODE_ENV !== "production") {
  PreviewCardRoot.displayName = "PreviewCard.Root";
  PreviewCardTrigger.displayName = "PreviewCard.Trigger";
  PreviewCardPortal.displayName = "PreviewCard.Portal";
  PreviewCardPositioner.displayName = "PreviewCard.Positioner";
  PreviewCardPopup.displayName = "PreviewCard.Popup";
  PreviewCardArrow.displayName = "PreviewCard.Arrow";
}
