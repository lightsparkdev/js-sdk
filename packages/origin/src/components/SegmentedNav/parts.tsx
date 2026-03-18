"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import clsx from "clsx";
import styles from "./SegmentedNav.module.scss";

export interface RootProps extends React.ComponentPropsWithoutRef<"nav"> {}

export const Root = React.forwardRef<HTMLElement, RootProps>(function Root(
  {
    className,
    children,
    "aria-label": ariaLabel = "Segmented navigation",
    ...props
  },
  ref,
) {
  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className={clsx(styles.root, className)}
      {...props}
    >
      <div className={styles.list}>{children}</div>
    </nav>
  );
});

export interface GroupProps extends React.ComponentPropsWithoutRef<"div"> {}

export const Group = React.forwardRef<HTMLDivElement, GroupProps>(
  function Group({ className, ...props }, ref) {
    return (
      <div ref={ref} className={clsx(styles.group, className)} {...props} />
    );
  },
);

export interface LinkProps
  extends Omit<React.ComponentPropsWithoutRef<"a">, "href"> {
  active?: boolean;
  render: React.ReactElement;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function Link(
    { active = false, render, className, children, ...props },
    ref,
  ) {
    const linkProps = mergeProps(
      render.props as React.ComponentPropsWithoutRef<"a">,
      {
        ref,
        className: clsx(styles.link, className),
        "aria-current": active ? ("page" as const) : undefined,
        ...props,
      },
    );

    return React.cloneElement(render, linkProps, children);
  },
);

if (process.env.NODE_ENV !== "production") {
  Root.displayName = "SegmentedNav";
  Group.displayName = "SegmentedNav.Group";
  Link.displayName = "SegmentedNav.Link";
}

export const SegmentedNav = Object.assign(Root, {
  Group,
  Link,
});
