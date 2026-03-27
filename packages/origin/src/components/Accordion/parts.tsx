"use client";

import * as React from "react";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { CentralIcon } from "../Icon";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import clsx from "clsx";
import styles from "./Accordion.module.scss";

export interface RootProps extends BaseAccordion.Root.Props {
  analyticsName?: string;
}

export const Root = React.forwardRef<HTMLDivElement, RootProps>(function Root(
  { className, analyticsName, onValueChange, ...props },
  ref,
) {
  const trackedChange = useTrackedCallback(
    analyticsName,
    "Accordion",
    "change",
    onValueChange,
    (value: unknown) => ({ value }),
  );

  return (
    <BaseAccordion.Root
      ref={ref}
      className={clsx(styles.root, className)}
      onValueChange={trackedChange}
      {...props}
    />
  );
});

export interface ItemProps extends BaseAccordion.Item.Props {}

export const Item = React.forwardRef<HTMLDivElement, ItemProps>(function Item(
  { className, ...props },
  ref,
) {
  return (
    <BaseAccordion.Item
      ref={ref}
      className={clsx(styles.item, className)}
      {...props}
    />
  );
});

export interface HeaderProps extends BaseAccordion.Header.Props {}

export const Header = React.forwardRef<HTMLHeadingElement, HeaderProps>(
  function Header({ className, ...props }, ref) {
    return (
      <BaseAccordion.Header
        ref={ref}
        className={clsx(styles.header, className)}
        {...props}
      />
    );
  },
);

export interface TriggerProps extends BaseAccordion.Trigger.Props {}

export const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  function Trigger({ className, children, ...props }, ref) {
    return (
      <BaseAccordion.Trigger
        ref={ref}
        className={clsx(styles.trigger, className)}
        {...props}
      >
        <span className={styles.title}>{children}</span>
        <CentralIcon
          name="IconChevronDownSmall"
          size={24}
          className={styles.icon}
        />
      </BaseAccordion.Trigger>
    );
  },
);

export interface PanelProps extends BaseAccordion.Panel.Props {}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  function Panel({ className, children, ...props }, ref) {
    return (
      <BaseAccordion.Panel
        ref={ref}
        className={clsx(styles.panel, className)}
        {...props}
      >
        <div className={styles.content}>{children}</div>
      </BaseAccordion.Panel>
    );
  },
);
