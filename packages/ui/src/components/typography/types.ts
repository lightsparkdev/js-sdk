import { type Complete } from "@lightsparkdev/core";
import { type MouseEvent, type ReactNode } from "react";
import type { FontColorKey } from "../../styles/themes.js";
import type {
  TokenSizeKey,
  TypographyTypeKey,
} from "../../styles/tokens/typography.js";

export type AllowedDisplay = "flex" | "block" | "inline-flex";
export type TextAlign = "left" | "right" | "center";

export type CommonTypographyProps = {
  /* children must be a string. use content prop for more complex content */
  children?: string | undefined | null;
  size?: TokenSizeKey | undefined;
  color?: FontColorKey | undefined;
  block?: boolean | undefined;
  hideOverflow?: boolean | undefined;
  id?: string | undefined;
  display?: AllowedDisplay | undefined;
  textAlign?: TextAlign | undefined;
  onClick?: ((e: MouseEvent) => void) | undefined;
  /* For cases where we want to serialize and store typography props, we can't persist
     onClick functions so we can provide a callback name / type to refer to instead: */
  onClickType?: string | undefined;
  underline?: boolean | undefined;
};

export type CommonStyledTypographyProps = {
  children: ReactNode;
  size: TokenSizeKey;
  block: boolean;
  hideOverflow: boolean;
  textAlign: TextAlign | undefined;
  /* these are an inherent html props so we need to change the name, append prop: */
  displayProp: AllowedDisplay | undefined;
  colorProp: FontColorKey | undefined;
  onClick: ((e: MouseEvent) => void) | undefined;
  underline: boolean;
};

/* Common types for external component use of typography args */
export type SimpleTypographyProps = {
  type: TypographyTypeKey;
  size?: TokenSizeKey | undefined;
  color?: FontColorKey | undefined;
  underline?: boolean | undefined;
};
export type PartialSimpleTypographyProps = Partial<SimpleTypographyProps>;
export type RequiredSimpleTypographyProps = Complete<SimpleTypographyProps>;
