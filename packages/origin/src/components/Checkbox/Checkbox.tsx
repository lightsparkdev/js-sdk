"use client";

import * as React from "react";
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Field } from "@base-ui/react/field";
import clsx from "clsx";
import { CentralIcon } from "../Icon";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import styles from "./Checkbox.module.scss";

interface CheckboxGroupContextValue {
  variant: "default" | "card";
}

const CheckboxGroupContext = React.createContext<
  CheckboxGroupContextValue | undefined
>(undefined);

if (process.env.NODE_ENV !== "production") {
  CheckboxGroupContext.displayName = "CheckboxGroupContext";
}

/**
 * Hook to get checkbox group context. Returns undefined if not inside a group,
 * allowing standalone checkbox usage with default values.
 */
function useCheckboxGroupContext() {
  return React.useContext(CheckboxGroupContext);
}

export interface CheckboxGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[], eventDetails: { reason: "none" }) => void;
  allValues?: string[];
  disabled?: boolean;
  variant?: "default" | "card";
  analyticsName?: string;
}

export const CheckboxGroup = React.forwardRef<
  HTMLDivElement,
  CheckboxGroupProps
>(function CheckboxGroup(props, ref) {
  const {
    value,
    defaultValue,
    onValueChange,
    allValues,
    disabled = false,
    variant = "default",
    analyticsName,
    className,
    children,
    style,
    ...other
  } = props;

  const trackedChange = useTrackedCallback(
    analyticsName,
    "Checkbox.Group",
    "change",
    onValueChange,
    (val: string[]) => ({ value: val }),
  );

  const contextValue = React.useMemo(() => ({ variant }), [variant]);

  return (
    <CheckboxGroupContext.Provider value={contextValue}>
      <BaseCheckboxGroup
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onValueChange={trackedChange}
        allValues={allValues}
        disabled={disabled}
        className={clsx(styles.group, className)}
        style={style}
        {...other}
      >
        {children}
      </BaseCheckboxGroup>
    </CheckboxGroupContext.Provider>
  );
});

export interface CheckboxItemProps extends React.HTMLAttributes<HTMLElement> {
  value?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (
    checked: boolean,
    eventDetails: { reason: "none" },
  ) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  parent?: boolean;
  label?: string;
  description?: string;
  checkedIcon?: React.ReactNode;
  indeterminateIcon?: React.ReactNode;
  /** Visual variant - can be overridden when not inside a Group */
  variant?: "default" | "card";
}

const defaultCheckedIcon = <CentralIcon name="IconCheckmark2Small" size={12} />;
const defaultIndeterminateIcon = (
  <CentralIcon name="IconMinusSmall" size={12} />
);

/**
 * A single checkbox item. Can be used standalone or within a Checkbox.Group.
 * When inside a Group, it inherits the group's variant unless explicitly overridden.
 */
export const CheckboxItem = React.forwardRef<
  HTMLSpanElement,
  CheckboxItemProps
>(function CheckboxItem(props, ref) {
  const {
    value,
    checked,
    defaultChecked,
    onCheckedChange,
    indeterminate = false,
    disabled = false,
    readOnly = false,
    required = false,
    name,
    parent = false,
    label,
    description,
    checkedIcon = defaultCheckedIcon,
    indeterminateIcon = defaultIndeterminateIcon,
    variant: variantProp,
    className,
    children,
    ...other
  } = props;
  const context = useCheckboxGroupContext();
  // Use prop variant, fall back to context variant, default to 'default'
  const variant = variantProp ?? context?.variant ?? "default";

  return (
    <BaseCheckbox.Root
      ref={ref}
      value={value}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      indeterminate={indeterminate}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      name={name}
      parent={parent}
      className={clsx(
        styles.item,
        variant === "card" && styles.card,
        className,
      )}
      {...other}
    >
      <span className={styles.checkbox}>
        <BaseCheckbox.Indicator className={styles.indicator} keepMounted>
          <span className={styles.checkIcon}>{checkedIcon}</span>
          <span className={styles.indeterminateIcon}>{indeterminateIcon}</span>
        </BaseCheckbox.Indicator>
      </span>
      {(label || description || children) && (
        <span className={styles.content}>
          {children || (
            <>
              {label && <span className={styles.label}>{label}</span>}
              {description && (
                <span className={styles.description}>{description}</span>
              )}
            </>
          )}
        </span>
      )}
    </BaseCheckbox.Root>
  );
});

export const CheckboxField = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Field.Root> & { className?: string }
>(function CheckboxField(props, ref) {
  const { className, ...other } = props;
  return (
    <Field.Root
      ref={ref}
      className={clsx(styles.field, className)}
      {...other}
    />
  );
});

export const CheckboxLegend = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<typeof Field.Label> & { className?: string }
>(function CheckboxLegend(props, ref) {
  const { className, ...other } = props;
  return (
    <Field.Label
      ref={ref}
      className={clsx(styles.legend, className)}
      {...other}
    />
  );
});

export const CheckboxDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof Field.Description> & {
    className?: string;
  }
>(function CheckboxDescription(props, ref) {
  const { className, ...other } = props;
  return (
    <Field.Description
      ref={ref}
      className={clsx(styles.helpText, className)}
      {...other}
    />
  );
});

export const CheckboxError = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Field.Error> & { className?: string }
>(function CheckboxError(props, ref) {
  const { className, ...other } = props;
  return (
    <Field.Error
      ref={ref}
      className={clsx(styles.errorText, className)}
      {...other}
    />
  );
});

/**
 * Standalone visual checkbox indicator.
 *
 * This is a pure visual component for displaying a checkbox indicator
 * without Base UI's form behavior. Use this when you need just the
 * checkbox visual (16px box with checkmark) in custom contexts.
 *
 * Note: This intentionally does NOT wrap Base UI's Checkbox.Indicator
 * because it's designed for use cases where you control the checked
 * state externally (e.g., Combobox multi-select, custom list items).
 *
 * @example
 * ```tsx
 * // In a Combobox multi-select item:
 * <Combobox.ItemCheckbox>
 *   <Checkbox.Indicator checked={selected} />
 * </Combobox.ItemCheckbox>
 *
 * // In a custom list:
 * <li onClick={toggle}>
 *   <Checkbox.Indicator checked={isSelected} />
 *   {item.name}
 * </li>
 * ```
 */
export interface CheckboxIndicatorProps {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  checkedIcon?: React.ReactNode;
  indeterminateIcon?: React.ReactNode;
  className?: string;
}

export const CheckboxIndicator = React.forwardRef<
  HTMLSpanElement,
  CheckboxIndicatorProps
>(function CheckboxIndicator(props, ref) {
  const {
    checked = false,
    indeterminate = false,
    disabled = false,
    checkedIcon = defaultCheckedIcon,
    indeterminateIcon = defaultIndeterminateIcon,
    className,
  } = props;

  return (
    <span
      ref={ref}
      className={clsx(styles.checkbox, className)}
      data-checked={checked || undefined}
      data-indeterminate={indeterminate || undefined}
      data-disabled={disabled || undefined}
    >
      <span className={styles.indicator}>
        <span
          className={styles.checkIcon}
          data-visible={(checked && !indeterminate) || undefined}
        >
          {checkedIcon}
        </span>
        <span
          className={styles.indeterminateIcon}
          data-visible={indeterminate || undefined}
        >
          {indeterminateIcon}
        </span>
      </span>
    </span>
  );
});

if (process.env.NODE_ENV !== "production") {
  CheckboxGroup.displayName = "CheckboxGroup";
  CheckboxItem.displayName = "CheckboxItem";
  CheckboxField.displayName = "CheckboxField";
  CheckboxLegend.displayName = "CheckboxLegend";
  CheckboxDescription.displayName = "CheckboxDescription";
  CheckboxError.displayName = "CheckboxError";
  CheckboxIndicator.displayName = "CheckboxIndicator";
}

export const Checkbox = {
  Group: CheckboxGroup,
  Item: CheckboxItem,
  Field: CheckboxField,
  Legend: CheckboxLegend,
  Description: CheckboxDescription,
  Error: CheckboxError,
  Indicator: CheckboxIndicator,
};

export default Checkbox;
