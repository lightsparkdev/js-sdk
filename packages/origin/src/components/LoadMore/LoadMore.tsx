"use client";

import * as React from "react";
import { Button, type ButtonProps } from "../Button";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import { useRender, mergeProps } from "../../lib/base-ui-utils";
import styles from "./LoadMore.module.scss";

export interface LoadMoreContextValue {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  analyticsName: string | undefined;
}

const LoadMoreContext = React.createContext<LoadMoreContextValue | null>(null);

/** Access the surrounding `LoadMore.Root` state. Throws if used outside one. */
export function useLoadMoreContext(): LoadMoreContextValue {
  const context = React.useContext(LoadMoreContext);
  if (context === null) {
    throw new Error("LoadMore parts must be placed within <LoadMore.Root>.");
  }
  return context;
}

export interface LoadMoreRootProps {
  /** Whether more items are available. */
  hasMore: boolean;
  /**
   * Whether a load is currently in flight. Trigger and Sentinel use this to
   * disable themselves and prevent re-firing.
   */
  loading: boolean;
  /** Called when the user (or sentinel intersection) requests another page. */
  onLoadMore: () => void;
  /**
   * Optional analytics identifier. Trigger emits `${name}.click` (interaction
   * `click`) and Sentinel emits `${name}.intersect` (interaction `intersect`)
   * with metadata `{ part: "trigger" | "sentinel" }`.
   */
  analyticsName?: string;
  children?: React.ReactNode;
}

/** Headless context provider — renders only its children. */
export function LoadMoreRoot(props: LoadMoreRootProps) {
  const { hasMore, loading, onLoadMore, analyticsName, children } = props;

  const value = React.useMemo<LoadMoreContextValue>(
    () => ({ hasMore, loading, onLoadMore, analyticsName }),
    [hasMore, loading, onLoadMore, analyticsName],
  );

  return (
    <LoadMoreContext.Provider value={value}>
      {children}
    </LoadMoreContext.Provider>
  );
}

type TriggerRenderState = {
  hasMore: boolean;
  loading: boolean;
  disabled: boolean;
};

type TriggerRenderProp = useRender.RenderProp<TriggerRenderState>;

export interface LoadMoreTriggerProps
  extends Omit<ButtonProps, "onClick" | "disabled" | "loading" | "render"> {
  /**
   * Override the auto-derived disabled state (`!hasMore || loading`). Pass
   * `false` to force-enable; pass `true` to force-disable.
   */
  disabled?: boolean;
  /**
   * Replace the default `Button` element. Receives the merged click/disabled
   * props the trigger would otherwise pass to `Button`.
   */
  render?: TriggerRenderProp;
  /** Visible label. Defaults to `"Load more"`. */
  children?: React.ReactNode;
}

interface RenderTriggerProps {
  render: TriggerRenderProp;
  state: TriggerRenderState;
  forwardedProps: Record<string, unknown>;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  isDisabled: boolean;
  loading: boolean;
  forwardedRef: React.ForwardedRef<HTMLButtonElement>;
}

function RenderTrigger({
  render,
  state,
  forwardedProps,
  onClick,
  isDisabled,
  loading,
  forwardedRef,
}: RenderTriggerProps) {
  const internalProps = {
    onClick,
    disabled: isDisabled,
    "aria-busy": loading || undefined,
    "data-loading": loading || undefined,
    "data-has-more": state.hasMore || undefined,
    "data-disabled": isDisabled || undefined,
  } as React.ComponentPropsWithRef<"button">;
  return useRender({
    render,
    ref: forwardedRef as React.Ref<HTMLButtonElement>,
    state,
    props: mergeProps<"button">(
      internalProps,
      forwardedProps as React.ComponentPropsWithRef<"button">,
    ),
  });
}

/** Manual button trigger. Defaults to Origin's `Button`. */
export const LoadMoreTrigger = React.forwardRef<
  HTMLButtonElement,
  LoadMoreTriggerProps
>(function LoadMoreTrigger(props, forwardedRef) {
  const { disabled, render, children = "Load more", ...rest } = props;
  const { hasMore, loading, onLoadMore, analyticsName } = useLoadMoreContext();
  const isDisabled = disabled ?? (!hasMore || loading);

  const handleClick = useTrackedCallback(
    analyticsName,
    "LoadMore",
    "click",
    () => {
      if (isDisabled) return;
      onLoadMore();
    },
    () => ({ part: "trigger" }),
  );

  if (render) {
    return (
      <RenderTrigger
        render={render}
        state={{ hasMore, loading, disabled: isDisabled }}
        forwardedProps={rest as Record<string, unknown>}
        onClick={handleClick}
        isDisabled={isDisabled}
        loading={loading}
        forwardedRef={forwardedRef}
      />
    );
  }

  return (
    <Button
      ref={forwardedRef}
      loading={loading}
      disabled={isDisabled}
      onClick={handleClick}
      data-loading={loading || undefined}
      data-has-more={hasMore || undefined}
      data-disabled={isDisabled || undefined}
      {...rest}
    >
      {children}
    </Button>
  );
});

export interface LoadMoreSentinelProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * IntersectionObserver root. Defaults to the viewport. Pass a scroll
   * container to scope observations to a scrolling region.
   */
  root?: Element | Document | null;
  /** Defaults to `"0px 0px 200px 0px"` — preload 200px before reaching the sentinel. */
  rootMargin?: string;
  /** Defaults to `0`. */
  threshold?: number | number[];
  /**
   * Disable the observer entirely. When `true` no DOM is rendered, so callers
   * can fall back to a manual `Trigger`.
   */
  disabled?: boolean;
  /** Override the rendered element. */
  render?: useRender.RenderProp<{ hasMore: boolean; loading: boolean }>;
}

/** Invisible viewport-intersection trigger for infinite scroll. */
export const LoadMoreSentinel = React.forwardRef<
  HTMLDivElement,
  LoadMoreSentinelProps
>(function LoadMoreSentinel(props, forwardedRef) {
  const {
    root = null,
    rootMargin = "0px 0px 200px 0px",
    threshold = 0,
    disabled,
    render,
    className,
    ...rest
  } = props;
  const { hasMore, loading, onLoadMore, analyticsName } = useLoadMoreContext();

  const onLoadMoreRef = React.useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;
  const loadingRef = React.useRef(loading);
  loadingRef.current = loading;
  const hasMoreRef = React.useRef(hasMore);
  hasMoreRef.current = hasMore;

  const trackedIntersect = useTrackedCallback(
    analyticsName,
    "LoadMore",
    "intersect",
    () => onLoadMoreRef.current(),
    () => ({ part: "sentinel" }),
  );

  const isMountedRef = React.useRef(false);

  const localRef = React.useRef<HTMLDivElement | null>(null);
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      localRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef],
  );

  React.useEffect(() => {
    if (disabled) return;
    const node = localRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (loadingRef.current) continue;
          if (!hasMoreRef.current) continue;
          trackedIntersect();
          break;
        }
      },
      { root: root ?? null, rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [disabled, root, rootMargin, threshold, trackedIntersect]);

  // After loading flips false, re-evaluate intersection in case the new page
  // didn't grow tall enough to scroll the sentinel out of view. Skipped on
  // initial mount so we don't double-fire alongside the IntersectionObserver
  // setup effect when the sentinel is already in view.
  React.useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (loading || !hasMore || disabled) return;
    const node = localRef.current;
    if (!node || typeof window === "undefined") return;
    const rect = node.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) trackedIntersect();
  }, [loading, hasMore, disabled, trackedIntersect]);

  if (disabled) return null;

  const baseProps = {
    "aria-hidden": true as const,
    role: "presentation" as const,
    "data-loading": loading || undefined,
    "data-active": (hasMore && !loading) || undefined,
    className: [styles.sentinel, className].filter(Boolean).join(" "),
  };

  if (render) {
    return (
      <RenderSentinel
        render={render}
        state={{ hasMore, loading }}
        baseProps={baseProps}
        forwardedProps={rest as Record<string, unknown>}
        setRef={setRef}
      />
    );
  }

  return <div ref={setRef} {...baseProps} {...rest} />;
});

interface RenderSentinelProps {
  render: useRender.RenderProp<{ hasMore: boolean; loading: boolean }>;
  state: { hasMore: boolean; loading: boolean };
  baseProps: Record<string, unknown>;
  forwardedProps: Record<string, unknown>;
  setRef: React.RefCallback<HTMLDivElement>;
}

function RenderSentinel({
  render,
  state,
  baseProps,
  forwardedProps,
  setRef,
}: RenderSentinelProps) {
  return useRender({
    render,
    ref: setRef,
    state,
    props: mergeProps<"div">(
      baseProps as React.ComponentPropsWithRef<"div">,
      forwardedProps as React.ComponentPropsWithRef<"div">,
    ),
  });
}

type StatusRenderState = { loading: boolean; hasMore: boolean };

export interface LoadMoreStatusProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * Either static content, or a render function that receives the current
   * load state and returns the announcement text.
   */
  children?: React.ReactNode | ((state: StatusRenderState) => React.ReactNode);
  /** Defaults to `"polite"`. */
  "aria-live"?: "polite" | "assertive" | "off";
  render?: useRender.RenderProp<{ hasMore: boolean; loading: boolean }>;
}

/** SR-only `aria-live` announcement slot. */
export const LoadMoreStatus = React.forwardRef<
  HTMLDivElement,
  LoadMoreStatusProps
>(function LoadMoreStatus(props, forwardedRef) {
  const {
    children,
    "aria-live": ariaLive = "polite",
    render,
    className,
    ...rest
  } = props;
  const { hasMore, loading } = useLoadMoreContext();

  const content =
    typeof children === "function"
      ? (children as (state: StatusRenderState) => React.ReactNode)({
          loading,
          hasMore,
        })
      : children;

  const baseProps = {
    "aria-live": ariaLive,
    "aria-atomic": true as const,
    "data-loading": loading || undefined,
    "data-end": !hasMore || undefined,
    className: [styles.status, className].filter(Boolean).join(" "),
  };

  if (render) {
    return (
      <RenderStatus
        render={render}
        state={{ hasMore, loading }}
        baseProps={baseProps}
        forwardedProps={{ ...rest, children: content }}
        forwardedRef={forwardedRef}
      />
    );
  }

  return (
    <div ref={forwardedRef} {...baseProps} {...rest}>
      {content}
    </div>
  );
});

interface RenderStatusProps {
  render: useRender.RenderProp<{ hasMore: boolean; loading: boolean }>;
  state: { hasMore: boolean; loading: boolean };
  baseProps: Record<string, unknown>;
  forwardedProps: Record<string, unknown>;
  forwardedRef: React.ForwardedRef<HTMLDivElement>;
}

function RenderStatus({
  render,
  state,
  baseProps,
  forwardedProps,
  forwardedRef,
}: RenderStatusProps) {
  return useRender({
    render,
    ref: forwardedRef as React.Ref<HTMLDivElement>,
    state,
    props: mergeProps<"div">(
      baseProps as React.ComponentPropsWithRef<"div">,
      forwardedProps as React.ComponentPropsWithRef<"div">,
    ),
  });
}

if (process.env.NODE_ENV !== "production") {
  LoadMoreTrigger.displayName = "LoadMoreTrigger";
  LoadMoreSentinel.displayName = "LoadMoreSentinel";
  LoadMoreStatus.displayName = "LoadMoreStatus";
}

export const LoadMore = {
  Root: LoadMoreRoot,
  Trigger: LoadMoreTrigger,
  Sentinel: LoadMoreSentinel,
  Status: LoadMoreStatus,
};

export default LoadMore;
