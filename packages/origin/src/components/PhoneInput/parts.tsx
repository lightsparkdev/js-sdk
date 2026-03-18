"use client";

import * as React from "react";
import {
  Select as BaseSelect,
  type SelectRootProps,
} from "@base-ui/react/select";
import { Input as BaseInput } from "@base-ui/react/input";
import { CentralIcon } from "../Icon";
import clsx from "clsx";
import styles from "./PhoneInput.module.scss";

// Context to share disabled/invalid state across parts
interface PhoneInputContextValue {
  disabled?: boolean;
  invalid?: boolean;
}

const PhoneInputContext = React.createContext<
  PhoneInputContextValue | undefined
>(undefined);
PhoneInputContext.displayName = "PhoneInputContext";

function usePhoneInputContext() {
  const context = React.useContext(PhoneInputContext);
  if (context === undefined) {
    throw new Error("PhoneInput parts must be used within <PhoneInput.Root>.");
  }
  return context;
}

// Anchor context for positioning - follows Combobox pattern
const AnchorContext =
  React.createContext<React.RefObject<HTMLDivElement | null> | null>(null);
AnchorContext.displayName = "PhoneInputAnchorContext";

// Root - container for the entire phone input
export interface RootProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  invalid?: boolean;
}

export const Root = React.forwardRef<HTMLDivElement, RootProps>(function Root(
  { className, disabled = false, invalid = false, children, ...props },
  forwardedRef,
) {
  const anchorRef = React.useRef<HTMLDivElement | null>(null);

  // Combine forwarded ref with anchor ref (following Combobox pattern)
  const combinedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      anchorRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef],
  );

  const contextValue = React.useMemo(
    () => ({ disabled, invalid }),
    [disabled, invalid],
  );

  return (
    <AnchorContext.Provider value={anchorRef}>
      <PhoneInputContext.Provider value={contextValue}>
        <div
          ref={combinedRef}
          className={clsx(styles.root, className)}
          data-phone-input-root=""
          data-disabled={disabled || undefined}
          data-invalid={invalid || undefined}
          {...props}
        >
          {children}
        </div>
      </PhoneInputContext.Provider>
    </AnchorContext.Provider>
  );
});

// CountrySelect - wraps Base UI Select
export interface CountrySelectProps<Value>
  extends Omit<SelectRootProps<Value, false>, "multiple"> {}

export function CountrySelect<Value>({
  children,
  disabled: selectDisabled,
  ...props
}: CountrySelectProps<Value>) {
  const { disabled: rootDisabled } = usePhoneInputContext();
  const isDisabled = selectDisabled ?? rootDisabled;

  return (
    <BaseSelect.Root disabled={isDisabled} {...props}>
      {children}
    </BaseSelect.Root>
  );
}

// CountryTrigger
export interface CountryTriggerProps extends BaseSelect.Trigger.Props {}

export const CountryTrigger = React.forwardRef<
  HTMLButtonElement,
  CountryTriggerProps
>(function CountryTrigger({ className, ...props }, ref) {
  return (
    <BaseSelect.Trigger
      ref={ref}
      className={clsx(styles.trigger, className)}
      data-phone-input-trigger=""
      {...props}
    />
  );
});

// CountryValue - renders the selected country
export interface CountryValueProps<Value>
  extends Omit<BaseSelect.Value.Props, "children"> {
  children: (value: Value) => React.ReactNode;
}

export function CountryValue<Value>({
  className,
  children,
  ...props
}: CountryValueProps<Value>) {
  return (
    <BaseSelect.Value className={clsx(styles.value, className)} {...props}>
      {(value) => {
        if (value == null) return null;
        return children(value as Value);
      }}
    </BaseSelect.Value>
  );
}

// CountryFlag - flag wrapper (auto-sizes: 18px in trigger, 22px in items via CSS)
export interface CountryFlagProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

export const CountryFlag = React.forwardRef<HTMLSpanElement, CountryFlagProps>(
  function CountryFlag({ className, ...props }, ref) {
    return (
      <span ref={ref} className={clsx(styles.flag, className)} {...props} />
    );
  },
);

// CountryIcon
export interface CountryIconProps
  extends Omit<BaseSelect.Icon.Props, "children"> {
  children?: React.ReactNode;
}

export const CountryIcon = React.forwardRef<HTMLSpanElement, CountryIconProps>(
  function CountryIcon({ className, children, ...props }, ref) {
    return (
      <BaseSelect.Icon
        ref={ref}
        className={clsx(styles.icon, className)}
        {...props}
      >
        {children ?? <CentralIcon name="IconChevronDownSmall" size={20} />}
      </BaseSelect.Icon>
    );
  },
);

// CountryListbox - merged Portal + Positioner + Popup + List
export interface CountryListboxProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  children: React.ReactNode;
  /** Offset from the anchor element */
  sideOffset?: number;
  /** Side to position the popup */
  side?: "bottom" | "top";
  /** Alignment relative to the anchor */
  align?: "start" | "center" | "end";
  /**
   * A container element to portal the listbox into.
   * By default, portals to document body. Pass a ref to a parent
   * element (e.g., a Dialog.Popup) to render inside that container
   * and inherit its stacking context.
   */
  container?: HTMLElement | React.RefObject<HTMLElement | null> | null;
}

export const CountryListbox = React.forwardRef<
  HTMLDivElement,
  CountryListboxProps
>(function CountryListbox(
  {
    className,
    children,
    sideOffset = 6,
    side = "bottom",
    align = "start",
    container,
    ...props
  },
  ref,
) {
  const anchorRef = React.useContext(AnchorContext);

  return (
    <BaseSelect.Portal container={container}>
      <BaseSelect.Positioner
        className={styles.positioner}
        sideOffset={sideOffset}
        side={side}
        align={align}
        alignItemWithTrigger={false}
        anchor={anchorRef}
      >
        <BaseSelect.Popup className={styles.popup} data-phone-input-popup="">
          <BaseSelect.List
            ref={ref}
            className={clsx(styles.list, className)}
            {...props}
          >
            {children}
          </BaseSelect.List>
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
});

// CountryItem
export interface CountryItemProps extends BaseSelect.Item.Props {}

export const CountryItem = React.forwardRef<HTMLDivElement, CountryItemProps>(
  function CountryItem({ className, ...props }, ref) {
    return (
      <BaseSelect.Item
        ref={ref}
        className={clsx(styles.item, className)}
        {...props}
      />
    );
  },
);

// CountryItemText - country name with dial code, e.g. "United States (+1)"
export interface CountryItemTextProps extends BaseSelect.ItemText.Props {}

export const CountryItemText = React.forwardRef<
  HTMLDivElement,
  CountryItemTextProps
>(function CountryItemText({ className, ...props }, ref) {
  return (
    <BaseSelect.ItemText
      ref={ref}
      className={clsx(styles.itemText, className)}
      {...props}
    />
  );
});

// CountryItemIndicator
export interface CountryItemIndicatorProps
  extends Omit<BaseSelect.ItemIndicator.Props, "children"> {
  children?: React.ReactNode;
}

export const CountryItemIndicator = React.forwardRef<
  HTMLSpanElement,
  CountryItemIndicatorProps
>(function CountryItemIndicator(
  { className, children, keepMounted = true, style, ...props },
  ref,
) {
  return (
    <BaseSelect.ItemIndicator
      ref={ref}
      className={clsx(styles.itemIndicator, className)}
      keepMounted={keepMounted}
      style={(state) => ({
        visibility: state.selected ? "visible" : "hidden",
        ...(typeof style === "function" ? style(state) : style),
      })}
      {...props}
    >
      {children ?? <span className={styles.itemIndicatorDot} />}
    </BaseSelect.ItemIndicator>
  );
});

// Input - the phone number input (uses BaseInput for Field integration)
export interface InputProps extends Omit<BaseInput.Props, "type"> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, disabled: inputDisabled, ...props }, ref) {
    const { disabled: rootDisabled, invalid } = usePhoneInputContext();
    const isDisabled = inputDisabled ?? rootDisabled;

    return (
      <BaseInput
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        className={clsx(styles.input, className)}
        disabled={isDisabled}
        aria-invalid={invalid || undefined}
        data-phone-input-input=""
        {...props}
      />
    );
  },
);
