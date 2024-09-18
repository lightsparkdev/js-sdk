import { type ReactNode } from "react";
import { type FontColorKey } from "../../styles/themes.js";
import { type TokenSizeKey } from "../../styles/tokens/typography.js";
import { type ToReactNodesBaseArgs } from "../../utils/toReactNodes/toReactNodesBase.js";

export type AllowedDisplay = "flex" | "block" | "inline-flex";

export type CommonTypographyProps = {
  content?: ToReactNodesBaseArgs | undefined | null;
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
