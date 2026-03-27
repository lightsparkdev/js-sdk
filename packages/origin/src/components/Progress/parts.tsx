"use client";

import * as React from "react";
import { Progress as BaseProgress } from "@base-ui/react/progress";
import clsx from "clsx";
import styles from "./Progress.module.scss";

export interface RootProps extends BaseProgress.Root.Props {}

export const Root = React.forwardRef<HTMLDivElement, RootProps>(function Root(
  { className, ...props },
  ref,
) {
  return (
    <BaseProgress.Root
      ref={ref}
      className={clsx(styles.root, className)}
      {...props}
    />
  );
});

export interface LabelProps extends BaseProgress.Label.Props {}

export const Label = React.forwardRef<HTMLSpanElement, LabelProps>(
  function Label({ className, ...props }, ref) {
    return (
      <BaseProgress.Label
        ref={ref}
        className={clsx(styles.label, className)}
        {...props}
      />
    );
  },
);

export interface TrackProps extends BaseProgress.Track.Props {}

export const Track = React.forwardRef<HTMLDivElement, TrackProps>(
  function Track({ className, ...props }, ref) {
    return (
      <BaseProgress.Track
        ref={ref}
        className={clsx(styles.track, className)}
        {...props}
      />
    );
  },
);

export interface IndicatorProps extends BaseProgress.Indicator.Props {}

export const Indicator = React.forwardRef<HTMLDivElement, IndicatorProps>(
  function Indicator({ className, ...props }, ref) {
    return (
      <BaseProgress.Indicator
        ref={ref}
        className={clsx(styles.indicator, className)}
        {...props}
      />
    );
  },
);

export interface ValueProps extends BaseProgress.Value.Props {}

export const Value = React.forwardRef<HTMLSpanElement, ValueProps>(
  function Value({ className, ...props }, ref) {
    return (
      <BaseProgress.Value
        ref={ref}
        className={clsx(styles.value, className)}
        {...props}
      />
    );
  },
);
