import { type Theme } from "@emotion/react";
import { type Complete } from "@lightsparkdev/core";
import { getFontColor, type FontColorKey } from "./themes.js";
import {
  getTypographyString,
  type TokenSizeKey,
  type TypographyTypeKey,
} from "./tokens/typography.js";

export const applyTypography = (
  theme: Theme,
  typographyType: TypographyTypeKey,
  size: TokenSizeKey,
  color: FontColorKey = "inherit",
  applyToAll = true,
) => {
  const selector = applyToAll ? "&, & *" : "&";
  return `
    ${selector} {
      ${getTypographyString(theme, typographyType, size)};
      color: ${getFontColor(theme, color)};
    }
  `;
};

export type SimpleTypographyProps = {
  type?: TypographyTypeKey | undefined;
  size?: TokenSizeKey | undefined;
  color?: FontColorKey | undefined;
};
export type RequiredSimpleTypographyProps = Complete<SimpleTypographyProps>;
