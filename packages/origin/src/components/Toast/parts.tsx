"use client";

import * as React from "react";
import { Toast as BaseToast } from "@base-ui/react/toast";
import { useRender } from "@base-ui/react/use-render";
import clsx from "clsx";
import { Button } from "../Button";
import { CentralIcon, type CentralIconName } from "../Icon";
import styles from "./Toast.module.scss";

/**
 * Visual structure, independent from semantic intent.
 *
 * `default` supports every Toast part. `compact` and `pill` omit
 * `Description`, `Action`, and `Close`, so use them only for finite-lived
 * transient feedback that does not require an action or rendered dismiss
 * control. A `pill` is content-width when alone or expanded. In a collapsed
 * stack with multiple visible toasts, every layout temporarily shares the
 * viewport width and the frontmost toast's height to keep the stack covered.
 */
export type ToastLayout = "default" | "compact" | "pill";

export type ToastPlacement = "bottom" | "top";

export type ToastVariant =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "invalid";

type SemanticToastVariant = Exclude<ToastVariant, "default">;

type CleanupAwareRefCallback<T> = (instance: T | null) => void | (() => void);

const ICON_BY_VARIANT: Record<SemanticToastVariant, CentralIconName> = {
  info: "IconCircleInfoFilled",
  success: "IconCircleCheckFilled",
  warning: "IconExclamationTriangleFilled",
  invalid: "IconExclamationTriangleFilled",
};

const LayoutContext = React.createContext<ToastLayout>("default");

const BASE_FRONTMOST_HEIGHT = "--toast-frontmost-height";
const RETAINED_FRONTMOST_HEIGHT = "--origin-toast-frontmost-height";

export const useToastManager = BaseToast.useToastManager;
export const createToastManager = BaseToast.createToastManager;

export interface ProviderProps extends BaseToast.Provider.Props {}

export function Provider(props: ProviderProps) {
  return <BaseToast.Provider {...props} />;
}

export interface PortalProps extends BaseToast.Portal.Props {}

export function Portal(props: PortalProps) {
  return <BaseToast.Portal {...props} />;
}

export interface ViewportProps extends BaseToast.Viewport.Props {
  className?: string;
  /**
   * Vertical edge that anchors the viewport, stack, and enter/exit motion.
   * @default "bottom"
   */
  placement?: ToastPlacement;
}

export const Viewport = React.forwardRef<HTMLDivElement, ViewportProps>(
  function Viewport(props, ref) {
    const { className, placement = "bottom", ...other } = props;
    const viewportCleanupRef = React.useRef<(() => void) | undefined>(
      undefined,
    );
    const handleViewportRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        viewportCleanupRef.current?.();
        viewportCleanupRef.current = undefined;

        if (!node) {
          return;
        }

        const callbackRef: CleanupAwareRefCallback<HTMLDivElement> | null =
          typeof ref === "function" ? ref : null;
        const refCleanup = callbackRef?.(node);
        if (ref && typeof ref !== "function") {
          ref.current = node;
        }
        const retainFrontmostHeight = () => {
          const baseHeight = node.style
            .getPropertyValue(BASE_FRONTMOST_HEIGHT)
            .trim();
          const retainedHeight = node.style
            .getPropertyValue(RETAINED_FRONTMOST_HEIGHT)
            .trim();

          if (baseHeight && baseHeight !== "0px") {
            if (baseHeight !== retainedHeight) {
              node.style.setProperty(RETAINED_FRONTMOST_HEIGHT, baseHeight);
            }
          } else if (retainedHeight && !node.querySelector("[data-layout]")) {
            node.style.removeProperty(RETAINED_FRONTMOST_HEIGHT);
          }
        };

        retainFrontmostHeight();

        // Base UI clears its frontmost measurement while the exiting root is
        // still mounted. Retain the last published value until removal promotes
        // the next root, which publishes the replacement measurement.
        const observer = new MutationObserver(retainFrontmostHeight);
        observer.observe(node, {
          attributeFilter: ["style"],
          attributes: true,
          childList: true,
          subtree: true,
        });
        const cleanup = () => {
          observer.disconnect();
          if (callbackRef) {
            if (typeof refCleanup === "function") {
              refCleanup();
            } else {
              callbackRef(null);
            }
          } else if (ref && typeof ref !== "function") {
            ref.current = null;
          }

          if (viewportCleanupRef.current === cleanup) {
            viewportCleanupRef.current = undefined;
          }
        };
        viewportCleanupRef.current = cleanup;
        return cleanup;
      },
      [ref],
    );

    return (
      <BaseToast.Viewport
        {...other}
        ref={handleViewportRef}
        className={clsx(styles.viewport, className)}
        data-placement={placement}
      />
    );
  },
);

export interface RootProps extends BaseToast.Root.Props {
  className?: string;
  /**
   * Visual structure, independent from `variant`.
   *
   * `compact` and `pill` omit `Description`, `Action`, and `Close`. They are
   * intended for finite-lived transient feedback that does not require an
   * action or rendered dismiss control. A `pill` is content-width when alone
   * or expanded, and uses the common viewport width in a collapsed stack with
   * multiple visible toasts.
   * @default "default"
   */
  layout?: ToastLayout;
  /** Semantic intent, independent from `layout`. */
  variant?: ToastVariant;
}

export const Root = React.forwardRef<HTMLDivElement, RootProps>(
  function Root(props, ref) {
    const {
      className,
      layout = "default",
      variant = "default",
      ...other
    } = props;

    return (
      <LayoutContext.Provider value={layout}>
        <BaseToast.Root
          {...other}
          ref={ref}
          className={clsx(styles.root, className)}
          data-layout={layout}
          data-variant={variant}
        />
      </LayoutContext.Provider>
    );
  },
);

export interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: SemanticToastVariant;
}

export function Icon({ variant, className, ...props }: IconProps) {
  const layout = React.useContext(LayoutContext);
  const size = layout === "default" ? 24 : 16;

  return (
    <div
      className={clsx(styles.icon, styles[`icon-${variant}`], className)}
      {...props}
    >
      <CentralIcon name={ICON_BY_VARIANT[variant]} size={size} />
    </div>
  );
}

export interface ContentProps extends BaseToast.Content.Props {}

export const Content = React.forwardRef<HTMLDivElement, ContentProps>(
  function Content(props, ref) {
    const { className, ...other } = props;

    return (
      <BaseToast.Content
        ref={ref}
        className={clsx(styles.content, className)}
        {...other}
      />
    );
  },
);

export interface TitleProps extends BaseToast.Title.Props {}

export const Title = React.forwardRef<HTMLHeadingElement, TitleProps>(
  function Title(props, ref) {
    const { className, ...other } = props;

    return (
      <BaseToast.Title
        ref={ref}
        className={clsx(styles.title, className)}
        {...other}
      />
    );
  },
);

export interface LinkProps extends React.ComponentPropsWithoutRef<"a"> {
  /**
   * Replaces the default `a` element, for example with a router-aware link.
   * Props are merged per Base UI `useRender` semantics.
   */
  render?: useRender.RenderProp | undefined;
}

/** Renders an inline, token-styled text link within Toast content. */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function Link(props, ref) {
    const { className, render, ...other } = props;

    return useRender({
      defaultTagName: "a",
      render,
      ref,
      props: {
        ...other,
        className: clsx(styles.link, className),
      },
    });
  },
);

/**
 * Props for descriptive text in the `default` layout.
 *
 * This part does not render in `compact` or `pill` layouts.
 */
export interface DescriptionProps extends BaseToast.Description.Props {}

/** Renders descriptive text in `default`; returns `null` in other layouts. */
export const Description = React.forwardRef<
  HTMLParagraphElement,
  DescriptionProps
>(function Description(props, ref) {
  const layout = React.useContext(LayoutContext);
  const { className, ...other } = props;

  if (layout !== "default") {
    return null;
  }

  return (
    <BaseToast.Description
      ref={ref}
      className={clsx(styles.description, className)}
      {...other}
    />
  );
});

/**
 * Props for an action in the `default` layout.
 *
 * This part does not render in `compact` or `pill` layouts.
 */
export interface ActionProps extends Omit<BaseToast.Action.Props, "render"> {}

/** Renders an action in `default`; returns `null` in other layouts. */
export const Action = React.forwardRef<HTMLButtonElement, ActionProps>(
  function Action(props, ref) {
    const layout = React.useContext(LayoutContext);
    const { className, children, ...other } = props;

    if (layout !== "default") {
      return null;
    }

    return (
      <BaseToast.Action
        ref={ref}
        className={clsx(styles.action, className)}
        render={<Button variant="outline" size="compact" />}
        {...other}
      >
        {children}
      </BaseToast.Action>
    );
  },
);

/**
 * Props for the rendered dismiss control in the `default` layout.
 *
 * This part does not render in `compact` or `pill` layouts.
 */
export interface CloseProps extends BaseToast.Close.Props {}

/** Renders a dismiss control in `default`; returns `null` in other layouts. */
export const Close = React.forwardRef<HTMLButtonElement, CloseProps>(
  function Close(props, ref) {
    const layout = React.useContext(LayoutContext);
    const { className, children, ...other } = props;

    if (layout !== "default") {
      return null;
    }

    return (
      <BaseToast.Close
        ref={ref}
        className={clsx(styles.close, className)}
        {...other}
      >
        {children ?? <CentralIcon name="IconCrossSmall" size={16} />}
      </BaseToast.Close>
    );
  },
);
