"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import clsx from "clsx";
import { Loader } from "../Loader";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import styles from "./Button.module.scss";

export type ButtonVariant =
  | "filled"
  | "secondary"
  | "outline"
  | "ghost"
  | "critical"
  | "link";
export type ButtonSize = "default" | "compact" | "dense";

type ButtonVisualProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingIndicator?: React.ReactNode;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  iconOnly?: boolean;
  fullWidth?: boolean;
  analyticsName?: string;
  children?: React.ReactNode;
};

export type ButtonProps = Omit<
  BaseButton.Props,
  keyof ButtonVisualProps | "className"
> &
  ButtonVisualProps & {
    className?: string | undefined;
  };

type ButtonContentProps = Pick<
  ButtonVisualProps,
  | "children"
  | "iconOnly"
  | "leadingIcon"
  | "loading"
  | "loadingIndicator"
  | "trailingIcon"
>;

type ButtonClassNameProps = Pick<
  ButtonVisualProps,
  "fullWidth" | "iconOnly" | "loading" | "size" | "variant"
> & {
  className?: string | undefined;
};

const defaultLoadingIndicator = <Loader />;

function getButtonClassName({
  variant,
  size,
  iconOnly,
  fullWidth,
  loading,
  className,
}: Required<Pick<ButtonVisualProps, "size" | "variant">> &
  ButtonClassNameProps) {
  return clsx(
    styles.button,
    styles[variant],
    styles[size],
    iconOnly && styles.iconOnly,
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className,
  );
}

function ButtonContent({
  children,
  iconOnly,
  leadingIcon,
  loading,
  loadingIndicator,
  trailingIcon,
}: ButtonContentProps) {
  return (
    <>
      {/* Content wrapper - hidden but preserved during loading to maintain width */}
      <span className={clsx(styles.content, loading && styles.contentHidden)}>
        {leadingIcon && (
          <span className={styles.leadingIcon}>{leadingIcon}</span>
        )}
        {iconOnly && children}
        {!iconOnly && children && (
          <span className={styles.label}>{children}</span>
        )}
        {trailingIcon && (
          <span className={styles.trailingIcon}>{trailingIcon}</span>
        )}
      </span>
      {/* Loader overlay - absolutely centered */}
      {loading && <span className={styles.loader}>{loadingIndicator}</span>}
    </>
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "filled",
      size = "default",
      loading = false,
      loadingIndicator = defaultLoadingIndicator,
      disabled = false,
      leadingIcon,
      trailingIcon,
      iconOnly = false,
      fullWidth = false,
      analyticsName,
      onClick,
      children,
      className,
      ...props
    },
    ref,
  ) {
    const trackedClick = useTrackedCallback(
      analyticsName,
      "Button",
      "click",
      onClick,
    );

    return (
      <BaseButton
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={getButtonClassName({
          variant,
          size,
          iconOnly,
          fullWidth,
          loading,
          className,
        })}
        onClick={trackedClick}
        {...props}
      >
        <ButtonContent
          iconOnly={iconOnly}
          leadingIcon={leadingIcon}
          loading={loading}
          loadingIndicator={loadingIndicator}
          trailingIcon={trailingIcon}
        >
          {children}
        </ButtonContent>
      </BaseButton>
    );
  },
);

type ButtonLinkRenderProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  React.RefAttributes<HTMLAnchorElement>;

type ButtonLinkBaseProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "className" | "href"
> &
  ButtonVisualProps & {
    className?: string | undefined;
    disabled?: boolean;
  };

type ButtonLinkHrefTargetProps = {
  href: NonNullable<React.AnchorHTMLAttributes<HTMLAnchorElement>["href"]>;
  render?: never;
};

type ButtonLinkRenderTargetProps = {
  href?: never;
  render: React.ReactElement<ButtonLinkRenderProps>;
};

export type ButtonLinkProps = ButtonLinkBaseProps &
  (ButtonLinkHrefTargetProps | ButtonLinkRenderTargetProps);

type PreventableButtonLinkEvent = React.MouseEvent<HTMLAnchorElement> & {
  preventBaseUIHandler?: () => void;
};

type ButtonLinkAnchorProps = React.ComponentPropsWithRef<"a"> & {
  "aria-busy"?: boolean | undefined;
  "data-disabled"?: string | undefined;
  className?: string | undefined;
};

type ButtonLinkRenderElement = React.ReactElement<ButtonLinkRenderProps> & {
  ref?: React.Ref<HTMLAnchorElement>;
};

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  (ref as React.MutableRefObject<T | null>).current = value;
}

function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => assignRef(ref, value));
  };
}

export const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  function ButtonLink(
    {
      variant = "filled",
      size = "default",
      loading = false,
      loadingIndicator = defaultLoadingIndicator,
      disabled = false,
      leadingIcon,
      trailingIcon,
      iconOnly = false,
      fullWidth = false,
      analyticsName,
      onClick,
      children,
      className,
      render,
      href,
      tabIndex,
      ...props
    },
    ref,
  ) {
    const trackedClick = useTrackedCallback(
      analyticsName,
      "ButtonLink",
      "click",
      onClick,
    );
    const isDisabled = disabled || loading;
    const buttonClassName = getButtonClassName({
      variant,
      size,
      iconOnly,
      fullWidth,
      loading,
      className,
    });
    const handleClick = React.useCallback<
      React.MouseEventHandler<HTMLAnchorElement>
    >(
      (event) => {
        if (isDisabled) {
          event.preventDefault();
          event.stopPropagation();
          (event as PreventableButtonLinkEvent).preventBaseUIHandler?.();
          return;
        }

        trackedClick(event);
      },
      [isDisabled, trackedClick],
    );
    const content = (
      <ButtonContent
        iconOnly={iconOnly}
        leadingIcon={leadingIcon}
        loading={loading}
        loadingIndicator={loadingIndicator}
        trailingIcon={trailingIcon}
      >
        {children}
      </ButtonContent>
    );
    const anchorProps: ButtonLinkAnchorProps = {
      ...props,
      ...(!isDisabled && href !== undefined ? { href } : {}),
      "aria-busy": loading || undefined,
      "aria-disabled": isDisabled || undefined,
      "data-disabled": isDisabled ? "" : undefined,
      className: buttonClassName,
      onClick: handleClick,
      ref,
      tabIndex: isDisabled ? -1 : tabIndex,
    };

    if (render) {
      if (isDisabled) {
        return <a {...anchorProps}>{content}</a>;
      }

      const renderRef = (render as ButtonLinkRenderElement).ref;
      const mergedProps = mergeProps<"a">(
        render.props as React.ComponentPropsWithRef<"a">,
        {
          ...anchorProps,
          ref: mergeRefs(renderRef, ref),
        },
      ) as Partial<ButtonLinkRenderProps> & React.Attributes;

      return React.cloneElement(render, mergedProps, content);
    }

    return <a {...anchorProps}>{content}</a>;
  },
);

export default Button;
