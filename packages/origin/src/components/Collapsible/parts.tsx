"use client";

import * as React from "react";
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { CentralIcon } from "../Icon";
import { useTrackedOpenChange } from "../Analytics/useTrackedOpenChange";
import clsx from "clsx";
import styles from "./Collapsible.module.scss";

export interface RootProps extends BaseCollapsible.Root.Props {
  analyticsName?: string;
}

export const Root = React.forwardRef<HTMLDivElement, RootProps>(function Root(
  { className, analyticsName, onOpenChange, ...props },
  ref,
) {
  const trackedOpenChange = useTrackedOpenChange(
    analyticsName,
    "Collapsible",
    onOpenChange,
  );

  return (
    <BaseCollapsible.Root
      ref={ref}
      className={clsx(styles.root, className)}
      onOpenChange={trackedOpenChange}
      {...props}
    />
  );
});

export interface TriggerProps extends BaseCollapsible.Trigger.Props {
  /** Hide the trailing chevron icon. */
  hideIcon?: boolean;
  /** Replace the default chevron with a custom icon element. */
  icon?: React.ReactNode;
}

/**
 * Renders a `<button>` with an inner `<span class="label">` for children and
 * a trailing icon `<span>`. This structure enables the flex layout between
 * label and chevron — consumers should be aware of the intermediate spans
 * when targeting children via CSS selectors.
 */

export const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  function Trigger({ className, children, hideIcon, icon, ...props }, ref) {
    return (
      <BaseCollapsible.Trigger
        ref={ref}
        className={clsx(styles.trigger, className)}
        {...props}
      >
        <span className={styles.label}>{children}</span>
        {!hideIcon && (
          <span className={styles.icon}>
            {icon ?? <CentralIcon name="IconChevronDownSmall" size={24} />}
          </span>
        )}
      </BaseCollapsible.Trigger>
    );
  },
);

export interface PanelProps extends BaseCollapsible.Panel.Props {}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  function Panel({ className, children, ...props }, ref) {
    return (
      <BaseCollapsible.Panel
        ref={ref}
        className={clsx(styles.panel, className)}
        {...props}
      >
        <div className={styles.content}>{children}</div>
      </BaseCollapsible.Panel>
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Root.displayName = "Collapsible.Root";
  Trigger.displayName = "Collapsible.Trigger";
  Panel.displayName = "Collapsible.Panel";
}
