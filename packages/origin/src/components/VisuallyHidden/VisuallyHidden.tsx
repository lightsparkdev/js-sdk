"use client";

import * as React from "react";

export interface VisuallyHiddenProps
  extends Omit<React.ComponentPropsWithoutRef<"span">, "style"> {
  /**
   * The element type to render.
   * @default 'span'
   */
  as?:
    | "span"
    | "div"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "legend"
    | "label"
    | "p"
    | "caption";
}

const hiddenStyles: React.CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
  borderWidth: 0,
};

/**
 * Hides content visually while keeping it accessible to screen readers.
 * Uses inline styles so hiding works even if stylesheets fail to load.
 *
 * Use for accessible labels, legends, skip links, and live-region text
 * that shouldn't be visible on screen.
 *
 * ```tsx
 * <Fieldset.Legend>
 *   <VisuallyHidden>Account limits</VisuallyHidden>
 * </Fieldset.Legend>
 * ```
 */
export const VisuallyHidden = React.forwardRef<
  HTMLElement,
  VisuallyHiddenProps
>(function VisuallyHidden(props, forwardedRef) {
  const { as: Component = "span", ...rest } = props;

  return (
    <Component
      ref={forwardedRef as React.Ref<never>}
      style={hiddenStyles}
      {...rest}
    />
  );
});

if (process.env.NODE_ENV !== "production") {
  VisuallyHidden.displayName = "VisuallyHidden";
}
