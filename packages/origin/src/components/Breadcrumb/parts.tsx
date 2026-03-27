"use client";

import * as React from "react";
import clsx from "clsx";
import { CentralIcon } from "../Icon";
import styles from "./Breadcrumb.module.scss";

interface BreadcrumbContextValue {
  separator: React.ReactNode;
}

const BreadcrumbContext = React.createContext<
  BreadcrumbContextValue | undefined
>(undefined);

if (process.env.NODE_ENV !== "production") {
  BreadcrumbContext.displayName = "BreadcrumbContext";
}

function useBreadcrumbContext() {
  const context = React.useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error(
      "Breadcrumb parts must be placed within <Breadcrumb.Root>.",
    );
  }
  return context;
}

export interface BreadcrumbRootProps
  extends React.ComponentPropsWithoutRef<"nav"> {
  children?: React.ReactNode;
}

export const BreadcrumbRoot = React.forwardRef<
  HTMLElement,
  BreadcrumbRootProps
>(function BreadcrumbRoot(props, forwardedRef) {
  const { className, children, ...elementProps } = props;

  return (
    <nav
      ref={forwardedRef}
      aria-label="Breadcrumb"
      className={clsx(styles.root, className)}
      {...elementProps}
    >
      {children}
    </nav>
  );
});

if (process.env.NODE_ENV !== "production") {
  BreadcrumbRoot.displayName = "BreadcrumbRoot";
}

export interface BreadcrumbListProps
  extends React.ComponentPropsWithoutRef<"ol"> {
  separator?: React.ReactNode;
}

export const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  BreadcrumbListProps
>(function BreadcrumbList(props, forwardedRef) {
  const { className, children, separator, ...elementProps } = props;

  const contextValue: BreadcrumbContextValue = React.useMemo(
    () => ({ separator }),
    [separator],
  );

  return (
    <BreadcrumbContext.Provider value={contextValue}>
      <ol
        ref={forwardedRef}
        className={clsx(styles.list, className)}
        {...elementProps}
      >
        {children}
      </ol>
    </BreadcrumbContext.Provider>
  );
});

if (process.env.NODE_ENV !== "production") {
  BreadcrumbList.displayName = "BreadcrumbList";
}

export interface BreadcrumbItemProps
  extends React.ComponentPropsWithoutRef<"li"> {
  children?: React.ReactNode;
}

export const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  BreadcrumbItemProps
>(function BreadcrumbItem(props, forwardedRef) {
  const { className, children, ...elementProps } = props;
  const { separator } = useBreadcrumbContext();

  return (
    <li
      ref={forwardedRef}
      className={clsx(styles.item, className)}
      {...elementProps}
    >
      {children}
      <span className={styles.separator} aria-hidden="true">
        {separator ?? <CentralIcon name="IconChevronRightSmall" size={20} />}
      </span>
    </li>
  );
});

if (process.env.NODE_ENV !== "production") {
  BreadcrumbItem.displayName = "BreadcrumbItem";
}

export interface BreadcrumbLinkProps
  extends React.ComponentPropsWithoutRef<"a"> {
  href: string;
}

export const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  BreadcrumbLinkProps
>(function BreadcrumbLink(props, forwardedRef) {
  const { className, children, ...elementProps } = props;

  return (
    <a
      ref={forwardedRef}
      className={clsx(styles.link, className)}
      {...elementProps}
    >
      {children}
    </a>
  );
});

if (process.env.NODE_ENV !== "production") {
  BreadcrumbLink.displayName = "BreadcrumbLink";
}

export interface BreadcrumbPageProps
  extends React.ComponentPropsWithoutRef<"span"> {
  children?: React.ReactNode;
}

export const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  BreadcrumbPageProps
>(function BreadcrumbPage(props, forwardedRef) {
  const { className, children, ...elementProps } = props;

  return (
    <span
      ref={forwardedRef}
      role="link"
      aria-current="page"
      aria-disabled="true"
      data-current
      className={clsx(styles.page, className)}
      {...elementProps}
    >
      {children}
    </span>
  );
});

if (process.env.NODE_ENV !== "production") {
  BreadcrumbPage.displayName = "BreadcrumbPage";
}

export interface BreadcrumbEllipsisProps
  extends React.ComponentPropsWithoutRef<"button"> {
  onExpand?: () => void;
}

export const BreadcrumbEllipsis = React.forwardRef<
  HTMLButtonElement,
  BreadcrumbEllipsisProps
>(function BreadcrumbEllipsis(props, forwardedRef) {
  const { className, onExpand, onClick, ...elementProps } = props;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    onExpand?.();
  };

  return (
    <button
      ref={forwardedRef}
      type="button"
      aria-label="Show more breadcrumbs"
      className={clsx(styles.ellipsis, className)}
      onClick={handleClick}
      {...elementProps}
    >
      <CentralIcon name="IconDotGrid1x3HorizontalTight" size={16} />
    </button>
  );
});

if (process.env.NODE_ENV !== "production") {
  BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";
}

export interface BreadcrumbSeparatorProps
  extends React.ComponentPropsWithoutRef<"span"> {
  children?: React.ReactNode;
}

export const BreadcrumbSeparator = React.forwardRef<
  HTMLSpanElement,
  BreadcrumbSeparatorProps
>(function BreadcrumbSeparator(props, forwardedRef) {
  const { className, children, ...elementProps } = props;

  return (
    <span
      ref={forwardedRef}
      role="presentation"
      aria-hidden="true"
      className={clsx(styles.separator, className)}
      {...elementProps}
    >
      {children ?? <CentralIcon name="IconChevronRightSmall" size={20} />}
    </span>
  );
});

if (process.env.NODE_ENV !== "production") {
  BreadcrumbSeparator.displayName = "BreadcrumbSeparator";
}
