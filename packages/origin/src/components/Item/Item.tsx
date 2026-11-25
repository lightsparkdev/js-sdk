"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import clsx from "clsx";
import { CentralIcon } from "../Icon";
import styles from "./Item.module.scss";

export type ItemSize = "default" | "compact";

export interface ItemProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "title"
> {
  title: string;
  label?: React.ReactNode;
  description?: string;
  /** Allow descriptive text to wrap instead of truncating to one line. */
  wrapDescription?: boolean;
  leading?: React.ReactNode;
  /** Renders a chevron when no trailing content is provided. */
  disclosure?: boolean;
  /** Takes precedence over disclosure. */
  trailing?: React.ReactNode;
  trailingPadding?: "sm" | "lg";
  /** Item density — compact reduces padding and type scale for dense lists */
  size?: ItemSize;
  clickable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  /**
   * Replaces the root with an element that accepts flow content. Buttons,
   * linked anchors, and summaries keep native activation; other intrinsic
   * elements receive Item keyboard semantics. Custom components own theirs.
   */
  render?: React.ReactElement;
}

type RoutedRenderElement = React.ReactElement & {
  ref?: React.Ref<HTMLAnchorElement>;
};

type RoutedRenderProps = Record<string, unknown> & {
  ref?: React.Ref<HTMLAnchorElement>;
};

export const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  function Item(props, forwardedRef) {
    const {
      title,
      label,
      description,
      wrapDescription = false,
      leading,
      disclosure,
      trailing,
      trailingPadding,
      size = "default",
      clickable = true,
      selected,
      disabled,
      onClick,
      onKeyDown,
      render,
      className,
      ...elementProps
    } = props;
    const trailingContent =
      trailing !== undefined ? (
        trailing
      ) : disclosure ? (
        <CentralIcon name="IconChevronRightSmall" size={20} />
      ) : undefined;

    const renderTag =
      typeof render?.type === "string" ? render.type : undefined;
    const renderProps = render?.props as Record<string, unknown> | undefined;
    const isRoutedRender =
      renderTag === undefined &&
      (renderProps?.to != null ||
        renderProps?.href != null ||
        renderProps?.externalLink != null);
    const routedRenderRef =
      Number.parseInt(React.version, 10) >= 19
        ? (renderProps as RoutedRenderProps | undefined)?.ref
        : (render as RoutedRenderElement | undefined)?.ref;
    const inertRouteRenderProps = { ...renderProps };
    for (const prop of [
      "as",
      "blue",
      "children",
      "css",
      "disabled",
      "discover",
      "externalLink",
      "filename",
      "hash",
      "legacyBehavior",
      "locale",
      "newTab",
      "onNavigate",
      "params",
      "passHref",
      "prefetch",
      "preventScrollReset",
      "relative",
      "reloadDocument",
      "replace",
      "scroll",
      "shallow",
      "state",
      "text",
      "to",
      "typography",
      "viewTransition",
    ]) {
      delete inertRouteRenderProps[prop];
    }
    const isInteractive = clickable && !disabled;
    const renderOwnsKeyboardActivation =
      render !== undefined &&
      (renderTag === undefined ||
        renderTag === "button" ||
        renderTag === "summary" ||
        (renderTag === "a" &&
          renderProps?.href !== undefined &&
          renderProps.href !== null));
    const synthesizesKeyboardActivation =
      isInteractive && Boolean(onClick) && !renderOwnsKeyboardActivation;

    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (
      event,
    ) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) {
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick?.(event as unknown as React.MouseEvent<HTMLDivElement>);
      }
    };

    const content = (
      <>
        <div className={styles.container}>
          {leading && <div className={styles.leading}>{leading}</div>}
          <div className={styles.content}>
            <div className={styles.titleRow}>
              <span className={styles.title}>{title}</span>
              {label && <span className={styles.label}>{label}</span>}
            </div>
            {description && (
              <span
                className={clsx(
                  styles.description,
                  wrapDescription && styles.wrapDescription,
                )}
              >
                {description}
              </span>
            )}
          </div>
        </div>
        {trailingContent && (
          <div
            className={clsx(
              styles.trailing,
              trailingPadding === "sm" && styles.trailingSm,
              trailingPadding === "lg" && styles.trailingLg,
            )}
          >
            {trailingContent}
          </div>
        )}
      </>
    );

    const renderElement =
      render && disabled && isRoutedRender ? (
        <a
          {...inertRouteRenderProps}
          ref={routedRenderRef}
          aria-disabled
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onKeyDown={undefined}
          tabIndex={-1}
          href={undefined}
        />
      ) : render ? (
        React.cloneElement(
          render as React.ReactElement<Record<string, unknown>>,
          disabled
            ? {
                "aria-disabled": true,
                onClick: (event: React.MouseEvent) => {
                  event.preventDefault();
                  event.stopPropagation();
                },
                onKeyDown: undefined,
                tabIndex: -1,
                href: undefined,
                ...(renderTag === "button" ? { disabled: true } : {}),
              }
            : undefined,
          content,
        )
      ) : undefined;

    const itemProps = {
      className: clsx(styles.root, clickable && styles.clickable, className),
      "data-size": size !== "default" ? size : undefined,
      "data-clickable": clickable ? undefined : "false",
      "data-selected": selected || undefined,
      "data-disabled": disabled || undefined,
      onClick: isInteractive ? onClick : undefined,
      onKeyDown: disabled
        ? undefined
        : synthesizesKeyboardActivation
          ? handleKeyDown
          : onKeyDown,
      role: synthesizesKeyboardActivation ? "button" : undefined,
      tabIndex: synthesizesKeyboardActivation ? 0 : undefined,
      ...elementProps,
      children: content,
    };

    return useRender({
      defaultTagName: "div",
      render: renderElement,
      ref: forwardedRef,
      props: itemProps,
    });
  },
);

if (process.env.NODE_ENV !== "production") {
  Item.displayName = "Item";
}
