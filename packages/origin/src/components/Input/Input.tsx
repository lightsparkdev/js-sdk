"use client";

import * as React from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import clsx from "clsx";
import { stripNonPrintable } from "../../lib/text";
import styles from "./Input.module.scss";

export interface InputProps extends Omit<BaseInput.Props, "size"> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(props, ref) {
    const { className, onValueChange, ...other } = props;

    return (
      <BaseInput
        ref={ref}
        className={clsx(styles.input, className)}
        {...other}
        onValueChange={
          onValueChange &&
          ((value, eventDetails) =>
            onValueChange(stripNonPrintable(value), eventDetails))
        }
      />
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Input.displayName = "Input";
}

export default Input;
