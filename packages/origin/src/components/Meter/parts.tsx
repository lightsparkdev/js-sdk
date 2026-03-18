"use client";

import * as React from "react";
import { Meter as BaseMeter } from "@base-ui/react/meter";
import clsx from "clsx";
import styles from "./Meter.module.scss";

export interface RootProps extends BaseMeter.Root.Props {}

export const Root = React.forwardRef<HTMLDivElement, RootProps>(function Root(
  { className, ...props },
  ref,
) {
  return (
    <BaseMeter.Root
      ref={ref}
      className={clsx(styles.root, className)}
      {...props}
    />
  );
});

export interface LabelProps extends BaseMeter.Label.Props {}

export const Label = React.forwardRef<HTMLSpanElement, LabelProps>(
  function Label({ className, ...props }, ref) {
    return (
      <BaseMeter.Label
        ref={ref}
        className={clsx(styles.label, className)}
        {...props}
      />
    );
  },
);

export interface TrackProps extends BaseMeter.Track.Props {}

export const Track = React.forwardRef<HTMLDivElement, TrackProps>(
  function Track({ className, ...props }, ref) {
    return (
      <BaseMeter.Track
        ref={ref}
        className={clsx(styles.track, className)}
        {...props}
      />
    );
  },
);

export interface IndicatorProps extends BaseMeter.Indicator.Props {}

export const Indicator = React.forwardRef<HTMLDivElement, IndicatorProps>(
  function Indicator({ className, ...props }, ref) {
    return (
      <BaseMeter.Indicator
        ref={ref}
        className={clsx(styles.indicator, className)}
        {...props}
      />
    );
  },
);

export interface ValueProps extends BaseMeter.Value.Props {}

export const Value = React.forwardRef<HTMLSpanElement, ValueProps>(
  function Value({ className, ...props }, ref) {
    return (
      <BaseMeter.Value
        ref={ref}
        className={clsx(styles.value, className)}
        {...props}
      />
    );
  },
);
