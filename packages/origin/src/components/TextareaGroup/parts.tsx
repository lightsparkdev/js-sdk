"use client";

import * as React from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import clsx from "clsx";
import styles from "./TextareaGroup.module.scss";

// Context to share disabled/invalid state across parts
interface TextareaGroupContextValue {
  disabled?: boolean;
  invalid?: boolean;
}

const TextareaGroupContext = React.createContext<
  TextareaGroupContextValue | undefined
>(undefined);
TextareaGroupContext.displayName = "TextareaGroupContext";

function useTextareaGroupContext() {
  const context = React.useContext(TextareaGroupContext);
  if (context === undefined) {
    throw new Error(
      "TextareaGroup parts must be used within <TextareaGroup.Root>.",
    );
  }
  return context;
}

// Root - vertical container for the entire textarea group
export interface RootProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  invalid?: boolean;
  /** Max height of the entire group. Textarea scrolls when exceeded. */
  maxHeight?: number | string;
}

export const Root = React.forwardRef<HTMLDivElement, RootProps>(function Root(
  {
    className,
    disabled = false,
    invalid = false,
    maxHeight,
    style,
    children,
    ...props
  },
  ref,
) {
  const contextValue = React.useMemo(
    () => ({ disabled, invalid }),
    [disabled, invalid],
  );

  const mergedStyle =
    maxHeight != null && maxHeight !== ""
      ? ({
          ...style,
          "--_textarea-group-max-height":
            typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
        } as React.CSSProperties)
      : style;

  return (
    <TextareaGroupContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={clsx(styles.root, className)}
        data-textarea-group=""
        data-disabled={disabled ? "" : undefined}
        data-invalid={invalid ? "" : undefined}
        style={mergedStyle}
        {...props}
      >
        {children}
      </div>
    </TextareaGroupContext.Provider>
  );
});

if (process.env.NODE_ENV !== "production") {
  Root.displayName = "TextareaGroup";
}

// Header - horizontal wrapping area for chips/tags
export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  function Header({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(styles.header, className)}
        data-textarea-group-header=""
        {...props}
      />
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Header.displayName = "TextareaGroup.Header";
}

// Textarea - borderless textarea that reads state from Root context
export interface TextareaProps extends Omit<BaseInput.Props, "size"> {
  rows?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, disabled: textareaDisabled, ...props }, ref) {
    const { disabled: rootDisabled, invalid } = useTextareaGroupContext();
    const isDisabled = textareaDisabled ?? rootDisabled;

    return (
      <BaseInput
        // Cast needed: BaseInput types expect HTMLInputElement, but render={<textarea />}
        // swaps the rendered element at runtime.
        ref={ref as unknown as React.Ref<HTMLInputElement>}
        render={<textarea />}
        className={clsx(styles.textarea, className)}
        disabled={isDisabled}
        aria-invalid={invalid || undefined}
        data-textarea-group-textarea=""
        // Cast: props include textarea-specific attrs not in BaseInput's input-typed interface
        {...(props as Omit<BaseInput.Props, "className">)}
      />
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Textarea.displayName = "TextareaGroup.Textarea";
}

// Footer - toolbar area with space-between layout
export interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Footer = React.forwardRef<HTMLDivElement, FooterProps>(
  function Footer({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(styles.footer, className)}
        data-textarea-group-footer=""
        {...props}
      />
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Footer.displayName = "TextareaGroup.Footer";
}
