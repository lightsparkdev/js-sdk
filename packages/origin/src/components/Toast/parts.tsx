"use client";

import * as React from "react";
import { Toast as BaseToast } from "@base-ui/react/toast";
import clsx from "clsx";
import { Button } from "../Button";
import { CentralIcon } from "../Icon";
import styles from "./Toast.module.scss";

export type ToastVariant =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "invalid";

// Re-export hooks and utilities from Base UI
export const useToastManager = BaseToast.useToastManager;
export const createToastManager = BaseToast.createToastManager;

// Provider
export interface ProviderProps extends BaseToast.Provider.Props {}

export function Provider(props: ProviderProps) {
  return <BaseToast.Provider {...props} />;
}

// Portal
export interface PortalProps extends BaseToast.Portal.Props {}

export function Portal(props: PortalProps) {
  return <BaseToast.Portal {...props} />;
}

// Viewport
export interface ViewportProps extends BaseToast.Viewport.Props {
  className?: string;
}

export const Viewport = React.forwardRef<HTMLDivElement, ViewportProps>(
  function Viewport(props, ref) {
    const { className, ...other } = props;

    return (
      <BaseToast.Viewport
        ref={ref}
        className={clsx(styles.viewport, className)}
        {...other}
      />
    );
  },
);

// Root
export interface RootProps extends BaseToast.Root.Props {
  className?: string;
  /** Visual variant for the toast */
  variant?: ToastVariant;
}

export const Root = React.forwardRef<HTMLDivElement, RootProps>(
  function Root(props, ref) {
    const { className, variant = "default", ...other } = props;

    return (
      <BaseToast.Root
        ref={ref}
        className={clsx(styles.root, styles[variant], className)}
        data-variant={variant}
        {...other}
      />
    );
  },
);

// Icon (variant-specific, Origin-specific part)
export interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: Exclude<ToastVariant, "default">;
}

export function Icon({ variant, className, ...props }: IconProps) {
  return (
    <div
      className={clsx(styles.icon, styles[`icon-${variant}`], className)}
      {...props}
    >
      <div className={styles.indicator} />
    </div>
  );
}

// Content - wraps BaseToast.Content for proper stacking animations (data-behind, data-expanded)
export interface ContentProps extends BaseToast.Content.Props {}

export const Content = React.forwardRef<HTMLDivElement, ContentProps>(
  function Content(props, ref) {
    const { className, ...other } = props;

    return (
      <BaseToast.Content
        ref={ref}
        className={clsx(styles.content, className)}
        {...other}
      />
    );
  },
);

// Title
export interface TitleProps extends BaseToast.Title.Props {}

export const Title = React.forwardRef<HTMLHeadingElement, TitleProps>(
  function Title(props, ref) {
    const { className, ...other } = props;

    return (
      <BaseToast.Title
        ref={ref}
        className={clsx(styles.title, className)}
        {...other}
      />
    );
  },
);

// Description
export interface DescriptionProps extends BaseToast.Description.Props {}

export const Description = React.forwardRef<
  HTMLParagraphElement,
  DescriptionProps
>(function Description(props, ref) {
  const { className, ...other } = props;

  return (
    <BaseToast.Description
      ref={ref}
      className={clsx(styles.description, className)}
      {...other}
    />
  );
});

// Action
export interface ActionProps extends Omit<BaseToast.Action.Props, "render"> {}

export const Action = React.forwardRef<HTMLButtonElement, ActionProps>(
  function Action(props, ref) {
    const { className, children, ...other } = props;

    return (
      <BaseToast.Action
        ref={ref}
        className={clsx(styles.action, className)}
        render={<Button variant="outline" size="compact" />}
        {...other}
      >
        {children}
      </BaseToast.Action>
    );
  },
);

// Close
export interface CloseProps extends BaseToast.Close.Props {}

export const Close = React.forwardRef<HTMLButtonElement, CloseProps>(
  function Close(props, ref) {
    const { className, children, ...other } = props;

    return (
      <BaseToast.Close
        ref={ref}
        className={clsx(styles.close, className)}
        {...other}
      >
        {children ?? <CentralIcon name="IconCrossSmall" size={16} />}
      </BaseToast.Close>
    );
  },
);
