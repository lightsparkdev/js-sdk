"use client";

import * as React from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { CentralIcon } from "../Icon";
import { CheckboxIndicator } from "../Checkbox";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import clsx from "clsx";
import styles from "./Combobox.module.scss";
import chipStyles from "../Chip/Chip.module.scss";

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
  ...props
}: RootProps<Value, Multiple>) {
  const trackedChange = useTrackedCallback(
    analyticsName,
    "Combobox",
    "change",
    onValueChange,
    (value: unknown) => ({ value }),
  );

  return (
    <BaseCombobox.Root
      autoHighlight={autoHighlight}
      onValueChange={trackedChange}
      {...props}
    />
  );
}

export interface InputWrapperProps extends BaseCombobox.InputGroup.Props {}

/**
 * Combobox.InputWrapper - Container for Input + ActionButtons.
 *
 * Wraps `BaseCombobox.InputGroup`, which exposes `data-disabled`,
 * `data-readonly`, `data-popup-open`, and (under `Field.Root`)
 * `data-focused` / `data-invalid` for state-driven styling. The InputGroup
 * also self-registers as the Positioner anchor, so popup width matches
 * the wrapper without explicit wiring.
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
  function InputWrapper({ className, ...props }, ref) {
    return (
      <BaseCombobox.InputGroup
        ref={ref}
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
 * Base UI auto-resolves the anchor to `Combobox.InputWrapper`'s
 * `BaseCombobox.InputGroup` element (via the combobox store), so popup
 * width matches the wrapper without explicit `anchor` wiring.
 */
export const Positioner = React.forwardRef<HTMLDivElement, PositionerProps>(
  function Positioner({ className, sideOffset = 4, ...props }, ref) {
    return (
      <BaseCombobox.Positioner
        ref={ref}
        className={clsx(styles.positioner, className)}
        sideOffset={sideOffset}
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
      render={(renderProps, state) => (
        <span {...renderProps}>
          {children ?? <CheckboxIndicator checked={state.selected} />}
        </span>
      )}
      {...props}
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

export interface SeparatorProps extends BaseCombobox.Separator.Props {}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator({ className, ...props }, ref) {
    return (
      <BaseCombobox.Separator
        ref={ref}
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

export type ValueProps = BaseCombobox.Value.Props;

/**
 * Combobox.Value - Displays or renders selected value(s).
 *
 * Pass a render function for multi-select chips. The render function's
 * output becomes a direct child of the parent (typically `Combobox.Chips`),
 * matching Base UI's documented pattern.
 *
 * @example Single select
 * ```tsx
 * <Combobox.Value />
 * ```
 *
 * @example Multi-select with chips
 * ```tsx
 * <Combobox.Chips>
 *   <Combobox.Value>
 *     {(values) => (
 *       <>
 *         {values.map((v) => (
 *           <Combobox.Chip key={v}>
 *             {v}
 *             <Combobox.ChipRemove aria-label={v} />
 *           </Combobox.Chip>
 *         ))}
 *         <Combobox.Input placeholder="Add fruits" />
 *       </>
 *     )}
 *   </Combobox.Value>
 * </Combobox.Chips>
 * ```
 */
export const Value = BaseCombobox.Value;

export interface ChipsProps extends BaseCombobox.Chips.Props {}

/**
 * Combobox.Chips - Container for selected value chips in multi-select.
 *
 * Place inside `Combobox.InputWrapper`. Render `Combobox.Input` inside
 * `Combobox.Value`'s render function (not as a sibling of `Combobox.Chips`),
 * so chips and input share one wrapping flex row.
 *
 * Multi-select has no chevron / `ActionButtons`, so use a persistent
 * action-oriented placeholder ("Add fruits") -- it's the only affordance
 * for adding more values.
 *
 * Note: Chips is a container only — use `Combobox.Value` inside to render
 * chips.
 *
 * @example
 * ```tsx
 * <Combobox.InputWrapper>
 *   <Combobox.Chips>
 *     <Combobox.Value>
 *       {(values) => (
 *         <>
 *           {values?.map((value) => (
 *             <Combobox.Chip key={value}>
 *               {value}
 *               <Combobox.ChipRemove aria-label={value} />
 *             </Combobox.Chip>
 *           ))}
 *           <Combobox.Input placeholder="Add fruits" />
 *         </>
 *       )}
 *     </Combobox.Value>
 *   </Combobox.Chips>
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
 * <Combobox.Chip>
 *   {value}
 *   <Combobox.ChipRemove aria-label={value} />
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
