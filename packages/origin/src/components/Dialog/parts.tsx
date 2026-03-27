"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import clsx from "clsx";
import { CentralIcon } from "../Icon";
import { useTrackedOpenChange } from "../Analytics/useTrackedOpenChange";
import styles from "./Dialog.module.scss";

export interface RootProps extends BaseDialog.Root.Props {
  analyticsName?: string;
}
export function Root({ analyticsName, onOpenChange, ...props }: RootProps) {
  const trackedOpenChange = useTrackedOpenChange(
    analyticsName,
    "Dialog",
    onOpenChange,
  );
  return <BaseDialog.Root onOpenChange={trackedOpenChange} {...props} />;
}

export interface TriggerProps extends BaseDialog.Trigger.Props {}
export const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  function Trigger(props, ref) {
    return <BaseDialog.Trigger ref={ref} {...props} />;
  },
);

export interface PortalProps extends BaseDialog.Portal.Props {}
export function Portal(props: PortalProps) {
  return <BaseDialog.Portal {...props} />;
}

export interface BackdropProps extends BaseDialog.Backdrop.Props {}
export const Backdrop = React.forwardRef<HTMLDivElement, BackdropProps>(
  function Backdrop({ className, ...props }, ref) {
    return (
      <BaseDialog.Backdrop
        ref={ref}
        className={clsx(styles.backdrop, className)}
        {...props}
      />
    );
  },
);

export interface ViewportProps extends BaseDialog.Viewport.Props {}
export const Viewport = React.forwardRef<HTMLDivElement, ViewportProps>(
  function Viewport({ className, ...props }, ref) {
    return (
      <BaseDialog.Viewport
        ref={ref}
        className={clsx(styles.viewport, className)}
        {...props}
      />
    );
  },
);

export interface PopupProps extends BaseDialog.Popup.Props {}
export const Popup = React.forwardRef<HTMLDivElement, PopupProps>(
  function Popup({ className, ...props }, ref) {
    return (
      <BaseDialog.Popup
        ref={ref}
        className={clsx(styles.popup, className)}
        {...props}
      />
    );
  },
);

export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  function Header({ className, ...props }, ref) {
    return (
      <div ref={ref} className={clsx(styles.header, className)} {...props} />
    );
  },
);

export interface ContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export const Content = React.forwardRef<HTMLDivElement, ContentProps>(
  function Content({ className, ...props }, ref) {
    return (
      <div ref={ref} className={clsx(styles.content, className)} {...props} />
    );
  },
);

export interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export const Footer = React.forwardRef<HTMLDivElement, FooterProps>(
  function Footer({ className, ...props }, ref) {
    return (
      <div ref={ref} className={clsx(styles.footer, className)} {...props} />
    );
  },
);

export interface TitleProps extends BaseDialog.Title.Props {}
export const Title = React.forwardRef<HTMLHeadingElement, TitleProps>(
  function Title({ className, ...props }, ref) {
    return (
      <BaseDialog.Title
        ref={ref}
        className={clsx(styles.title, className)}
        {...props}
      />
    );
  },
);

export interface DescriptionProps extends BaseDialog.Description.Props {}
export const Description = React.forwardRef<
  HTMLParagraphElement,
  DescriptionProps
>(function Description({ className, ...props }, ref) {
  return (
    <BaseDialog.Description
      ref={ref}
      className={clsx(styles.description, className)}
      {...props}
    />
  );
});

export interface CloseProps extends BaseDialog.Close.Props {}
export const Close = React.forwardRef<HTMLButtonElement, CloseProps>(
  function Close(props, ref) {
    return <BaseDialog.Close ref={ref} {...props} />;
  },
);

export interface CloseButtonProps
  extends Omit<BaseDialog.Close.Props, "children"> {}
export const CloseButton = React.forwardRef<
  HTMLButtonElement,
  CloseButtonProps
>(function CloseButton({ className, "aria-label": ariaLabel, ...props }, ref) {
  return (
    <BaseDialog.Close
      ref={ref}
      className={clsx(styles.closeButton, className)}
      aria-label={ariaLabel || "Close"}
      {...props}
    >
      <CentralIcon name="IconCrossSmall" size={20} />
    </BaseDialog.Close>
  );
});

export const createHandle = BaseDialog.createHandle;
export type Handle<Payload = never> = BaseDialog.Handle<Payload>;
