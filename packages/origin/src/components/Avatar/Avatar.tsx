"use client";

import * as React from "react";
import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import clsx from "clsx";
import styles from "./Avatar.module.scss";

export type AvatarSize = "16" | "20" | "24" | "32" | "40" | "48";
export type AvatarVariant = "squircle" | "circle";
export type AvatarColor =
  | "blue"
  | "purple"
  | "sky"
  | "pink"
  | "green"
  | "yellow"
  | "red"
  | "gray";

// Root - Container for avatar
export interface AvatarRootProps
  extends Omit<BaseAvatar.Root.Props, "className"> {
  /** Size of the avatar in pixels */
  size?: AvatarSize;
  /** Shape variant */
  variant?: AvatarVariant;
  /** Color for the fallback background */
  color?: AvatarColor;
  /** Additional class name */
  className?: string;
}

export const AvatarRoot = React.forwardRef<HTMLSpanElement, AvatarRootProps>(
  function AvatarRoot(props, ref) {
    const {
      size = "32",
      variant = "squircle",
      color = "blue",
      className,
      ...elementProps
    } = props;

    return (
      <BaseAvatar.Root
        ref={ref}
        className={clsx(
          styles.root,
          styles[`size${size}`],
          styles[variant],
          styles[color],
          className,
        )}
        {...elementProps}
      />
    );
  },
);

// Image - The avatar image
export interface AvatarImageProps
  extends Omit<BaseAvatar.Image.Props, "className"> {
  /** Additional class name */
  className?: string;
}

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  function AvatarImage(props, ref) {
    const { className, ...elementProps } = props;

    return (
      <BaseAvatar.Image
        ref={ref}
        className={clsx(styles.image, className)}
        {...elementProps}
      />
    );
  },
);

// Fallback - Displayed when image fails or is absent
export interface AvatarFallbackProps
  extends Omit<BaseAvatar.Fallback.Props, "className"> {
  /** Additional class name */
  className?: string;
}

export const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  AvatarFallbackProps
>(function AvatarFallback(props, ref) {
  const { className, ...elementProps } = props;

  return (
    <BaseAvatar.Fallback
      ref={ref}
      className={clsx(styles.fallback, className)}
      {...elementProps}
    />
  );
});

// Compound component export
export const Avatar = {
  Root: AvatarRoot,
  Image: AvatarImage,
  Fallback: AvatarFallback,
};

// Display names for debugging
if (process.env.NODE_ENV !== "production") {
  AvatarRoot.displayName = "Avatar.Root";
  AvatarImage.displayName = "Avatar.Image";
  AvatarFallback.displayName = "Avatar.Fallback";
}
