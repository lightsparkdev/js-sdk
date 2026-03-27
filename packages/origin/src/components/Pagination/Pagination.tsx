"use client";

import * as React from "react";
import clsx from "clsx";
import { CentralIcon } from "../Icon";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import styles from "./Pagination.module.scss";

// Context for sharing pagination state
interface PaginationContextValue {
  page: number;
  totalItems: number;
  pageSize: number;
  totalPages: number;
  startItem: number;
  endItem: number;
  onPageChange?: (page: number) => void;
}

const PaginationContext = React.createContext<
  PaginationContextValue | undefined
>(undefined);

function usePaginationContext() {
  const context = React.useContext(PaginationContext);
  if (context === undefined) {
    throw new Error(
      "Pagination parts must be placed within <Pagination.Root>.",
    );
  }
  return context;
}

// Root
export interface PaginationRootProps
  extends React.ComponentPropsWithoutRef<"nav"> {
  /** Current page number (1-indexed) */
  page: number;
  /** Total number of items */
  totalItems: number;
  /** Number of items per page */
  pageSize: number;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
  analyticsName?: string;
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
      ...elementProps
    } = props;

    const trackedPageChange = useTrackedCallback(
      analyticsName,
      "Pagination",
      "change",
      onPageChange,
      (p: number) => ({ page: p }),
    );

    const totalPages = Math.ceil(totalItems / pageSize);
    const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, totalItems);

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

    return (
      <PaginationContext.Provider value={contextValue}>
        <nav
          ref={forwardedRef}
          aria-label="Pagination"
          className={clsx(styles.root, className)}
          {...elementProps}
        >
          {children}
        </nav>
      </PaginationContext.Provider>
    );
  },
);

// Label - "Items per page" text
export interface PaginationLabelProps
  extends React.ComponentPropsWithoutRef<"span"> {}

const PaginationLabel = React.forwardRef<HTMLSpanElement, PaginationLabelProps>(
  function PaginationLabel(props, forwardedRef) {
    const { className, children = "Items per page", ...elementProps } = props;

    return (
      <span
        ref={forwardedRef}
        className={clsx(styles.label, className)}
        {...elementProps}
      >
        {children}
      </span>
    );
  },
);

// Range - Shows "{start} / {end} of {total}"
export interface PaginationRangeProps
  extends Omit<React.ComponentPropsWithoutRef<"span">, "children"> {
  /**
   * Custom render function for the range text.
   * Receives startItem, endItem, and totalItems.
   */
  children?: (context: {
    startItem: number;
    endItem: number;
    totalItems: number;
  }) => React.ReactNode;
  /** Format for total items (e.g., "2.5K" vs "2500"). Default shows formatted. */
  formatTotal?: (total: number) => string;
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
      ...elementProps
    } = props;
    const { startItem, endItem, totalItems } = usePaginationContext();

    const content = children
      ? children({ startItem, endItem, totalItems })
      : `${startItem}–${endItem} of ${formatTotal(totalItems)}`;

    return (
      <span
        ref={forwardedRef}
        className={clsx(styles.range, className)}
        {...elementProps}
      >
        {content}
      </span>
    );
  },
);

// Navigation - Container for joined prev/next buttons
export interface PaginationNavigationProps
  extends React.ComponentPropsWithoutRef<"div"> {}

const PaginationNavigation = React.forwardRef<
  HTMLDivElement,
  PaginationNavigationProps
>(function PaginationNavigation(props, forwardedRef) {
  const { className, children, ...elementProps } = props;

  return (
    <div
      ref={forwardedRef}
      className={clsx(styles.navigation, className)}
      role="group"
      aria-label="Page navigation"
      {...elementProps}
    >
      {children}
    </div>
  );
});

// Previous button
export interface PaginationPreviousProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {}

const PaginationPrevious = React.forwardRef<
  HTMLButtonElement,
  PaginationPreviousProps
>(function PaginationPrevious(props, forwardedRef) {
  const { className, onClick, disabled, ...elementProps } = props;
  const { page, onPageChange } = usePaginationContext();

  const isDisabled = disabled ?? page <= 1;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented && onPageChange) {
      onPageChange(page - 1);
    }
  };

  return (
    <button
      ref={forwardedRef}
      type="button"
      aria-label="Previous page"
      disabled={isDisabled}
      onClick={handleClick}
      className={clsx(styles.button, className)}
      {...elementProps}
    >
      <CentralIcon name="IconChevronLeftSmall" size={16} />
    </button>
  );
});

// Next button
export interface PaginationNextProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {}

const PaginationNext = React.forwardRef<HTMLButtonElement, PaginationNextProps>(
  function PaginationNext(props, forwardedRef) {
    const { className, onClick, disabled, ...elementProps } = props;
    const { page, totalPages, onPageChange } = usePaginationContext();

    const isDisabled = disabled ?? page >= totalPages;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented && onPageChange) {
        onPageChange(page + 1);
      }
    };

    return (
      <button
        ref={forwardedRef}
        type="button"
        aria-label="Next page"
        disabled={isDisabled}
        onClick={handleClick}
        className={clsx(styles.button, className)}
        {...elementProps}
      >
        <CentralIcon name="IconChevronRightSmall" size={16} />
      </button>
    );
  },
);

// Export compound component
export const Pagination = {
  Root: PaginationRoot,
  Label: PaginationLabel,
  Range: PaginationRange,
  Navigation: PaginationNavigation,
  Previous: PaginationPrevious,
  Next: PaginationNext,
};

export default Pagination;
