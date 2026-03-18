"use client";

import * as React from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { CentralIcon } from "../Icon";
import { CheckboxIndicator } from "../Checkbox";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import clsx from "clsx";
import styles from "./Combobox.module.scss";
import chipStyles from "../Chip/Chip.module.scss";

// Context to share InputWrapper ref with Positioner for proper anchor width
const AnchorContext =
  React.createContext<React.RefObject<HTMLDivElement | null> | null>(null);

export interface RootProps<Value, Multiple extends boolean | undefined = false>
  extends BaseCombobox.Root.Props<Value, Multiple> {
  autoHighlight?: boolean;
  analyticsName?: string;
}

/**
 * Combobox.Root - Container for the combobox.
 *
 * Uses Base UI's built-in collator filter by default. Pass `filter={null}`
 * to disable filtering, or provide a custom filter function.
 *
 * Note: Root is a context provider, not a DOM element, so it doesn't support ref forwarding.
 * This is expected behavior for compound component roots.
 */
export function Root<Value, Multiple extends boolean | undefined = false>({
  autoHighlight = true,
  analyticsName,
  onValueChange,
  children,
  ...props
}: RootProps<Value, Multiple>) {
  const anchorRef = React.useRef<HTMLDivElement | null>(null);
  const trackedChange = useTrackedCallback(
    analyticsName,
    "Combobox",
    "change",
    onValueChange,
    (value: unknown) => ({ value }),
  );

  return (
    <AnchorContext.Provider value={anchorRef}>
      <BaseCombobox.Root
        autoHighlight={autoHighlight}
        onValueChange={trackedChange}
        {...props}
      >
        {children}
      </BaseCombobox.Root>
    </AnchorContext.Provider>
  );
}

export interface InputWrapperProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Combobox.InputWrapper - Container for Input + ActionButtons.
 *
 * Uses position: relative to contain the absolutely positioned ActionButtons.
 * Also serves as the anchor element for Positioner (popup width matches this).
 *
 * ```tsx
 * <Combobox.InputWrapper>
 *   <Combobox.Input placeholder="Search..." />
 *   <Combobox.ActionButtons>
 *     <Combobox.Clear />
 *     <Combobox.Trigger />
 *   </Combobox.ActionButtons>
 * </Combobox.InputWrapper>
 * ```
 */
export const InputWrapper = React.forwardRef<HTMLDivElement, InputWrapperProps>(
  function InputWrapper({ className, ...props }, forwardedRef) {
    const anchorRef = React.useContext(AnchorContext);

    // Combine forwarded ref with anchor ref
    const combinedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        // Update anchor context ref
        if (anchorRef) {
          (anchorRef as React.MutableRefObject<HTMLDivElement | null>).current =
            node;
        }
        // Update forwarded ref
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [anchorRef, forwardedRef],
    );

    return (
      <div
        ref={combinedRef}
        className={clsx(styles.inputWrapper, className)}
        {...props}
      />
    );
  },
);

export interface InputProps extends BaseCombobox.Input.Props {}

/**
 * Combobox.Input - The text input element.
 *
 * Should be placed directly inside InputWrapper, NOT inside Trigger.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, ...props }, ref) {
    return (
      <BaseCombobox.Input
        ref={ref}
        className={clsx(styles.input, className)}
        {...props}
      />
    );
  },
);

export interface ActionButtonsProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Combobox.ActionButtons - Container for Clear and Trigger buttons.
 *
 * Absolutely positioned within InputWrapper.
 */
export const ActionButtons = React.forwardRef<
  HTMLDivElement,
  ActionButtonsProps
>(function ActionButtons({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={clsx(styles.actionButtons, className)}
      {...props}
    />
  );
});

export interface TriggerProps extends BaseCombobox.Trigger.Props {}

/**
 * Combobox.Trigger - Button to open/close the popup.
 *
 * Renders as a small icon button with the chevron icon.
 */
export const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  function Trigger({ className, children, ...props }, ref) {
    return (
      <BaseCombobox.Trigger
        ref={ref}
        className={clsx(styles.trigger, className)}
        {...props}
      >
        {children ?? <CentralIcon name="IconChevronDownSmall" size={20} />}
      </BaseCombobox.Trigger>
    );
  },
);

export interface ClearProps extends BaseCombobox.Clear.Props {}

/**
 * Combobox.Clear - Button to clear the selection.
 *
 * Renders as a small icon button with the X icon.
 * Uses Base UI's default behavior - only visible when there's a value to clear.
 */
export const Clear = React.forwardRef<HTMLButtonElement, ClearProps>(
  function Clear({ className, children, ...props }, ref) {
    return (
      <BaseCombobox.Clear
        ref={ref}
        className={clsx(styles.clear, className)}
        {...props}
      >
        {children ?? <CentralIcon name="IconCircleX" size={17} />}
      </BaseCombobox.Clear>
    );
  },
);

export interface PortalProps extends BaseCombobox.Portal.Props {}

export const Portal = BaseCombobox.Portal;

export interface PositionerProps extends BaseCombobox.Positioner.Props {}

/**
 * Combobox.Positioner - Handles popup positioning.
 *
 * Base UI handles all positioning via CSS variables.
 * Anchors to InputWrapper (via context) so popup width matches the full trigger area.
 */
export const Positioner = React.forwardRef<HTMLDivElement, PositionerProps>(
  function Positioner({ className, sideOffset = 4, anchor, ...props }, ref) {
    const anchorRef = React.useContext(AnchorContext);

    return (
      <BaseCombobox.Positioner
        ref={ref}
        className={clsx(styles.positioner, className)}
        sideOffset={sideOffset}
        // Use InputWrapper as anchor for proper width, unless explicitly overridden
        anchor={anchor ?? anchorRef}
        {...props}
      />
    );
  },
);

export interface PopupProps extends BaseCombobox.Popup.Props {}

export const Popup = React.forwardRef<HTMLDivElement, PopupProps>(
  function Popup({ className, ...props }, ref) {
    return (
      <BaseCombobox.Popup
        ref={ref}
        className={clsx(styles.popup, className)}
        {...props}
      />
    );
  },
);

export interface ListProps extends BaseCombobox.List.Props {}

export const List = React.forwardRef<HTMLDivElement, ListProps>(function List(
  { className, ...props },
  ref,
) {
  return (
    <BaseCombobox.List
      ref={ref}
      className={clsx(styles.list, className)}
      {...props}
    />
  );
});

export interface ItemProps extends BaseCombobox.Item.Props {
  /** Icon to display at the start of the item (16×16px slot) */
  leadingIcon?: React.ReactNode;
  /** Icon to display at the end of the item (16×16px slot) */
  trailingIcon?: React.ReactNode;
}

/**
 * Combobox.Item - A selectable item in the list.
 *
 * Use with ItemIndicator and ItemText for proper layout:
 * ```tsx
 * <Combobox.Item value="apple">
 *   <Combobox.ItemIndicator />
 *   <Combobox.ItemText>Apple</Combobox.ItemText>
 * </Combobox.Item>
 * ```
 *
 * With icons:
 * ```tsx
 * <Combobox.Item value="apple" trailingIcon={<CentralIcon name="IconGlobe2" size={16} />}>
 *   <Combobox.ItemIndicator />
 *   <Combobox.ItemText>Apple</Combobox.ItemText>
 * </Combobox.Item>
 * ```
 */
export const Item = React.forwardRef<HTMLDivElement, ItemProps>(function Item(
  { className, leadingIcon, trailingIcon, children, ...props },
  ref,
) {
  const hasIcons = leadingIcon || trailingIcon;
  return (
    <BaseCombobox.Item
      ref={ref}
      className={clsx(styles.item, hasIcons && styles.itemWithIcons, className)}
      {...props}
    >
      {leadingIcon && <span className={styles.itemLeading}>{leadingIcon}</span>}
      {children}
      {trailingIcon && (
        <span className={styles.itemTrailing}>{trailingIcon}</span>
      )}
    </BaseCombobox.Item>
  );
});

export interface ItemTextProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ItemText = React.forwardRef<HTMLDivElement, ItemTextProps>(
  function ItemText({ className, ...props }, ref) {
    return (
      <div ref={ref} className={clsx(styles.itemText, className)} {...props} />
    );
  },
);

export interface ItemIndicatorProps extends BaseCombobox.ItemIndicator.Props {}

/**
 * Combobox.ItemIndicator - Shows selection state for single-select.
 *
 * Renders a 6px dot when the item is selected.
 * For multi-select, use ItemCheckbox instead.
 */
export const ItemIndicator = React.forwardRef<
  HTMLSpanElement,
  ItemIndicatorProps
>(function ItemIndicator(
  { className, children, keepMounted = true, style, ...props },
  ref,
) {
  return (
    <BaseCombobox.ItemIndicator
      ref={ref}
      className={clsx(styles.itemIndicator, className)}
      keepMounted={keepMounted}
      style={(state) => ({
        visibility: state.selected ? "visible" : "hidden",
        ...(typeof style === "function" ? style(state) : style),
      })}
      {...props}
    >
      {children ?? <span className={styles.itemIndicatorDot} />}
    </BaseCombobox.ItemIndicator>
  );
});

export interface ItemCheckboxProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Whether the checkbox is checked.
   * If not provided, inherits from parent Item's selected state.
   */
  checked?: boolean;
}

/**
 * Combobox.ItemCheckbox - Checkbox indicator for multi-select.
 *
 * Use this instead of ItemIndicator for multi-select comboboxes.
 * Place BEFORE ItemText to match Figma spec.
 *
 * @example
 * ```tsx
 * <Combobox.Item value="apple">
 *   <Combobox.ItemCheckbox />
 *   <Combobox.ItemText>Apple</Combobox.ItemText>
 * </Combobox.Item>
 * ```
 */
export const ItemCheckbox = React.forwardRef<
  HTMLSpanElement,
  ItemCheckboxProps
>(function ItemCheckbox({ className, children, ...props }, ref) {
  return (
    <BaseCombobox.ItemIndicator
      ref={ref}
      className={clsx(styles.itemCheckbox, className)}
      keepMounted
      {...props}
      render={(renderProps, state) => {
        // If children provided, use them (slot pattern)
        if (children) {
          return <span {...renderProps}>{children}</span>;
        }
        // Otherwise use CheckboxIndicator from design system
        return (
          <span {...renderProps}>
            <CheckboxIndicator checked={state.selected} />
          </span>
        );
      }}
    />
  );
});

export interface GroupProps extends BaseCombobox.Group.Props {}

export const Group = React.forwardRef<HTMLDivElement, GroupProps>(
  function Group({ className, ...props }, ref) {
    return (
      <BaseCombobox.Group
        ref={ref}
        className={clsx(styles.group, className)}
        {...props}
      />
    );
  },
);

export interface GroupLabelProps extends BaseCombobox.GroupLabel.Props {}

export const GroupLabel = React.forwardRef<HTMLDivElement, GroupLabelProps>(
  function GroupLabel({ className, ...props }, ref) {
    return (
      <BaseCombobox.GroupLabel
        ref={ref}
        className={clsx(styles.groupLabel, className)}
        {...props}
      />
    );
  },
);

// Separator - visual divider between groups/sections
export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        role="separator"
        className={clsx(styles.separator, className)}
        {...props}
      />
    );
  },
);

export interface EmptyProps extends BaseCombobox.Empty.Props {}

export const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  function Empty({ className, children, ...props }, ref) {
    return (
      <BaseCombobox.Empty
        ref={ref}
        className={clsx(styles.empty, className)}
        {...props}
      >
        {children ?? "No results found."}
      </BaseCombobox.Empty>
    );
  },
);

export interface ValueProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /**
   * Render function that receives selected value(s) and returns React nodes.
   * For multi-select, receives an array of values.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- render prop accepts any value type the consumer configures on Root
  children?: React.ReactNode | ((selectedValue: any) => React.ReactNode);
}

/**
 * Combobox.Value - Displays or renders selected value(s).
 *
 * For single select: displays the selected value text automatically
 * For multi-select with chips: use children as a render function
 *
 * Note: BaseCombobox.Value doesn't render its own element, so this wrapper
 * provides a span for styling and ref forwarding.
 *
 * @example Single select (displays value text)
 * ```tsx
 * <Combobox.Value />
 * ```
 *
 * @example Multi-select with chips
 * ```tsx
 * <Combobox.Chips>
 *   <Combobox.Value>
 *     {(values) => values?.map((v) => <Combobox.Chip key={v}>...</Combobox.Chip>)}
 *   </Combobox.Value>
 * </Combobox.Chips>
 * ```
 */
export const Value = React.forwardRef<HTMLSpanElement, ValueProps>(
  function Value({ className, children, ...props }, ref) {
    // When children are provided (multi-select render function), use display:contents
    // so chips become direct flex items of the parent InputWrapper
    const hasChildren = Boolean(children);
    return (
      <span
        ref={ref}
        className={clsx(
          hasChildren ? styles.valueWithChildren : styles.value,
          className,
        )}
        {...props}
      >
        <BaseCombobox.Value>{children}</BaseCombobox.Value>
      </span>
    );
  },
);

export interface ChipsProps extends BaseCombobox.Chips.Props {}

/**
 * Combobox.Chips - Container for selected value chips in multi-select.
 *
 * Place inside InputWrapper, before the Input element.
 * Use with Combobox.Value to access selected values.
 *
 * Note: Chips is a container only — it does NOT accept a render function.
 * Use Combobox.Value inside to iterate over selected values.
 *
 * @example
 * ```tsx
 * <Combobox.InputWrapper>
 *   <Combobox.Chips>
 *     <Combobox.Value>
 *       {(values) =>
 *         values?.map((value) => (
 *           <Combobox.Chip key={value} aria-label={value}>
 *             {value}
 *             <Combobox.ChipRemove />
 *           </Combobox.Chip>
 *         ))
 *       }
 *     </Combobox.Value>
 *   </Combobox.Chips>
 *   <Combobox.Input placeholder="Select items..." />
 * </Combobox.InputWrapper>
 * ```
 */
export const Chips = React.forwardRef<HTMLDivElement, ChipsProps>(
  function Chips({ className, ...props }, ref) {
    return (
      <BaseCombobox.Chips
        ref={ref}
        className={clsx(styles.chips, className)}
        {...props}
      />
    );
  },
);

export interface ChipProps extends BaseCombobox.Chip.Props {}

/**
 * Combobox.Chip - Individual chip representing a selected value.
 *
 * Uses the design system's Chip component styling (24px height, sm size).
 * Follow the simple Base UI pattern: content + ChipRemove as children.
 *
 * @example
 * ```tsx
 * <Combobox.Chip aria-label={value}>
 *   {value}
 *   <Combobox.ChipRemove />
 * </Combobox.Chip>
 * ```
 */
export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(function Chip(
  { className, children, ...props },
  ref,
) {
  // Separate ChipRemove from label content
  const childArray = React.Children.toArray(children);
  const chipRemove = childArray.filter(
    (child) => React.isValidElement(child) && child.type === ChipRemove,
  );
  const labelContent = childArray.filter(
    (child) => !React.isValidElement(child) || child.type !== ChipRemove,
  );

  return (
    <BaseCombobox.Chip
      ref={ref}
      className={clsx(chipStyles.root, chipStyles.sm, className)}
      {...props}
    >
      <span className={chipStyles.label}>{labelContent}</span>
      {chipRemove}
    </BaseCombobox.Chip>
  );
});

export interface ChipRemoveProps extends BaseCombobox.ChipRemove.Props {}

/**
 * Combobox.ChipRemove - Button to remove a chip.
 *
 * Uses the design system's Chip dismiss styling and icon.
 */
export const ChipRemove = React.forwardRef<HTMLButtonElement, ChipRemoveProps>(
  function ChipRemove({ className, children, ...props }, ref) {
    return (
      <BaseCombobox.ChipRemove
        ref={ref}
        className={clsx(chipStyles.dismiss, className)}
        {...props}
      >
        {children ?? <CentralIcon name="IconCrossSmall" size={10} />}
      </BaseCombobox.ChipRemove>
    );
  },
);

/**
 * Combobox.useFilter - Hook that provides filter functions for combobox items.
 *
 * Returns an object with `contains`, `startsWith`, and `endsWith` methods
 * that can be passed to the `filter` prop of Combobox.Root.
 *
 * @example
 * ```tsx
 * function MyCombobox() {
 *   const filter = Combobox.useFilter();
 *
 *   return (
 *     <Combobox.Root items={items} filter={filter.contains}>
 *       ...
 *     </Combobox.Root>
 *   );
 * }
 * ```
 */
export const useFilter = BaseCombobox.useFilter;

/**
 * Returns the internally filtered items from a Combobox.Root.
 * Must be called within a Combobox.Root context.
 *
 * Useful when you need access to the current filtered item list
 * for custom rendering logic (e.g., empty states, counts).
 */
export const useFilteredItems = BaseCombobox.useFilteredItems;

// Legacy exports for backwards compatibility
/** @deprecated Use InputWrapper instead */
export const Control = InputWrapper;
/** @deprecated Use BaseCombobox.Icon directly or just use Trigger with default icon */
export const Icon = BaseCombobox.Icon;
