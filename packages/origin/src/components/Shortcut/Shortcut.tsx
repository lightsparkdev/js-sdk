"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./Shortcut.module.scss";

export interface ShortcutProps extends React.HTMLAttributes<HTMLElement> {
  /** Array of key labels to display (e.g., ['⌘', '⇧', 'K']) */
  keys: string[];
  /** Additional class name */
  className?: string;
}

/**
 * Displays keyboard shortcut keys.
 * Renders semantic `<kbd>` elements for accessibility.
 */
export const Shortcut = React.forwardRef<HTMLElement, ShortcutProps>(
  function Shortcut(props, forwardedRef) {
    const { keys, className, ...elementProps } = props;

    // Single key doesn't need a group container
    if (keys.length === 1) {
      return (
        <kbd
          ref={forwardedRef as React.Ref<HTMLElement>}
          className={clsx(styles.key, className)}
          {...elementProps}
        >
          {keys[0]}
        </kbd>
      );
    }

    return (
      <span
        ref={forwardedRef as React.Ref<HTMLElement>}
        role="group"
        className={clsx(styles.root, className)}
        {...elementProps}
      >
        {keys.map((key, index) => (
          <kbd key={index} className={styles.key}>
            {key}
          </kbd>
        ))}
      </span>
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Shortcut.displayName = "Shortcut";
}
