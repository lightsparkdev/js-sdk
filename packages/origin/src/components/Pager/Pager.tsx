"use client";

import * as React from "react";
import clsx from "clsx";
import { CentralIcon } from "../Icon";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import {
  useRender,
  type StateAttributesMapping,
} from "../../lib/base-ui-utils";
import styles from "./Pager.module.scss";

export interface PagerContextValue {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious?: (() => void) | undefined;
  onNext?: (() => void) | undefined;
}

export const PagerContext = React.createContext<PagerContextValue | undefined>(
  undefined,
);

/** Reads the current `Pager` context. Throws when used outside `Pager.Root`. */
export function usePagerContext(): PagerContextValue {
  const context = React.useContext(PagerContext);
  if (context === undefined) {
    throw new Error("Pager parts must be placed within <Pager.Root>.");
  }
  return context;
}

export type PagerRootState = {
  hasPrevious: boolean;
  hasNext: boolean;
};

export type PagerNavigationState = {
  hasPrevious: boolean;
  hasNext: boolean;
};

export type PagerButtonState = {
  disabled: boolean;
  direction: "previous" | "next";
};

export interface PagerRootProps
  extends Omit<React.ComponentPropsWithoutRef<"nav">, "onChange"> {
  /** Whether a previous page exists. Drives `Pager.Previous` disabled state. */
  hasPrevious: boolean;
  /** Whether a next page exists. Drives `Pager.Next` disabled state. */
  hasNext: boolean;
  /** Fires when `Pager.Previous` is activated. */
  onPrevious?: () => void;
  /** Fires when `Pager.Next` is activated. */
  onNext?: () => void;
  /** Optional analytics name. Clicks emit `Pager.click` with `{ direction }` metadata. */
  analyticsName?: string;
  /** Override the rendered element. Defaults to `<nav>`. */
  render?: useRender.RenderProp<PagerRootState>;
}

const rootStateAttributesMapping: StateAttributesMapping<PagerRootState> = {
  hasPrevious: (value) => (value ? null : { "data-no-previous": "" }),
  hasNext: (value) => (value ? null : { "data-no-next": "" }),
};

const noopStateAttributesMapping: StateAttributesMapping<{
  hasPrevious: boolean;
  hasNext: boolean;
}> = {
  hasPrevious: () => null,
  hasNext: () => null,
};

const PagerRoot = React.forwardRef<HTMLElement, PagerRootProps>(
  function PagerRoot(props, forwardedRef) {
    const {
      hasPrevious,
      hasNext,
      onPrevious,
      onNext,
      analyticsName,
      className,
      render,
      ...elementProps
    } = props;

    const trackedPrevious = useTrackedCallback(
      analyticsName,
      "Pager",
      "click",
      onPrevious,
      () => ({ direction: "previous" }),
    );
    const trackedNext = useTrackedCallback(
      analyticsName,
      "Pager",
      "click",
      onNext,
      () => ({ direction: "next" }),
    );

    const contextValue = React.useMemo<PagerContextValue>(
      () => ({
        hasPrevious,
        hasNext,
        onPrevious: onPrevious ? trackedPrevious : undefined,
        onNext: onNext ? trackedNext : undefined,
      }),
      [hasPrevious, hasNext, onPrevious, onNext, trackedPrevious, trackedNext],
    );

    const state = React.useMemo<PagerRootState>(
      () => ({ hasPrevious, hasNext }),
      [hasPrevious, hasNext],
    );

    const element = useRender({
      defaultTagName: "nav",
      render,
      state,
      ref: forwardedRef,
      stateAttributesMapping: rootStateAttributesMapping,
      props: {
        "aria-label": "Pager",
        ...elementProps,
        className: clsx(styles.root, className),
      },
    });

    return (
      <PagerContext.Provider value={contextValue}>
        {element}
      </PagerContext.Provider>
    );
  },
);
PagerRoot.displayName = "Pager";

export interface PagerNavigationProps
  extends React.ComponentPropsWithoutRef<"div"> {
  /** Override the rendered element. Defaults to `<div>`. */
  render?: useRender.RenderProp<PagerNavigationState>;
}

const PagerNavigation = React.forwardRef<HTMLDivElement, PagerNavigationProps>(
  function PagerNavigation(props, forwardedRef) {
    const { className, render, ...elementProps } = props;
    const { hasPrevious, hasNext } = usePagerContext();

    const state = React.useMemo<PagerNavigationState>(
      () => ({ hasPrevious, hasNext }),
      [hasPrevious, hasNext],
    );

    return useRender({
      defaultTagName: "div",
      render,
      state,
      ref: forwardedRef,
      stateAttributesMapping: noopStateAttributesMapping,
      props: {
        role: "group",
        "aria-label": "Page navigation",
        ...elementProps,
        className: clsx(styles.navigation, className),
      },
    });
  },
);
PagerNavigation.displayName = "Pager.Navigation";

export interface PagerPreviousProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {
  /** Override the rendered element. Defaults to `<button>`. */
  render?: useRender.RenderProp<PagerButtonState>;
  /** Custom button content. Defaults to a left chevron icon. */
  children?: React.ReactNode;
}

const PagerPrevious = React.forwardRef<HTMLButtonElement, PagerPreviousProps>(
  function PagerPrevious(props, forwardedRef) {
    const { className, onClick, disabled, children, render, ...elementProps } =
      props;
    const { hasPrevious, onPrevious } = usePagerContext();

    const isDisabled = disabled ?? !hasPrevious;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
      if (!event.defaultPrevented && onPrevious) {
        onPrevious();
      }
    };

    const state: PagerButtonState = {
      disabled: isDisabled,
      direction: "previous",
    };

    return useRender({
      defaultTagName: "button",
      render,
      state,
      ref: forwardedRef,
      props: {
        type: "button",
        "aria-label": "Previous page",
        ...elementProps,
        disabled: isDisabled,
        onClick: handleClick,
        className: clsx(styles.button, className),
        children: children ?? (
          <CentralIcon name="IconChevronLeftSmall" size={16} />
        ),
      },
    });
  },
);
PagerPrevious.displayName = "Pager.Previous";

export interface PagerNextProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {
  /** Override the rendered element. Defaults to `<button>`. */
  render?: useRender.RenderProp<PagerButtonState>;
  /** Custom button content. Defaults to a right chevron icon. */
  children?: React.ReactNode;
}

const PagerNext = React.forwardRef<HTMLButtonElement, PagerNextProps>(
  function PagerNext(props, forwardedRef) {
    const { className, onClick, disabled, children, render, ...elementProps } =
      props;
    const { hasNext, onNext } = usePagerContext();

    const isDisabled = disabled ?? !hasNext;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
      if (!event.defaultPrevented && onNext) {
        onNext();
      }
    };

    const state: PagerButtonState = {
      disabled: isDisabled,
      direction: "next",
    };

    return useRender({
      defaultTagName: "button",
      render,
      state,
      ref: forwardedRef,
      props: {
        type: "button",
        "aria-label": "Next page",
        ...elementProps,
        disabled: isDisabled,
        onClick: handleClick,
        className: clsx(styles.button, className),
        children: children ?? (
          <CentralIcon name="IconChevronRightSmall" size={16} />
        ),
      },
    });
  },
);
PagerNext.displayName = "Pager.Next";

export interface PagerStatusProps
  extends React.ComponentPropsWithoutRef<"span"> {
  /** Override the rendered element. Defaults to `<span>`. */
  render?: useRender.RenderProp<PagerRootState>;
  /** Status text. The live region stays mounted even when empty so updates are announced. */
  children?: React.ReactNode;
}

const PagerStatus = React.forwardRef<HTMLSpanElement, PagerStatusProps>(
  function PagerStatus(props, forwardedRef) {
    const { className, children, render, ...elementProps } = props;
    const { hasPrevious, hasNext } = usePagerContext();

    const state = React.useMemo<PagerRootState>(
      () => ({ hasPrevious, hasNext }),
      [hasPrevious, hasNext],
    );

    return useRender({
      defaultTagName: "span",
      render,
      state,
      ref: forwardedRef,
      stateAttributesMapping: noopStateAttributesMapping,
      props: {
        role: "status",
        "aria-live": "polite",
        "aria-atomic": "true",
        ...elementProps,
        className: clsx(styles.status, className),
        children,
      },
    });
  },
);
PagerStatus.displayName = "Pager.Status";

export const Pager = {
  Root: PagerRoot,
  Navigation: PagerNavigation,
  Previous: PagerPrevious,
  Next: PagerNext,
  Status: PagerStatus,
  usePagerContext,
};

export default Pager;
