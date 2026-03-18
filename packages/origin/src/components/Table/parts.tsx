"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./Table.module.scss";
import { CentralIcon } from "../Icon";
import { Skeleton } from "../Skeleton";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";

// ============================================================================
// Root
// ============================================================================

export type TableSize = "default" | "compact";

export interface RootProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Whether any rows are selected (shows all checkboxes when true) */
  hasSelection?: boolean;
  /** Table density — compact reduces row heights for higher information density */
  size?: TableSize;
  /** Whether rows are clickable — shows hover state when true (default: true) */
  clickable?: boolean;
  /** Accessible table description — rendered as a visually hidden <caption> */
  caption?: string;
}

export const Root = React.forwardRef<HTMLTableElement, RootProps>(function Root(
  {
    className,
    hasSelection,
    size = "default",
    clickable = true,
    caption,
    children,
    ...props
  },
  ref,
) {
  return (
    <table
      ref={ref}
      className={clsx(styles.root, className)}
      data-has-selection={hasSelection || undefined}
      data-size={size !== "default" ? size : undefined}
      data-clickable={clickable || undefined}
      {...props}
    >
      {caption && <caption className={styles.caption}>{caption}</caption>}
      {children}
    </table>
  );
});

// ============================================================================
// Header
// ============================================================================

export interface HeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const Header = React.forwardRef<HTMLTableSectionElement, HeaderProps>(
  function Header({ className, ...props }, ref) {
    return <thead ref={ref} className={className} {...props} />;
  },
);

// ============================================================================
// HeaderRow
// ============================================================================

export interface HeaderRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {}

export const HeaderRow = React.forwardRef<HTMLTableRowElement, HeaderRowProps>(
  function HeaderRow({ className, ...props }, ref) {
    return <tr ref={ref} className={className} {...props} />;
  },
);

// ============================================================================
// HeaderCell
// ============================================================================

export interface HeaderCellProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Cell variant */
  variant?: "default" | "checkbox";
  /** Text alignment */
  align?: "left" | "right";
  /** Whether column is sortable */
  sortable?: boolean;
  /** Current sort direction */
  sortDirection?: "asc" | "desc" | false;
  /** Sort click handler */
  onSort?: (event: React.MouseEvent | React.KeyboardEvent) => void;
  /** Whether column is resizable */
  resizable?: boolean;
  /** Leading slot content (e.g. checkbox) */
  leading?: React.ReactNode;
  analyticsName?: string;
}

export const HeaderCell = React.forwardRef<
  HTMLTableCellElement,
  HeaderCellProps
>(function HeaderCell(
  {
    className,
    variant = "default",
    align = "left",
    sortable = false,
    sortDirection,
    onSort,
    resizable: _resizable = false,
    leading,
    analyticsName,
    children,
    ...props
  },
  ref,
) {
  const trackedSort = useTrackedCallback(
    analyticsName,
    "Table.HeaderCell",
    "sort",
    onSort,
    () => ({ column: analyticsName, from_direction: sortDirection }),
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (
      sortable &&
      trackedSort &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      trackedSort(event);
    }
  };

  const sortIcon = sortable ? (
    <span className={styles.sortIcon} aria-hidden="true">
      {sortDirection === "asc" ? (
        <CentralIcon name="IconChevronTopSmall" size={12} />
      ) : sortDirection === "desc" ? (
        <CentralIcon name="IconChevronDownSmall" size={12} />
      ) : (
        <CentralIcon name="IconChevronGrabberVertical" size={12} />
      )}
    </span>
  ) : null;

  return (
    <th
      ref={ref}
      className={clsx(
        styles.headerCell,
        variant !== "default" && styles[`headerCell--${variant}`],
        align !== "left" && styles[`headerCell--${align}`],
        sortable && styles["headerCell--sortable"],
        className,
      )}
      data-align={align}
      data-sortable={sortable || undefined}
      data-sorted={sortDirection || undefined}
      tabIndex={sortable ? 0 : undefined}
      onClick={sortable ? trackedSort : undefined}
      onKeyDown={sortable ? handleKeyDown : undefined}
      aria-sort={
        sortDirection === "asc"
          ? "ascending"
          : sortDirection === "desc"
          ? "descending"
          : sortable
          ? "none"
          : undefined
      }
      {...props}
    >
      <span className={styles.headerCellContent}>
        {leading && <span className={styles.headerCellLeading}>{leading}</span>}
        {align === "right" && sortIcon}
        <span className={styles.headerCellLabel}>{children}</span>
        {align !== "right" && sortIcon}
      </span>
    </th>
  );
});

// ============================================================================
// Body
// ============================================================================

export interface BodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const Body = React.forwardRef<HTMLTableSectionElement, BodyProps>(
  function Body({ className, ...props }, ref) {
    return <tbody ref={ref} className={className} {...props} />;
  },
);

// ============================================================================
// Row
// ============================================================================

export interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /**
   * Whether row is selected — sets data-selected for external styling/tests. No internal visual
   * change per design spec (checkbox indicates selection).
   */
  selected?: boolean;
  /** Whether row is the last row (no bottom border) */
  last?: boolean;
}

export const Row = React.forwardRef<HTMLTableRowElement, RowProps>(function Row(
  { className, selected = false, last = false, onClick, onKeyDown, ...props },
  ref,
) {
  const handleKeyDown = React.useMemo(() => {
    if (!onClick) return onKeyDown;
    return (event: React.KeyboardEvent<HTMLTableRowElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.target !== event.currentTarget) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick(event as unknown as React.MouseEvent<HTMLTableRowElement>);
      }
    };
  }, [onClick, onKeyDown]);

  return (
    <tr
      ref={ref}
      className={clsx(
        styles.row,
        last && styles["row--last"],
        onClick && styles["row--interactive"],
        className,
      )}
      data-selected={selected || undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    />
  );
});

// ============================================================================
// Cell
// ============================================================================

export interface CellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /** Cell variant */
  variant?: "default" | "checkbox";
  /** Text alignment */
  align?: "left" | "right";
  /** Whether cell is in loading state */
  loading?: boolean;
  /** Leading slot content (e.g. checkbox, avatar) */
  leading?: React.ReactNode;
  /** Trailing slot content (e.g. action button) */
  trailing?: React.ReactNode;
}

export const Cell = React.forwardRef<HTMLTableCellElement, CellProps>(
  function Cell(
    {
      className,
      variant = "default",
      align = "left",
      loading = false,
      leading,
      trailing,
      children,
      ...props
    },
    ref,
  ) {
    const hasSlots = leading != null || trailing != null;

    return (
      <td
        ref={ref}
        className={clsx(
          styles.cell,
          variant !== "default" && styles[`cell--${variant}`],
          align !== "left" && styles[`cell--${align}`],
          className,
        )}
        data-align={align}
        data-loading={loading || undefined}
        {...props}
      >
        {loading ? (
          <Skeleton style={{ width: "100%", height: 16 }} />
        ) : hasSlots ? (
          <span className={styles.cellLayout}>
            {leading && <span className={styles.cellSlot}>{leading}</span>}
            <span className={styles.cellLayoutContent}>{children}</span>
            {trailing && <span className={styles.cellSlot}>{trailing}</span>}
          </span>
        ) : (
          children
        )}
      </td>
    );
  },
);

// ============================================================================
// CellContent - helper for label + description pattern
// ============================================================================

export interface CellContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Primary label text */
  label: React.ReactNode;
  /** Secondary description text */
  description?: React.ReactNode;
  /** Optional indicator dot */
  indicator?: boolean;
  /** Optional badge content */
  badge?: React.ReactNode;
}

export const CellContent = React.forwardRef<HTMLDivElement, CellContentProps>(
  function CellContent(
    { className, label, description, indicator = false, badge, ...props },
    ref,
  ) {
    return (
      <div ref={ref} className={clsx(styles.cellContent, className)} {...props}>
        <span className={styles.cellLabel}>
          <span className={styles.cellLabelText}>{label}</span>
          {indicator && <span className={styles.cellIndicator} />}
          {badge}
        </span>
        {description && (
          <span className={styles.cellDescription}>{description}</span>
        )}
      </div>
    );
  },
);

// ============================================================================
// Footer
// ============================================================================

/**
 * Container for content below the table (e.g., pagination, bulk actions, totals).
 *
 * Renders outside the `<table>` element, so wrap both `Table.Root` and
 * `Table.Footer` in a shared parent `<div>`.
 *
 * When used for pagination, add `role="navigation"` and an `aria-label`
 * for screen readers.
 */
export interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Table density — should match `Table.Root`'s `size` for consistent heights */
  size?: TableSize;
}

export const Footer = React.forwardRef<HTMLDivElement, FooterProps>(
  function Footer({ className, size = "default", ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(styles.footer, className)}
        data-size={size !== "default" ? size : undefined}
        {...props}
      />
    );
  },
);

// ============================================================================
// ResizeHandle
// ============================================================================

export interface ResizeHandleProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether currently resizing */
  isResizing?: boolean;
}

export const ResizeHandle = React.forwardRef<HTMLDivElement, ResizeHandleProps>(
  function ResizeHandle({ className, isResizing = false, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(
          styles.resizeHandle,
          isResizing && styles["resizeHandle--resizing"],
          className,
        )}
        data-resizing={isResizing || undefined}
        {...props}
      />
    );
  },
);

// ============================================================================
// CheckboxWrapper (show on hover or when selected)
// ============================================================================

export interface CheckboxWrapperProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

export const CheckboxWrapper = React.forwardRef<
  HTMLSpanElement,
  CheckboxWrapperProps
>(function CheckboxWrapper({ className, ...props }, ref) {
  return (
    <span
      ref={ref}
      className={clsx(styles.checkboxWrapper, className)}
      {...props}
    />
  );
});

// ============================================================================
// Namespace Export
// ============================================================================

export const Table = {
  Root,
  Header,
  HeaderRow,
  HeaderCell,
  Body,
  Row,
  Cell,
  CellContent,
  Footer,
  ResizeHandle,
  CheckboxWrapper,
};
