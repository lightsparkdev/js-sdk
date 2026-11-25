"use client";

import * as React from "react";
import { useMergedRef } from "../Chart/useMergedRef";
import { useFieldDisabled } from "../Field/FieldContext";
import { CentralIcon } from "../Icon";
import { InputGroup, type InputGroupInputProps } from "../InputGroup";

export interface SecretInputProps extends Omit<
  InputGroupInputProps,
  "type" | "render" | "className" | "style" | "sanitizeValue"
> {
  /** Marks the whole group invalid; pair with Field.Root invalid for a11y. */
  invalid?: boolean;
  /** Applied to the group container, the visual box of the control. */
  className?: string;
  /** Applied to the group container, the visual box of the control. */
  style?: React.CSSProperties;
  /** Accessible label for the control that reveals the secret. */
  showLabel?: string;
  /** Accessible label for the control that hides the secret. */
  hideLabel?: string;
}

/**
 * Secret entry with a visibility toggle. The input stays mounted while its
 * type changes, which preserves its value and selection. Typed and pasted
 * values are not sanitized; NBSP, bidi, and zero-width characters stay as
 * entered.
 */
export const SecretInput = React.forwardRef<HTMLInputElement, SecretInputProps>(
  function SecretInput(
    {
      className,
      style,
      invalid = false,
      disabled = false,
      autoComplete = "off",
      showLabel = "Show secret",
      hideLabel = "Hide secret",
      ...props
    },
    ref,
  ) {
    const [visible, setVisible] = React.useState(false);
    const [nativeDisabled, setNativeDisabled] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const mergedRef = useMergedRef(ref, inputRef);
    const fieldDisabled = useFieldDisabled();
    const effectiveDisabled = fieldDisabled || disabled;
    const effectiveVisible = visible && !effectiveDisabled && !nativeDisabled;
    const inputProps = { ...props } as InputGroupInputProps;
    delete inputProps.render;
    delete inputProps.type;

    const remaskIfNativeDisabled = React.useCallback(() => {
      const input = inputRef.current;
      if (!input) {
        return;
      }
      const nextNativeDisabled = input.matches(":disabled");
      setNativeDisabled((wasDisabled) =>
        wasDisabled === nextNativeDisabled ? wasDisabled : nextNativeDisabled,
      );
      if (nextNativeDisabled) {
        // Close the gap before React can paint a revealed type="text" field
        // that the browser has already disabled.
        if (input.type === "text") {
          input.type = "password";
        }
        setVisible(false);
      }
    }, []);

    // Origin Field/Fieldset context remasks synchronously above. A native
    // fieldset[disabled] ancestor is only visible on the DOM after commit,
    // so remask in layout before paint. Deps would skip that check.
    React.useLayoutEffect(() => {
      remaskIfNativeDisabled();
    });

    // A memoized tree or an imperative fieldset.disabled write does not
    // rerender this component. Observe the input and ancestor fieldsets.
    React.useLayoutEffect(() => {
      const input = inputRef.current;
      if (!input) {
        return;
      }
      const observer = new MutationObserver(remaskIfNativeDisabled);
      observer.observe(input, {
        attributes: true,
        attributeFilter: ["disabled"],
      });
      let ancestor: HTMLElement | null = input.parentElement;
      while (ancestor) {
        if (ancestor instanceof HTMLFieldSetElement) {
          observer.observe(ancestor, {
            attributes: true,
            attributeFilter: ["disabled"],
          });
        }
        ancestor = ancestor.parentElement;
      }
      return () => observer.disconnect();
    }, [remaskIfNativeDisabled]);

    return (
      <InputGroup.Root
        className={className}
        style={style}
        invalid={invalid}
        disabled={effectiveDisabled}
        data-secret-input=""
      >
        <InputGroup.Input
          {...inputProps}
          ref={mergedRef}
          type={effectiveVisible ? "text" : "password"}
          sanitizeValue={false}
          autoComplete={autoComplete}
          // A revealed secret is plain text to the platform; keep keyboards
          // and spellcheckers from rewriting or leaking it.
          {...(effectiveVisible
            ? {
                autoCorrect: "off",
                autoCapitalize: "off",
                spellCheck: false,
              }
            : {})}
        />
        <InputGroup.Button
          type="button"
          iconOnly
          disabled={effectiveDisabled || nativeDisabled}
          aria-label={effectiveVisible ? hideLabel : showLabel}
          onClick={() => {
            if (!effectiveDisabled && !nativeDisabled) {
              setVisible((wasVisible) => !wasVisible);
            }
          }}
        >
          <CentralIcon
            name={effectiveVisible ? "IconEyeSlash" : "IconEyeOpen"}
            size={16}
            color="var(--icon-secondary)"
          />
        </InputGroup.Button>
      </InputGroup.Root>
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  SecretInput.displayName = "SecretInput";
}

export default SecretInput;
