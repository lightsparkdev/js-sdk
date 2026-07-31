"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./Table.module.scss";
import { CentralIcon } from "../Icon";
import { Popover } from "../Popover";
import { Skeleton } from "../Skeleton";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import type { RowActivationEvent } from "./rowActivation";

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
  /** Whether cell is in loading state */
  loading?: boolean;
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
    loading = false,
    analyticsName,
    children,
    onClick: nativeOnClick,
    onKeyDown: nativeOnKeyDown,
    tabIndex: nativeTabIndex,
    "aria-label": nativeAriaLabel,
    "aria-sort": nativeAriaSort,
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
  const sortableEnabled = sortable && !loading;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (
      sortableEnabled &&
      trackedSort &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      trackedSort(event);
    }
  };

  const sortIcon = sortableEnabled ? (
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
      {...props}
      ref={ref}
      className={clsx(
        styles.headerCell,
        variant !== "default" && styles[`headerCell--${variant}`],
        align !== "left" && styles[`headerCell--${align}`],
        sortableEnabled && styles["headerCell--sortable"],
        className,
      )}
      data-align={align}
      data-sortable={sortableEnabled || undefined}
      data-sorted={sortableEnabled ? sortDirection || undefined : undefined}
      data-loading={loading || undefined}
      tabIndex={
        loading
          ? undefined
          : nativeTabIndex ?? (sortableEnabled ? 0 : undefined)
      }
      onClick={
        loading
          ? undefined
          : nativeOnClick ?? (sortableEnabled ? trackedSort : undefined)
      }
      onKeyDown={
        loading
          ? undefined
          : nativeOnKeyDown ?? (sortableEnabled ? handleKeyDown : undefined)
      }
      aria-label={
        nativeAriaLabel ??
        (loading && typeof children === "string" ? children : undefined)
      }
      aria-sort={
        loading
          ? undefined
          : nativeAriaSort ??
            (!sortableEnabled
              ? undefined
              : sortDirection === "asc"
              ? "ascending"
              : sortDirection === "desc"
              ? "descending"
              : "none")
      }
    >
      {loading ? (
        <Skeleton className={styles.loadingBar} />
      ) : (
        <span className={styles.headerCellContent}>
          {leading && (
            <span className={styles.headerCellLeading}>{leading}</span>
          )}
          {align === "right" && sortIcon}
          <span className={styles.headerCellLabel}>{children}</span>
          {align !== "right" && sortIcon}
        </span>
      )}
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

const INTERACTIVE_ROW_DESCENDANT_SELECTOR = [
  "a[href]",
  "area[href]",
  "audio[controls]",
  "button",
  "input",
  "label",
  "select",
  "summary",
  "textarea",
  "video[controls]",
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
  '[role="button"]',
  '[role="checkbox"]',
  '[role="combobox"]',
  '[role="grid"]',
  '[role="link"]',
  '[role="listbox"]',
  '[role="menu"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="option"]',
  '[role="radio"]',
  '[role="searchbox"]',
  '[role="slider"]',
  '[role="spinbutton"]',
  '[role="switch"]',
  '[role="tab"]',
  '[role="textbox"]',
  '[role="tree"]',
  '[role="treeitem"]',
].join(",");

function isInteractiveRowDescendant(
  event: React.MouseEvent<HTMLTableRowElement>,
): boolean {
  if (!(event.target instanceof Element)) {
    return false;
  }
  const interactiveTarget = event.target.closest(
    INTERACTIVE_ROW_DESCENDANT_SELECTOR,
  );
  return (
    interactiveTarget !== null &&
    interactiveTarget !== event.currentTarget &&
    event.currentTarget.contains(interactiveTarget)
  );
}

function toRowActivationEvent(
  event:
    | React.MouseEvent<HTMLTableRowElement>
    | React.KeyboardEvent<HTMLTableRowElement>,
): RowActivationEvent {
  return {
    metaKey: event.metaKey,
    ctrlKey: event.ctrlKey,
  };
}

interface RowBaseProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /**
   * Whether row is selected — sets data-selected for external styling/tests. No internal visual
   * change per design spec (checkbox indicates selection).
   */
  selected?: boolean;
  /** Whether row is the last row (no bottom border) */
  last?: boolean;
}

export type RowProps = RowBaseProps &
  (
    | {
        /**
         * Activates the row from a pointer click or Enter/Space. Unlike the native
         * `onClick`, this callback receives only provider-free activation modifiers.
         * Pointer clicks call `onClick` first; preventing that event suppresses
         * activation. Interactive descendants do not activate the row, and keyboard
         * activation calls only `onActivate` when present.
         */
        onActivate: (event: RowActivationEvent) => void;
        /**
         * Accessible action name for an activated row. Preserves the native
         * `<tr>` role while exposing actionability and keyboard shortcuts.
         */
        activationLabel: string;
      }
    | {
        /**
         * Without normalized activation, native `onClick` remains available
         * and dispatches a real DOM click from Enter/Space.
         */
        onActivate?: undefined;
        activationLabel?: string;
      }
  );

export const Row = React.forwardRef<HTMLTableRowElement, RowProps>(function Row(
  {
    activationLabel,
    className,
    selected = false,
    last = false,
    onActivate,
    onClick,
    onKeyDown,
    ...props
  },
  ref,
) {
  const interactive = onActivate !== undefined || onClick !== undefined;
  const handleClick = React.useMemo(() => {
    if (!onActivate) return onClick;
    return (event: React.MouseEvent<HTMLTableRowElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || isInteractiveRowDescendant(event)) {
        return;
      }
      onActivate(toRowActivationEvent(event));
    };
  }, [onActivate, onClick]);

  const handleKeyDown = React.useMemo(() => {
    if (!onActivate && !onClick) return onKeyDown;
    return (event: React.KeyboardEvent<HTMLTableRowElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.target !== event.currentTarget) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (onActivate) {
          onActivate(toRowActivationEvent(event));
        } else {
          event.currentTarget.click();
        }
      }
    };
  }, [onActivate, onClick, onKeyDown]);

  return (
    <tr
      ref={ref}
      className={clsx(
        styles.row,
        last && styles["row--last"],
        interactive && styles["row--interactive"],
        className,
      )}
      data-selected={selected || undefined}
      aria-keyshortcuts={activationLabel ? "Enter Space" : undefined}
      aria-label={activationLabel}
      aria-roledescription={activationLabel ? "actionable row" : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={interactive ? 0 : undefined}
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
          <Skeleton className={styles.loadingBar} />
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
  /** Primary label content */
  label: React.ReactNode;
  /** Secondary description content */
  description?: React.ReactNode;
  /** Optional indicator dot */
  indicator?: boolean;
  /** Optional badge content */
  badge?: React.ReactNode;
  /** Bounds intrinsic width for deliberately open-ended table text */
  bounded?: boolean;
  /**
   * Whether bounded plain text opens a full-value popover.
   * @default true
   */
  disclosure?: boolean;
}

export const CellContent = React.forwardRef<HTMLDivElement, CellContentProps>(
  function CellContent(
    {
      className,
      label,
      description,
      bounded = false,
      disclosure: disclosureEnabled = true,
      indicator = false,
      badge,
      ...props
    },
    ref,
  ) {
    let disclosureText: string | undefined;
    if (
      bounded &&
      disclosureEnabled &&
      typeof label === "string" &&
      (description == null || typeof description === "string") &&
      badge == null
    ) {
      const disclosureParts = [label, description].filter(
        (part): part is string =>
          typeof part === "string" && part.trim().length > 0,
      );
      disclosureText =
        disclosureParts.length > 0 ? disclosureParts.join("\n") : undefined;
    }

    return (
      <div
        ref={ref}
        className={clsx(styles.cellContent, className)}
        data-bounded={bounded || undefined}
        {...props}
      >
        {disclosureText !== undefined ? (
          <Popover.Root>
            <Popover.Trigger
              render={
                <button
                  type="button"
                  className={styles.cellDisclosureTrigger}
                />
              }
            >
              <CellContentText
                label={label}
                description={description}
                indicator={indicator}
                badge={badge}
              />
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner sideOffset={4}>
                <Popover.Popup
                  aria-label="Full cell value"
                  className={styles.cellDisclosurePopup}
                >
                  {disclosureText}
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        ) : (
          <CellContentText
            label={label}
            description={description}
            indicator={indicator}
            badge={badge}
          />
        )}
      </div>
    );
  },
);

function CellContentText({
  badge,
  description,
  indicator,
  label,
}: Pick<CellContentProps, "badge" | "description" | "indicator" | "label">) {
  return (
    <>
      <span className={styles.cellLabel}>
        <span className={styles.cellLabelText}>{label}</span>
        {indicator && <span className={styles.cellIndicator} />}
        {badge}
      </span>
      {description && (
        <span className={styles.cellDescription}>{description}</span>
      )}
    </>
  );
}

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
