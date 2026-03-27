"use client";

import * as React from "react";
import { Field as BaseField } from "@base-ui/react/field";
import clsx from "clsx";
import styles from "./Field.module.scss";

export interface FieldRootProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof BaseField.Root>,
    "render"
  > {}

export const FieldRoot = React.forwardRef<HTMLDivElement, FieldRootProps>(
  function FieldRoot(props, ref) {
    const { className, children, ...other } = props;

    return (
      <BaseField.Root
        ref={ref}
        className={clsx(styles.root, className)}
        {...other}
      >
        {children}
      </BaseField.Root>
    );
  },
);

export interface FieldLabelProps
  extends React.ComponentPropsWithoutRef<typeof BaseField.Label> {}

export const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  function FieldLabel(props, ref) {
    const { className, ...other } = props;

    return (
      <BaseField.Label
        ref={ref}
        className={clsx(styles.label, className)}
        {...other}
      />
    );
  },
);

export interface FieldDescriptionProps
  extends React.ComponentPropsWithoutRef<typeof BaseField.Description> {}

export const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  FieldDescriptionProps
>(function FieldDescription(props, ref) {
  const { className, ...other } = props;

  return (
    <BaseField.Description
      ref={ref}
      className={clsx(styles.description, className)}
      {...other}
    />
  );
});

export interface FieldErrorProps
  extends React.ComponentPropsWithoutRef<typeof BaseField.Error> {
  /**
   * Determines when to show the error.
   * Set to `true` for external validity control via Field.Root's `invalid` prop.
   * @default true
   */
  match?: boolean | keyof ValidityState;
}

export const FieldError = React.forwardRef<HTMLDivElement, FieldErrorProps>(
  function FieldError(props, ref) {
    const { className, match = true, ...other } = props;

    return (
      <BaseField.Error
        ref={ref}
        match={match}
        className={clsx(styles.error, className)}
        {...other}
      />
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  FieldRoot.displayName = "FieldRoot";
  FieldLabel.displayName = "FieldLabel";
  FieldDescription.displayName = "FieldDescription";
  FieldError.displayName = "FieldError";
}

export const Field = {
  Root: FieldRoot,
  Label: FieldLabel,
  Description: FieldDescription,
  Error: FieldError,
};

export default Field;
