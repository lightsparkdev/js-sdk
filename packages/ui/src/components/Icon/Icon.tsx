"use client";

import styled from "@emotion/styled";
import { invertFillColor, invertStrokeColor } from "../../icons/constants.js";
import * as icons from "../../icons/index.js";
import { rootFontSizePx } from "../../styles/common.js";
import { getFontColor, type FontColorKey } from "../../styles/themes.js";
import { isString } from "../../utils/strings.js";
import type { IconName } from "./types.js";

type IconProps = {
  className?: string | undefined;
  name: IconName;
  width: number;
  mr?: number | undefined;
  ml?: number | undefined;
  verticalAlign?: "middle" | "top" | "bottom" | "super" | number;
  color?: FontColorKey | undefined;
  tutorialStep?: number;
};

export function Icon({
  className,
  name,
  width,
  tutorialStep,
  mr = 0,
  ml = 0,
  color = undefined,
  verticalAlign = "middle",
}: IconProps) {
  const IconComponent = icons[name] || null;

  /** Assume width is px relative to the root font size but specify
   * in ems to preserve scale for larger font sizes */
  const w = parseFloat((width / rootFontSizePx).toFixed(2));
  const mrRems = parseFloat((mr / rootFontSizePx).toFixed(2));
  const mlRems = parseFloat((ml / rootFontSizePx).toFixed(2));
  const va =
    typeof verticalAlign === "string"
      ? verticalAlign
      : parseFloat((verticalAlign / rootFontSizePx).toFixed(2));

  return (
    <IconContainer
      className={className}
      w={w}
      mr={mrRems}
      ml={mlRems}
      verticalAlign={va}
      fontColor={color}
      data-tutorial-tip={tutorialStep?.toString()}
    >
      {IconComponent ? <IconComponent /> : null}
    </IconContainer>
  );
}

type IconContainerProps = {
  w: number;
  mr: number;
  ml: number;
  verticalAlign: string | number;
  fontColor?: FontColorKey | undefined;
};

export const IconContainer = styled.span<IconContainerProps>`
  pointer-events: none;
  display: inline-flex;
  ${({ mr, ml, w }) => `
    width: ${w}em;
    /* ensure no shrink in flex containers: */
    min-width: ${w}em;
    ${mr ? `margin-right: ${mr}em;` : ""}
    ${ml ? `margin-left: ${ml}em;` : ""}
  `}

  vertical-align: ${({ verticalAlign }) =>
    isString(verticalAlign) ? verticalAlign : `${verticalAlign}em`};

  ${({ theme, fontColor }) => {
    const color = getFontColor(theme, fontColor, "inherit");
    return `
    & svg {
      color: ${getFontColor(theme, fontColor, "inherit")};

      /* 
        Provide a way for an SVG to invert relative to a specified color for
        dark mode support. Ideally we would just use filters, which works in
        Chrome even if the color is not specified, but doesn't work at all for
        SVG paths in Safari:
        filter: invert(100%); -webkit-filter: invert(100%);

        Instead we'll need a class for fills and a class for strokes. Icons
        that need inverted colors should use these classes on their paths.
      */

      .${invertFillColor} {
        fill: ${fontColor ? theme.hcNeutralFromBg(color) : "currentColor"};
      }
      .${invertStrokeColor} {
        stroke: ${fontColor ? theme.hcNeutralFromBg(color) : "currentColor"};
      }
    }
  `;
  }}
`;
