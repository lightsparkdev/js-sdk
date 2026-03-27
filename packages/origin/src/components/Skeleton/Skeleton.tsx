"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./Skeleton.module.scss";

const GroupContext = React.createContext(false);

export interface SkeletonGroupProps
  extends React.ComponentPropsWithoutRef<"div"> {}

const SkeletonGroup = React.forwardRef<HTMLDivElement, SkeletonGroupProps>(
  function SkeletonGroup(props, forwardedRef) {
    const { className, ...elementProps } = props;

    return (
      <GroupContext.Provider value={true}>
        <div
          ref={forwardedRef}
          className={clsx(styles.group, className)}
          {...elementProps}
        />
      </GroupContext.Provider>
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  SkeletonGroup.displayName = "Skeleton.Group";
}

export interface SkeletonProps extends React.ComponentPropsWithoutRef<"div"> {}

const SkeletonRoot = React.forwardRef<HTMLDivElement, SkeletonProps>(
  function Skeleton(props, forwardedRef) {
    const { className, ...elementProps } = props;
    const inGroup = React.useContext(GroupContext);

    return (
      <div
        ref={forwardedRef}
        className={clsx(
          inGroup ? styles.grouped : styles.standalone,
          className,
        )}
        {...elementProps}
      />
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  SkeletonRoot.displayName = "Skeleton";
}

export const Skeleton = Object.assign(SkeletonRoot, {
  Group: SkeletonGroup,
});
