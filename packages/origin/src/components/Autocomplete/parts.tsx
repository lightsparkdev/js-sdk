"use client";

import * as React from "react";
import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import clsx from "clsx";
import styles from "./Autocomplete.module.scss";

/**
 * Autocomplete.Root - Container for the autocomplete.
 *
 * Unlike Combobox, Autocomplete has no persistent selection state.
 * The input contains free-form text, and suggestions optionally autocomplete it.
 *
 * Note: autoHighlight defaults to true in Base UI.
 *
 * @example
 * ```tsx
 * <Autocomplete.Root items={items}>
 *   <Autocomplete.Input placeholder="Search..." />
 *   <Autocomplete.Portal>
 *     <Autocomplete.Positioner>
 *       <Autocomplete.Popup>
 *         <Autocomplete.Empty>No results.</Autocomplete.Empty>
 *         <Autocomplete.List>
 *           {(item) => (
 *             <Autocomplete.Item key={item.value} value={item}>
 *               {item.label}
 *             </Autocomplete.Item>
 *           )}
 *         </Autocomplete.List>
 *       </Autocomplete.Popup>
 *     </Autocomplete.Positioner>
 *   </Autocomplete.Portal>
 * </Autocomplete.Root>
 * ```
 */
export const Root = BaseAutocomplete.Root;

export interface InputProps extends BaseAutocomplete.Input.Props {}

/**
 * Autocomplete.Input - The text input element.
 *
 * Styled identically to the Input component.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, ...props }, ref) {
    return (
      <BaseAutocomplete.Input
        ref={ref}
        className={clsx(styles.input, className)}
        {...props}
      />
    );
  },
);

export interface PortalProps extends BaseAutocomplete.Portal.Props {}

export const Portal = BaseAutocomplete.Portal;

export interface PositionerProps extends BaseAutocomplete.Positioner.Props {}

/**
 * Autocomplete.Positioner - Handles popup positioning.
 */
export const Positioner = React.forwardRef<HTMLDivElement, PositionerProps>(
  function Positioner({ className, sideOffset = 4, ...props }, ref) {
    return (
      <BaseAutocomplete.Positioner
        ref={ref}
        className={clsx(styles.positioner, className)}
        sideOffset={sideOffset}
        {...props}
      />
    );
  },
);

export interface PopupProps extends BaseAutocomplete.Popup.Props {}

/**
 * Autocomplete.Popup - Container for the list.
 */
export const Popup = React.forwardRef<HTMLDivElement, PopupProps>(
  function Popup({ className, ...props }, ref) {
    return (
      <BaseAutocomplete.Popup
        ref={ref}
        className={clsx(styles.popup, className)}
        {...props}
      />
    );
  },
);

export interface ListProps extends BaseAutocomplete.List.Props {}

/**
 * Autocomplete.List - Container for items.
 *
 * Accepts a render function that receives each item.
 *
 * @example
 * ```tsx
 * <Autocomplete.List>
 *   {(item) => (
 *     <Autocomplete.Item key={item.value} value={item}>
 *       {item.label}
 *     </Autocomplete.Item>
 *   )}
 * </Autocomplete.List>
 * ```
 */
export const List = React.forwardRef<HTMLDivElement, ListProps>(function List(
  { className, ...props },
  ref,
) {
  return (
    <BaseAutocomplete.List
      ref={ref}
      className={clsx(styles.list, className)}
      {...props}
    />
  );
});

export interface ItemProps extends BaseAutocomplete.Item.Props {
  /** Icon to display at the start of the item (16x16px slot) */
  leadingIcon?: React.ReactNode;
}

/**
 * Autocomplete.Item - A suggestion item in the list.
 *
 * @example
 * ```tsx
 * <Autocomplete.Item value={item}>
 *   {item.label}
 * </Autocomplete.Item>
 * ```
 *
 * With leading icon:
 * ```tsx
 * <Autocomplete.Item value={item} leadingIcon={<Icon name="globe" />}>
 *   {item.label}
 * </Autocomplete.Item>
 * ```
 */
export const Item = React.forwardRef<HTMLDivElement, ItemProps>(function Item(
  { className, leadingIcon, children, ...props },
  ref,
) {
  return (
    <BaseAutocomplete.Item
      ref={ref}
      className={clsx(styles.item, className)}
      {...props}
    >
      {leadingIcon && <span className={styles.itemLeading}>{leadingIcon}</span>}
      {children}
    </BaseAutocomplete.Item>
  );
});

export interface GroupProps extends BaseAutocomplete.Group.Props {}

/**
 * Autocomplete.Group - Groups related items.
 */
export const Group = React.forwardRef<HTMLDivElement, GroupProps>(
  function Group({ className, ...props }, ref) {
    return (
      <BaseAutocomplete.Group
        ref={ref}
        className={clsx(styles.group, className)}
        {...props}
      />
    );
  },
);

export interface GroupLabelProps extends BaseAutocomplete.GroupLabel.Props {}

/**
 * Autocomplete.GroupLabel - Label for a group.
 */
export const GroupLabel = React.forwardRef<HTMLDivElement, GroupLabelProps>(
  function GroupLabel({ className, ...props }, ref) {
    return (
      <BaseAutocomplete.GroupLabel
        ref={ref}
        className={clsx(styles.groupLabel, className)}
        {...props}
      />
    );
  },
);

/**
 * Autocomplete.Collection - Renders items within a group.
 *
 * Use inside Group to iterate over group items.
 */
export const Collection = BaseAutocomplete.Collection;

export interface SeparatorProps extends BaseAutocomplete.Separator.Props {}

/**
 * Autocomplete.Separator - Visual divider between groups/sections.
 */
export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator({ className, ...props }, ref) {
    return (
      <BaseAutocomplete.Separator
        ref={ref}
        className={clsx(styles.separator, className)}
        {...props}
      />
    );
  },
);

export interface EmptyProps extends BaseAutocomplete.Empty.Props {}

/**
 * Autocomplete.Empty - Shown when no items match the query.
 */
export const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  function Empty({ className, children, ...props }, ref) {
    return (
      <BaseAutocomplete.Empty
        ref={ref}
        className={clsx(styles.empty, className)}
        {...props}
      >
        {children ?? "No results found."}
      </BaseAutocomplete.Empty>
    );
  },
);

export interface StatusProps extends BaseAutocomplete.Status.Props {}

/**
 * Autocomplete.Status - Displays status messages (e.g., loading state).
 *
 * Content changes are announced politely to screen readers.
 *
 * @example
 * ```tsx
 * <Autocomplete.Status>
 *   {isLoading ? 'Loading...' : null}
 * </Autocomplete.Status>
 * ```
 */
export const Status = React.forwardRef<HTMLDivElement, StatusProps>(
  function Status({ className, ...props }, ref) {
    return (
      <BaseAutocomplete.Status
        ref={ref}
        className={clsx(styles.status, className)}
        {...props}
      />
    );
  },
);

/**
 * Autocomplete.useFilter - Hook that provides filter functions.
 *
 * Returns `contains`, `startsWith`, and `endsWith` methods.
 *
 * @example
 * ```tsx
 * const filter = Autocomplete.useFilter();
 * <Autocomplete.Root items={items} filter={filter.contains}>
 * ```
 */
export const useFilter = BaseAutocomplete.useFilter;
