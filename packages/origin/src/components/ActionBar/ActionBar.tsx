"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./ActionBar.module.scss";

export interface ActionBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Content to render inside the action bar */
  children: React.ReactNode;
  /** Additional class name */
  className?: string;
}

/**
 * Contextual bar for selection actions.
 * Renders a `<div>` element with elevated surface styling.
 */
export const ActionBar = React.forwardRef<HTMLDivElement, ActionBarProps>(
  function ActionBar(props, forwardedRef) {
    const { children, className, ...elementProps } = props;

    return (
      <div
        ref={forwardedRef}
        className={clsx(styles.root, className)}
        role="group"
        aria-label="Selection actions"
        {...elementProps}
      >
        {children}
      </div>
    );
  },
);

export interface ActionBarLabelProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** The label text */
  children: React.ReactNode;
  /** Additional class name */
  className?: string;
}

/**
 * Label for displaying selection count or status.
 * Renders a `<span>` element.
 */
export const ActionBarLabel = React.forwardRef<
  HTMLSpanElement,
  ActionBarLabelProps
>(function ActionBarLabel(props, forwardedRef) {
  const { children, className, ...elementProps } = props;

  return (
    <span
      ref={forwardedRef}
      className={clsx(styles.label, className)}
      aria-live="polite"
      aria-atomic="true"
      {...elementProps}
    >
      {children}
    </span>
  );
});

export interface ActionBarActionsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Action buttons */
  children: React.ReactNode;
  /** Additional class name */
  className?: string;
}

/**
 * Container for action buttons.
 * Renders a `<div>` element.
 */
export const ActionBarActions = React.forwardRef<
  HTMLDivElement,
  ActionBarActionsProps
>(function ActionBarActions(props, forwardedRef) {
  const { children, className, ...elementProps } = props;

  return (
    <div
      ref={forwardedRef}
      className={clsx(styles.actions, className)}
      {...elementProps}
    >
      {children}
    </div>
  );
});

if (process.env.NODE_ENV !== "production") {
  ActionBar.displayName = "ActionBar";
  ActionBarLabel.displayName = "ActionBarLabel";
  ActionBarActions.displayName = "ActionBarActions";
}
