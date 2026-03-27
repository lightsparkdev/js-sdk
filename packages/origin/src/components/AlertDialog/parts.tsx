"use client";

import * as React from "react";
import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import clsx from "clsx";
import { useTrackedOpenChange } from "../Analytics/useTrackedOpenChange";
import styles from "./AlertDialog.module.scss";

export interface RootProps extends BaseAlertDialog.Root.Props {
  analyticsName?: string;
}
export function Root({ analyticsName, onOpenChange, ...props }: RootProps) {
  const trackedOpenChange = useTrackedOpenChange(
    analyticsName,
    "AlertDialog",
    onOpenChange,
  );
  return <BaseAlertDialog.Root onOpenChange={trackedOpenChange} {...props} />;
}

export interface TriggerProps extends BaseAlertDialog.Trigger.Props {}
export const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  function Trigger(props, ref) {
    return <BaseAlertDialog.Trigger ref={ref} {...props} />;
  },
);

export interface PortalProps extends BaseAlertDialog.Portal.Props {}
export function Portal(props: PortalProps) {
  return <BaseAlertDialog.Portal {...props} />;
}

export interface BackdropProps extends BaseAlertDialog.Backdrop.Props {}
export const Backdrop = React.forwardRef<HTMLDivElement, BackdropProps>(
  function Backdrop({ className, ...props }, ref) {
    return (
      <BaseAlertDialog.Backdrop
        ref={ref}
        className={clsx(styles.backdrop, className)}
        {...props}
      />
    );
  },
);

export interface PopupProps extends BaseAlertDialog.Popup.Props {}
export const Popup = React.forwardRef<HTMLDivElement, PopupProps>(
  function Popup({ className, ...props }, ref) {
    return (
      <BaseAlertDialog.Popup
        ref={ref}
        className={clsx(styles.popup, className)}
        {...props}
      />
    );
  },
);

export interface TitleProps extends BaseAlertDialog.Title.Props {}
export const Title = React.forwardRef<HTMLHeadingElement, TitleProps>(
  function Title({ className, ...props }, ref) {
    return (
      <BaseAlertDialog.Title
        ref={ref}
        className={clsx(styles.title, className)}
        {...props}
      />
    );
  },
);

export interface DescriptionProps extends BaseAlertDialog.Description.Props {}
export const Description = React.forwardRef<
  HTMLParagraphElement,
  DescriptionProps
>(function Description({ className, ...props }, ref) {
  return (
    <BaseAlertDialog.Description
      ref={ref}
      className={clsx(styles.description, className)}
      {...props}
    />
  );
});

export interface CloseProps extends BaseAlertDialog.Close.Props {}
export const Close = React.forwardRef<HTMLButtonElement, CloseProps>(
  function Close(props, ref) {
    return <BaseAlertDialog.Close ref={ref} {...props} />;
  },
);

export interface ActionsProps extends React.HTMLAttributes<HTMLDivElement> {}
export const Actions = React.forwardRef<HTMLDivElement, ActionsProps>(
  function Actions({ className, ...props }, ref) {
    return (
      <div ref={ref} className={clsx(styles.actions, className)} {...props} />
    );
  },
);
