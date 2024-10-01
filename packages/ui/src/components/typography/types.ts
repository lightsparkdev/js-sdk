import { type Complete } from "@lightsparkdev/core";
import { type ReactNode } from "react";
import type { FontColorKey } from "../../styles/themes.js";
import type {
  TokenSizeKey,
  TypographyTypeKey,
} from "../../styles/tokens/typography.js";

export type AllowedDisplay = "flex" | "block" | "inline-flex";

export type CommonTypographyProps = {
  /* children must be a string. use content prop for more complex content */
  children?: string | undefined | null;
  size?: TokenSizeKey | undefined;
  color?: FontColorKey | undefined;
  block?: boolean | undefined;
  hideOverflow?: boolean | undefined;
  id?: string | undefined;
  display?: AllowedDisplay | undefined;
};

export type CommonStyledTypographyProps = {
  children: ReactNode;
  size: TokenSizeKey;
  /* color is an inherent html prop so we need to use colorProp instead */
  colorProp: FontColorKey | undefined;
  block: boolean;
  hideOverflow: boolean;
  displayProp: AllowedDisplay | undefined;
};

/* Common types for external component use of typography args */
export type SimpleTypographyProps = {
  type: TypographyTypeKey;
  size?: TokenSizeKey | undefined;
  color?: FontColorKey | undefined;
};
export type PartialSimpleTypographyProps = Partial<SimpleTypographyProps>;
export type RequiredSimpleTypographyProps = Complete<SimpleTypographyProps>;
