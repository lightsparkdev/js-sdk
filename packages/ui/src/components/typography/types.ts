import { type Complete } from "@lightsparkdev/core";
import { type ReactNode } from "react";
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
};

/* Common types for external component use of typography args */
export type SimpleTypographyProps = {
  type: TypographyTypeKey;
  size?: TokenSizeKey | undefined;
  color?: FontColorKey | undefined;
};
export type PartialSimpleTypographyProps = Partial<SimpleTypographyProps>;
export type RequiredSimpleTypographyProps = Complete<SimpleTypographyProps>;
