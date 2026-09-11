"use client";

import * as React from "react";
import { OTPField as BaseOTPField } from "@base-ui/react/otp-field";
import clsx from "clsx";
import styles from "./OTPField.module.scss";

/**
 * Groups all OTP field parts and manages their state.
 * Renders a `<div>` element.
 *
 * Base UI handles value normalization, paste distribution, per-slot keyboard
 * navigation, and `autocomplete="one-time-code"` on the first slot natively.
 * Compose inside `Field.Root` with `Field.Label` / `Field.Error` for label
 * association and validity state.
 *
 * When no children are provided, the root renders `length` input slots
 * automatically. Pass children (`OTPField.Input` / `OTPField.Separator`)
 * for grouped layouts such as `123-456`.
 *
 * @example
 * ```tsx
 * <Field.Root name="verificationCode">
 *   <Field.Label>Verification code</Field.Label>
 *   <OTPField.Root onValueComplete={(code) => verify(code)} />
 *   <Field.Error>Enter the 6-digit code</Field.Error>
 * </Field.Root>
 * ```
 */
export interface RootProps extends Omit<BaseOTPField.Root.Props, "length"> {
  /**
   * The number of OTP input slots.
   * @default 6
   */
  length?: number;
  /**
   * Placeholder character shown in each empty auto-rendered slot.
   * Ignored when explicit children are provided; pass `placeholder` to
   * each `OTPField.Input` instead.
   */
  placeholder?: string;
}

export const Root = React.forwardRef<HTMLDivElement, RootProps>(
  function Root(props, ref) {
    const { className, length = 6, placeholder, children, ...other } = props;
    // `children ?? ...` misses `{false}` from conditional rendering, and
    // `React.Children.count(false)` returns 1 (booleans occupy child slots);
    // `toArray` strips booleans/null/undefined, so it's the correct guard.
    const hasExplicitChildren = React.Children.toArray(children).length > 0;
    const rootClassName: BaseOTPField.Root.Props["className"] =
      typeof className === "function"
        ? (state) => clsx(styles.root, className(state))
        : clsx(styles.root, className);

    return (
      <BaseOTPField.Root
        ref={ref}
        length={length}
        className={rootClassName}
        data-otp-field-root=""
        {...other}
      >
        {hasExplicitChildren
          ? children
          : Array.from({ length }, (_, index) => (
              <Input
                key={index}
                placeholder={placeholder}
                // The first slot is announced via the field label; Base UI
                // ignores aria-label on it and swaps aria-labelledby natively.
                aria-label={
                  index > 0 ? `Character ${index + 1} of ${length}` : undefined
                }
              />
            ))}
      </BaseOTPField.Root>
    );
  },
);

/**
 * An individual OTP character input.
 * Renders an `<input>` element.
 *
 * In manually-composed layouts (e.g. grouped with separators), pass
 * `aria-label` such as "Character N of M" to slots after the first so
 * assistive technology can announce which slot is focused. The first slot
 * is announced via the field label. Auto-rendered slots (a childless
 * `OTPField.Root`) get these labels automatically.
 */
export interface InputProps extends BaseOTPField.Input.Props {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(props, ref) {
    const { className, ...other } = props;
    const inputClassName: BaseOTPField.Input.Props["className"] =
      typeof className === "function"
        ? (state) => clsx(styles.input, className(state))
        : clsx(styles.input, className);

    return (
      <BaseOTPField.Input
        ref={ref}
        className={inputClassName}
        data-otp-field-input=""
        {...other}
      />
    );
  },
);

/**
 * A separator element accessible to screen readers.
 * Renders a `<div>` element styled as a short dash for grouped layouts
 * such as `123-456`.
 */
export interface SeparatorProps extends BaseOTPField.Separator.Props {}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator(props, ref) {
    const { className, ...other } = props;
    const separatorClassName: BaseOTPField.Separator.Props["className"] =
      typeof className === "function"
        ? (state) => clsx(styles.separator, className(state))
        : clsx(styles.separator, className);

    return (
      <BaseOTPField.Separator
        ref={ref}
        className={separatorClassName}
        {...other}
      />
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Root.displayName = "OTPFieldRoot";
  Input.displayName = "OTPFieldInput";
  Separator.displayName = "OTPFieldSeparator";
}
