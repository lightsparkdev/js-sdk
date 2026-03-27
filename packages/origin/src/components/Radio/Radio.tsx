"use client";

import * as React from "react";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { Field } from "@base-ui/react/field";
import clsx from "clsx";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import styles from "./Radio.module.scss";

interface RadioGroupContextValue {
  variant: "default" | "card";
}

const RadioGroupContext = React.createContext<
  RadioGroupContextValue | undefined
>(undefined);

if (process.env.NODE_ENV !== "production") {
  RadioGroupContext.displayName = "RadioGroupContext";
}

function useRadioGroupContext() {
  const context = React.useContext(RadioGroupContext);
  if (context === undefined) {
    throw new Error("Radio.Item must be used within a Radio.Group");
  }
  return context;
}

export interface RadioGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  value?: unknown;
  defaultValue?: unknown;
  onValueChange?: (value: unknown) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  variant?: "default" | "card";
  analyticsName?: string;
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup(props, ref) {
    const {
      value,
      defaultValue,
      onValueChange,
      disabled = false,
      readOnly = false,
      required = false,
      name,
      variant = "default",
      analyticsName,
      className,
      children,
      style,
      ...other
    } = props;

    const trackedChange = useTrackedCallback(
      analyticsName,
      "Radio.Group",
      "change",
      onValueChange,
      (val: unknown) => ({ value: val }),
    );

    const contextValue = React.useMemo(() => ({ variant }), [variant]);

    return (
      <RadioGroupContext.Provider value={contextValue}>
        <BaseRadioGroup
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          onValueChange={trackedChange}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          name={name}
          className={clsx(styles.group, className)}
          style={style}
          {...other}
        >
          {children}
        </BaseRadioGroup>
      </RadioGroupContext.Provider>
    );
  },
);

export interface RadioItemProps {
  value: unknown;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export const RadioItem = React.forwardRef<HTMLSpanElement, RadioItemProps>(
  function RadioItem(props, ref) {
    const {
      value,
      disabled = false,
      label,
      description,
      className,
      children,
      ...other
    } = props;
    const { variant } = useRadioGroupContext();

    return (
      <BaseRadio.Root
        ref={ref}
        value={value}
        disabled={disabled}
        className={clsx(
          styles.item,
          variant === "card" && styles.card,
          className,
        )}
        {...other}
      >
        <span className={styles.radio}>
          <BaseRadio.Indicator className={styles.indicator} />
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
      </BaseRadio.Root>
    );
  },
);

export const RadioField = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Field.Root> & { className?: string }
>(function RadioField(props, ref) {
  const { className, ...other } = props;
  return (
    <Field.Root
      ref={ref}
      className={clsx(styles.field, className)}
      {...other}
    />
  );
});

export const RadioLegend = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<typeof Field.Label> & { className?: string }
>(function RadioLegend(props, ref) {
  const { className, ...other } = props;
  return (
    <Field.Label
      ref={ref}
      className={clsx(styles.legend, className)}
      {...other}
    />
  );
});

export const RadioDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof Field.Description> & {
    className?: string;
  }
>(function RadioDescription(props, ref) {
  const { className, ...other } = props;
  return (
    <Field.Description
      ref={ref}
      className={clsx(styles.helpText, className)}
      {...other}
    />
  );
});

export const RadioError = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Field.Error> & { className?: string }
>(function RadioError(props, ref) {
  const { className, ...other } = props;
  return (
    <Field.Error
      ref={ref}
      className={clsx(styles.errorText, className)}
      {...other}
    />
  );
});

if (process.env.NODE_ENV !== "production") {
  RadioGroup.displayName = "RadioGroup";
  RadioItem.displayName = "RadioItem";
  RadioField.displayName = "RadioField";
  RadioLegend.displayName = "RadioLegend";
  RadioDescription.displayName = "RadioDescription";
  RadioError.displayName = "RadioError";
}

export const Radio = {
  Group: RadioGroup,
  Item: RadioItem,
  Field: RadioField,
  Legend: RadioLegend,
  Description: RadioDescription,
  Error: RadioError,
};

export default Radio;
