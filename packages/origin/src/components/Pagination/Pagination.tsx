"use client";

import * as React from "react";
import clsx from "clsx";
import { CentralIcon } from "../Icon";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import { useRender } from "../../lib/base-ui-utils";
import { devWarn } from "../../lib/dev-warn";
import styles from "./Pagination.module.scss";

export interface PaginationContextValue {
  page: number;
  pageSize: number;
  totalItems: number | undefined;
  totalPages: number | undefined;
  startItem: number | undefined;
  endItem: number | undefined;
  onPageChange?: (page: number) => void;
}

const PaginationContext = React.createContext<
  PaginationContextValue | undefined
>(undefined);

/**
 * Read the current pagination state. Must be called inside `<Pagination.Root>`.
 *
 * Useful for building custom parts (e.g. a "go to page" input, custom range
 * message, or a page-size dropdown wired to context).
 */
export function usePaginationContext(): PaginationContextValue {
  const context = React.useContext(PaginationContext);
  if (context === undefined) {
    throw new Error(
      "Pagination parts must be placed within <Pagination.Root>.",
    );
  }
  return context;
}

type PaginationRootState = {
  page: number;
  firstPage: boolean;
  lastPage: boolean | undefined;
};

export interface PaginationRootProps
  extends Omit<React.ComponentPropsWithoutRef<"nav">, "children"> {
  /** Current page number (1-indexed). */
  page: number;
  /**
   * Total number of items across all pages.
   *
   * Optional. When omitted, `Pagination.Next` no longer auto-disables and
   * `Pagination.Range` requires a custom render function. Prefer the `Pager`
   * primitive for fully unknown-total flows; this escape hatch exists so
   * consumers with partial knowledge are not blocked.
   */
  totalItems?: number;
  /** Number of items per page. */
  pageSize: number;
  /** Called when the consumer requests a page change (Prev/Next clicks). */
  onPageChange?: (page: number) => void;
  analyticsName?: string;
  render?: useRender.RenderProp<PaginationRootState>;
  children?: React.ReactNode;
}

const PaginationRoot = React.forwardRef<HTMLElement, PaginationRootProps>(
  function PaginationRoot(props, forwardedRef) {
    const {
      page,
      totalItems,
      pageSize,
      onPageChange,
      analyticsName,
      className,
      children,
      render,
      ...elementProps
    } = props;

    const trackedPageChange = useTrackedCallback(
      analyticsName,
      "Pagination",
      "change",
      onPageChange,
      (nextPage: number) => ({
        page: nextPage,
        direction: nextPage > page ? "next" : "previous",
      }),
    );

    const totalPages =
      totalItems === undefined
        ? undefined
        : Math.max(1, Math.ceil(totalItems / pageSize));
    const startItem =
      totalItems === undefined
        ? undefined
        : totalItems === 0
        ? 0
        : (page - 1) * pageSize + 1;
    const endItem =
      totalItems === undefined
        ? undefined
        : Math.min(page * pageSize, totalItems);

    const contextValue = React.useMemo(
      () => ({
        page,
        totalItems,
        pageSize,
        totalPages,
        startItem,
        endItem,
        onPageChange: trackedPageChange,
      }),
      [
        page,
        totalItems,
        pageSize,
        totalPages,
        startItem,
        endItem,
        trackedPageChange,
      ],
    );

    const state: PaginationRootState = {
      page,
      firstPage: page <= 1,
      lastPage: totalPages === undefined ? undefined : page >= totalPages,
    };

    const element = useRender({
      defaultTagName: "nav",
      render,
      ref: forwardedRef,
      state,
      stateAttributesMapping: {
        firstPage: (v) => (v ? { "data-first-page": "" } : null),
        lastPage: (v) => (v === true ? { "data-last-page": "" } : null),
        page: (v) => ({ "data-page": String(v) }),
      },
      props: [
        { "aria-label": "Pagination" },
        elementProps,
        { className: clsx(styles.root, className), children },
      ] as unknown as Record<string, unknown>,
    });

    return (
      <PaginationContext.Provider value={contextValue}>
        {element}
      </PaginationContext.Provider>
    );
  },
);

export interface PaginationLabelProps
  extends React.ComponentPropsWithoutRef<"span"> {
  render?: useRender.RenderProp<Record<string, never>>;
}

const PaginationLabel = React.forwardRef<HTMLSpanElement, PaginationLabelProps>(
  function PaginationLabel(props, forwardedRef) {
    const {
      className,
      children = "Items per page",
      render,
      ...elementProps
    } = props;

    return useRender({
      defaultTagName: "span",
      render,
      ref: forwardedRef,
      props: [
        elementProps,
        { className: clsx(styles.label, className), children },
      ] as unknown as Record<string, unknown>,
    });
  },
);

export interface PaginationRangeProps
  extends Omit<React.ComponentPropsWithoutRef<"span">, "children"> {
  /**
   * Custom render function for the range text. Receives the derived range from
   * context. When `Pagination.Root` is used without `totalItems`, all three
   * fields are `undefined`.
   */
  children?: (context: {
    startItem: number | undefined;
    endItem: number | undefined;
    totalItems: number | undefined;
  }) => React.ReactNode;
  /**
   * Format for total items. Defaults to abbreviated (e.g. `2500 → "2.5K"`);
   * pass `(n) => n.toLocaleString()` for full numbers.
   */
  formatTotal?: (total: number) => string;
  render?: useRender.RenderProp<Record<string, never>>;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return num.toString();
}

const PaginationRange = React.forwardRef<HTMLSpanElement, PaginationRangeProps>(
  function PaginationRange(props, forwardedRef) {
    const {
      className,
      children,
      formatTotal = formatNumber,
      render,
      ...elementProps
    } = props;
    const { startItem, endItem, totalItems } = usePaginationContext();

    let content: React.ReactNode = null;
    let canRender = true;
    if (children) {
      content = children({ startItem, endItem, totalItems });
    } else if (
      totalItems !== undefined &&
      startItem !== undefined &&
      endItem !== undefined
    ) {
      content = `${startItem}–${endItem} of ${formatTotal(totalItems)}`;
    } else {
      canRender = false;
    }

    const element = useRender({
      defaultTagName: "span",
      render,
      ref: forwardedRef,
      enabled: canRender,
      props: [
        elementProps,
        { className: clsx(styles.range, className), children: content },
      ] as unknown as Record<string, unknown>,
    });

    if (!canRender) {
      devWarn(
        "[Pagination.Range] Pagination.Range requires `totalItems` on Pagination.Root, or a custom children render function. Skipping render.",
      );
      return null;
    }

    return element;
  },
);

export interface PaginationNavigationProps
  extends React.ComponentPropsWithoutRef<"div"> {
  render?: useRender.RenderProp<Record<string, never>>;
}

const PaginationNavigation = React.forwardRef<
  HTMLDivElement,
  PaginationNavigationProps
>(function PaginationNavigation(props, forwardedRef) {
  const { className, children, render, ...elementProps } = props;

  return useRender({
    defaultTagName: "div",
    render,
    ref: forwardedRef,
    props: [
      { role: "group", "aria-label": "Page navigation" },
      elementProps,
      { className: clsx(styles.navigation, className), children },
    ] as unknown as Record<string, unknown>,
  });
});

type NavButtonState = { disabled: boolean };

export interface PaginationPreviousProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {
  render?: useRender.RenderProp<NavButtonState>;
  children?: React.ReactNode;
}

const PaginationPrevious = React.forwardRef<
  HTMLButtonElement,
  PaginationPreviousProps
>(function PaginationPrevious(props, forwardedRef) {
  const { className, onClick, disabled, render, children, ...elementProps } =
    props;
  const { page, onPageChange } = usePaginationContext();

  const isDisabled = disabled ?? page <= 1;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event as React.MouseEvent<HTMLButtonElement>);
    if (!event.defaultPrevented && onPageChange) {
      onPageChange(page - 1);
    }
  };

  return useRender({
    defaultTagName: "button",
    render,
    ref: forwardedRef,
    state: { disabled: isDisabled },
    props: [
      {
        type: "button",
        "aria-label": "Previous page",
        "aria-disabled": isDisabled || undefined,
        disabled: isDisabled,
        onClick: handleClick,
      },
      elementProps,
      {
        className: clsx(styles.button, className),
        children: children ?? (
          <CentralIcon name="IconChevronLeftSmall" size={16} />
        ),
      },
    ] as unknown as Record<string, unknown>,
  });
});

export interface PaginationNextProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {
  render?: useRender.RenderProp<NavButtonState>;
  children?: React.ReactNode;
}

const PaginationNext = React.forwardRef<HTMLButtonElement, PaginationNextProps>(
  function PaginationNext(props, forwardedRef) {
    const { className, onClick, disabled, render, children, ...elementProps } =
      props;
    const { page, totalPages, onPageChange } = usePaginationContext();

    const isDisabled =
      disabled ?? (totalPages !== undefined && page >= totalPages);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event as React.MouseEvent<HTMLButtonElement>);
      if (!event.defaultPrevented && onPageChange) {
        onPageChange(page + 1);
      }
    };

    return useRender({
      defaultTagName: "button",
      render,
      ref: forwardedRef,
      state: { disabled: isDisabled },
      props: [
        {
          type: "button",
          "aria-label": "Next page",
          "aria-disabled": isDisabled || undefined,
          disabled: isDisabled,
          onClick: handleClick,
        },
        elementProps,
        {
          className: clsx(styles.button, className),
          children: children ?? (
            <CentralIcon name="IconChevronRightSmall" size={16} />
          ),
        },
      ] as unknown as Record<string, unknown>,
    });
  },
);

export const Pagination = {
  Root: PaginationRoot,
  Label: PaginationLabel,
  Range: PaginationRange,
  Navigation: PaginationNavigation,
  Previous: PaginationPrevious,
  Next: PaginationNext,
  usePaginationContext,
};

export default Pagination;
