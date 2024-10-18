import { css, type Theme } from "@emotion/react";
import { type CommonStyledTypographyProps } from "./types.js";

export const typographyStyles = ({
  /* theme, size, colorProp, */
  block: blockProp,
  hideOverflow,
  displayProp,
  textAlign,
  onClick,
}: { theme: Theme } & CommonStyledTypographyProps) => {
  const displayValue =
    blockProp || hideOverflow ? "block" : displayProp || null;
  return css`
    /* Margins should always be set in parent style contexts eg Article: */
    margin: 0;

    ${typeof onClick === "function" ? "cursor: pointer;" : ""}
    ${textAlign ? `text-align: ${textAlign};` : ""}
    ${displayValue ? `display: ${displayValue};` : ""}
    ${hideOverflow
      ? "overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
      : ""}
  `;
};
