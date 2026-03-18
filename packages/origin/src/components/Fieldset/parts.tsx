"use client";

import * as React from "react";
import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import clsx from "clsx";
import styles from "./Fieldset.module.scss";

export interface FieldsetRootProps extends BaseFieldset.Root.Props {
  /** Layout direction for child fields. @default 'vertical' */
  orientation?: "horizontal" | "vertical";
}

export const FieldsetRoot = React.forwardRef<
  HTMLFieldSetElement,
  FieldsetRootProps
>(function FieldsetRoot(props, ref) {
  const { className, orientation = "vertical", children, ...other } = props;

  // Separate legend, error, and field children so we can
  // control layout and place the error after the fields.
  const legend: React.ReactNode[] = [];
  const errors: React.ReactNode[] = [];
  const fields: React.ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === FieldsetLegend) {
      legend.push(child);
    } else if (React.isValidElement(child) && child.type === FieldsetError) {
      errors.push(child);
    } else {
      fields.push(child);
    }
  });

  const hasError = errors.length > 0;

  const fieldsContent = (
    <div data-orientation={orientation} className={styles[orientation]}>
      {fields}
    </div>
  );

  return (
    <BaseFieldset.Root
      ref={ref}
      data-orientation={orientation}
      className={clsx(styles.root, className)}
      {...other}
    >
      {legend}
      {hasError ? (
        <div className={styles.body}>
          {fieldsContent}
          {errors}
        </div>
      ) : (
        fieldsContent
      )}
    </BaseFieldset.Root>
  );
});

export interface FieldsetLegendProps extends BaseFieldset.Legend.Props {
  /** Visually hides the legend while keeping it accessible to screen readers. */
  visuallyHidden?: boolean;
}

export const FieldsetLegend = React.forwardRef<
  HTMLDivElement,
  FieldsetLegendProps
>(function FieldsetLegend(props, ref) {
  const { className, visuallyHidden, ...other } = props;

  return (
    <BaseFieldset.Legend
      ref={ref}
      className={clsx(
        visuallyHidden ? styles.legendHidden : styles.legend,
        className,
      )}
      {...other}
    />
  );
});

export interface FieldsetErrorProps
  extends React.ComponentPropsWithoutRef<"div"> {}

export const FieldsetError = React.forwardRef<
  HTMLDivElement,
  FieldsetErrorProps
>(function FieldsetError(props, ref) {
  const { className, ...other } = props;

  return (
    <div
      ref={ref}
      role="alert"
      className={clsx(styles.error, className)}
      {...other}
    />
  );
});

if (process.env.NODE_ENV !== "production") {
  FieldsetRoot.displayName = "FieldsetRoot";
  FieldsetLegend.displayName = "FieldsetLegend";
  FieldsetError.displayName = "FieldsetError";
}

export const Fieldset = {
  Root: FieldsetRoot,
  Legend: FieldsetLegend,
  Error: FieldsetError,
};

export default Fieldset;
