"use client";

import * as React from "react";
import { Menubar as BaseMenubar } from "@base-ui/react/menubar";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import clsx from "clsx";
import styles from "./Menubar.module.scss";

export interface RootProps extends BaseMenubar.Props {}

export const Root = React.forwardRef<HTMLDivElement, RootProps>(function Root(
  { className, ...props },
  ref,
) {
  return (
    <BaseMenubar
      ref={ref}
      className={clsx(styles.root, className)}
      {...props}
    />
  );
});

export interface TriggerProps extends BaseMenu.Trigger.Props {}

export const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  function Trigger({ className, ...props }, ref) {
    return (
      <BaseMenu.Trigger
        ref={ref}
        className={clsx(styles.trigger, className)}
        {...props}
      />
    );
  },
);
