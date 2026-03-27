"use client";

import * as React from "react";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import clsx from "clsx";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import styles from "./Toggle.module.scss";

// --- Toggle ---

export interface ToggleProps extends BaseToggle.Props {
  analyticsName?: string;
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  function Toggle(
    { className, analyticsName, onPressedChange, ...props },
    ref,
  ) {
    const trackedChange = useTrackedCallback(
      analyticsName,
      "Toggle",
      "change",
      onPressedChange,
      (pressed: boolean) => ({ pressed }),
    );

    return (
      <BaseToggle
        ref={ref}
        className={clsx(styles.toggle, className)}
        onPressedChange={trackedChange}
        {...props}
      />
    );
  },
);

// --- ToggleGroup ---

export interface ToggleGroupProps extends BaseToggleGroup.Props {
  analyticsName?: string;
}

export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  function ToggleGroup(
    { className, analyticsName, onValueChange, ...props },
    ref,
  ) {
    const trackedChange = useTrackedCallback(
      analyticsName,
      "ToggleGroup",
      "change",
      onValueChange,
      (value: unknown) => ({ value }),
    );

    return (
      <BaseToggleGroup
        ref={ref}
        className={clsx(styles.toggleGroup, className)}
        onValueChange={trackedChange}
        {...props}
      />
    );
  },
);

// Display names for debugging
if (process.env.NODE_ENV !== "production") {
  Toggle.displayName = "Toggle";
  ToggleGroup.displayName = "ToggleGroup";
}
