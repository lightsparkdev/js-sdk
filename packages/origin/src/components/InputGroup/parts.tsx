"use client";

import * as React from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import { Button as BaseButton } from "@base-ui/react/button";
import clsx from "clsx";
import { CentralIcon } from "../Icon";
import styles from "./InputGroup.module.scss";

interface InputGroupContextValue {
  disabled?: boolean;
  invalid?: boolean;
}

const InputGroupContext = React.createContext<
  InputGroupContextValue | undefined
>(undefined);
InputGroupContext.displayName = "InputGroupContext";

function useInputGroupContext() {
  const context = React.useContext(InputGroupContext);
  if (context === undefined) {
    throw new Error("InputGroup parts must be used within <InputGroup.Root>.");
  }
  return context;
}

export interface RootProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  invalid?: boolean;
}

export const Root = React.forwardRef<HTMLDivElement, RootProps>(function Root(
  { className, disabled = false, invalid = false, children, ...props },
  ref,
) {
  const contextValue = React.useMemo(
    () => ({ disabled, invalid }),
    [disabled, invalid],
  );

  return (
    <InputGroupContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={clsx(styles.root, className)}
        data-input-group=""
        data-disabled={disabled ? "" : undefined}
        data-invalid={invalid ? "" : undefined}
        {...props}
      >
        {children}
      </div>
    </InputGroupContext.Provider>
  );
});

if (process.env.NODE_ENV !== "production") {
  Root.displayName = "InputGroup";
}

// aria-hidden="true" by default for decorative addons (icons, separators).
// Override with aria-hidden={undefined} for meaningful text (e.g. currency codes).
export interface AddonProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const Addon = React.forwardRef<HTMLSpanElement, AddonProps>(
  function Addon(
    { className, "aria-hidden": ariaHidden = "true", onClick, ...props },
    ref,
  ) {
    const { disabled } = useInputGroupContext();

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        onClick?.(e);
        if (disabled || (e.target as HTMLElement).closest("button")) return;
        const input = e.currentTarget.parentElement?.querySelector("input");
        input?.focus();
      },
      [onClick, disabled],
    );

    return (
      <span
        ref={ref}
        className={clsx(styles.addon, className)}
        data-input-group-addon=""
        aria-hidden={ariaHidden}
        onClick={handleClick}
        {...props}
      />
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Addon.displayName = "InputGroup.Addon";
}

// aria-hidden auto-detected: skipped when cap wraps interactive children (buttons).
// Override with aria-hidden={undefined} or aria-hidden="true" to force.
export interface CapProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Cap = React.forwardRef<HTMLDivElement, CapProps>(function Cap(
  { className, "aria-hidden": ariaHidden, onClick, children, ...props },
  ref,
) {
  const hasInteractiveContent = React.Children.toArray(children).some(
    (child) =>
      React.isValidElement(child) &&
      (child.type === Button ||
        (child.props as Record<string, unknown>)?.role === "button"),
  );
  const resolvedAriaHidden =
    ariaHidden !== undefined
      ? ariaHidden
      : hasInteractiveContent
      ? undefined
      : "true";
  const { disabled } = useInputGroupContext();

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(e);
      if (disabled || (e.target as HTMLElement).closest("button")) return;
      const input = e.currentTarget.parentElement?.querySelector("input");
      input?.focus();
    },
    [onClick, disabled],
  );

  return (
    <div
      ref={ref}
      className={clsx(styles.cap, className)}
      data-input-group-cap=""
      aria-hidden={resolvedAriaHidden}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
});

if (process.env.NODE_ENV !== "production") {
  Cap.displayName = "InputGroup.Cap";
}

export interface InputProps extends Omit<BaseInput.Props, "size"> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, disabled: inputDisabled, ...props }, ref) {
    const { disabled: rootDisabled, invalid } = useInputGroupContext();
    const isDisabled = inputDisabled ?? rootDisabled;

    return (
      <BaseInput
        ref={ref}
        className={clsx(styles.input, className)}
        disabled={isDisabled}
        aria-invalid={invalid || undefined}
        data-input-group-input=""
        {...props}
      />
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Input.displayName = "InputGroup.Input";
}

// Extends native button props, not BaseButton.Props, to restrict API surface.
export interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: "ghost" | "outline";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "ghost", disabled: buttonDisabled, ...props },
    ref,
  ) {
    const { disabled: rootDisabled } = useInputGroupContext();
    const isDisabled = buttonDisabled ?? rootDisabled;

    return (
      <BaseButton
        ref={ref}
        className={clsx(
          styles.button,
          variant === "outline" && styles.buttonOutline,
          className,
        )}
        disabled={isDisabled}
        data-input-group-button=""
        data-variant={variant}
        {...props}
      />
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Button.displayName = "InputGroup.Button";
}

export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<"button"> {
  variant?: "ghost" | "outline";
  invalid?: boolean;
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerProps
>(function SelectTrigger(
  {
    className,
    variant = "ghost",
    invalid: triggerInvalid,
    disabled: triggerDisabled,
    children,
    ...props
  },
  ref,
) {
  const { disabled: rootDisabled, invalid: rootInvalid } =
    useInputGroupContext();
  const isDisabled = triggerDisabled ?? rootDisabled;
  const isInvalid = triggerInvalid ?? rootInvalid;

  return (
    <BaseButton
      ref={ref}
      className={clsx(
        styles.selectTrigger,
        variant === "outline" && styles.selectTriggerOutline,
        className,
      )}
      disabled={isDisabled}
      data-input-group-select-trigger=""
      data-variant={variant}
      data-invalid={isInvalid ? "" : undefined}
      {...props}
    >
      <span className={styles.selectTriggerLabel}>{children}</span>
      <span className={styles.selectTriggerIcon}>
        <CentralIcon name="IconChevronDownSmall" size={16} />
      </span>
    </BaseButton>
  );
});

if (process.env.NODE_ENV !== "production") {
  SelectTrigger.displayName = "InputGroup.SelectTrigger";
}

export interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const Text = React.forwardRef<HTMLSpanElement, TextProps>(function Text(
  { className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={clsx(styles.text, className)}
      data-input-group-text=""
      {...props}
    />
  );
});

if (process.env.NODE_ENV !== "production") {
  Text.displayName = "InputGroup.Text";
}
