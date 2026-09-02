"use client";

import * as React from "react";
import clsx from "clsx";
import { CentralIcon } from "../Icon";
import type { CentralIconName } from "../Icon";
import styles from "./Alert.module.scss";

export interface AlertProps {
  /** Visual variant of the alert */
  variant?: "default" | "critical" | "warning";
  /** Title text (required) */
  title: string;
  /** Description text */
  description?: string;
  /** Show icon: true = default icon, false = none, ReactNode = custom */
  icon?: React.ReactNode;
  /** Optional compact content. Keep action labels concise so controls fit at narrow widths. */
  trailing?: React.ReactNode;
  /** Additional class name */
  className?: string;
}

const DEFAULT_ICONS: Record<string, CentralIconName> = {
  default: "IconCircleInfo",
  critical: "IconCircleX",
  warning: "IconExclamationTriangle",
};

/**
 * Informational message with required title and optional description.
 * Renders a `<div>` element with role="alert".
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  function Alert(props, forwardedRef) {
    const {
      variant = "default",
      title,
      description,
      icon = true,
      trailing,
      className,
      ...elementProps
    } = props;

    const hasIcon = icon !== false && icon !== null;
    const renderIcon = () => {
      if (!hasIcon) return null;
      if (icon === true) {
        const iconName = DEFAULT_ICONS[variant];
        return (
          <div className={styles.iconWrapper}>
            <CentralIcon name={iconName} size={16} />
          </div>
        );
      }
      return <div className={styles.iconWrapper}>{icon}</div>;
    };
    const hasTrailing = trailing != null && typeof trailing !== "boolean";

    return (
      <div
        ref={forwardedRef}
        role="alert"
        className={clsx(
          styles.root,
          styles[variant],
          !hasIcon && styles.noIcon,
          className,
        )}
        {...elementProps}
      >
        <div className={styles.content}>
          {renderIcon()}
          <div className={styles.message}>
            <div className={styles.text}>
              <p className={styles.title}>{title}</p>
              {description && (
                <p className={styles.description}>{description}</p>
              )}
            </div>
            {hasTrailing ? (
              <div className={styles.trailing}>{trailing}</div>
            ) : null}
          </div>
        </div>
      </div>
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Alert.displayName = "Alert";
}
