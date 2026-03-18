"use client";

import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import clsx from "clsx";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import styles from "./Tabs.module.scss";

export interface RootProps extends BaseTabs.Root.Props {
  analyticsName?: string;
}

export const Root = React.forwardRef<HTMLDivElement, RootProps>(function Root(
  { className, analyticsName, onValueChange, ...props },
  ref,
) {
  const trackedChange = useTrackedCallback(
    analyticsName,
    "Tabs",
    "change",
    onValueChange,
    (value: unknown) => ({ value }),
  );

  return (
    <BaseTabs.Root
      ref={ref}
      className={clsx(styles.root, className)}
      onValueChange={trackedChange}
      {...props}
    />
  );
});

export interface ListProps extends BaseTabs.List.Props {
  variant?: "default" | "minimal";
}

export const List = React.forwardRef<HTMLDivElement, ListProps>(function List(
  { className, variant = "default", children, ...props },
  ref,
) {
  return (
    <BaseTabs.List
      ref={ref}
      className={clsx(styles.list, styles[variant], className)}
      {...props}
    >
      <Indicator />
      {children}
    </BaseTabs.List>
  );
});

export interface IndicatorProps extends BaseTabs.Indicator.Props {}

export const Indicator = React.forwardRef<HTMLSpanElement, IndicatorProps>(
  function Indicator({ className, ...props }, ref) {
    return (
      <BaseTabs.Indicator
        ref={ref}
        className={clsx(styles.indicator, className)}
        {...props}
      />
    );
  },
);

export interface TabProps extends BaseTabs.Tab.Props {}

export const Tab = React.forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { className, ...props },
  ref,
) {
  return (
    <BaseTabs.Tab
      ref={ref}
      className={clsx(styles.tab, className)}
      {...props}
    />
  );
});

export interface PanelProps extends BaseTabs.Panel.Props {}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  function Panel({ className, ...props }, ref) {
    return (
      <BaseTabs.Panel
        ref={ref}
        className={clsx(styles.panel, className)}
        {...props}
      />
    );
  },
);
