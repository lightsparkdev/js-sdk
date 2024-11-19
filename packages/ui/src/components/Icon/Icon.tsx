"use client";

import styled from "@emotion/styled";
import { type RequiredKeys } from "@lightsparkdev/core";
import React, { type ComponentPropsWithoutRef, type ElementType } from "react";
import { invertFillColor, invertStrokeColor } from "../../icons/constants.js";
import { rootFontSizePx } from "../../styles/common.js";
import { getFontColor, type FontColorKey } from "../../styles/themes.js";
import { isString } from "../../utils/strings.js";
import type { IconName } from "./types.js";
import { iconMap } from "./types.js";

type IconProps<I extends IconName> = {
  className?: string | undefined;
  name: I;
  width: number;
  mr?: number | "auto" | undefined;
  ml?: number | "auto" | undefined;
  mt?: number | "auto" | undefined;
  mb?: number | "auto" | undefined;
  verticalAlign?: "middle" | "top" | "bottom" | "super" | number;
  color?: FontColorKey | undefined;
  tutorialStep?: number;
  id?: string;
  square?: boolean | undefined;
  /* Require iconProps if icon takes a props object and at least one of its props is required: */
} & (RequiredKeys<ComponentPropsWithoutRef<(typeof iconMap)[I]>> extends never
  ? { iconProps?: ComponentPropsWithoutRef<(typeof iconMap)[I]> }
  : { iconProps: ComponentPropsWithoutRef<(typeof iconMap)[I]> });

export function Icon<I extends IconName>({
  className,
  name,
  width,
  square = false,
  tutorialStep,
  id,
  mr: mrProp = 0,
  ml: mlProp = 0,
  mt: mtProp = 0,
  mb: mbProp = 0,
  color = undefined,
  verticalAlign = "middle",
  iconProps,
}: IconProps<I>) {
  const IconComponent = iconMap[name] as ElementType;

  /** Assume width is px relative to the root font size but specify
   * in ems to preserve scale for larger font sizes */
  const w = parseFloat((width / rootFontSizePx).toFixed(2));
  const h = square ? w : "auto";
  const mr =
    typeof mrProp === "number"
      ? `${parseFloat((mrProp / rootFontSizePx).toFixed(2))}em`
      : mrProp;
  const ml =
    typeof mlProp === "number"
      ? `${parseFloat((mlProp / rootFontSizePx).toFixed(2))}em`
      : mlProp;
  const mt =
    typeof mtProp === "number"
      ? `${parseFloat((mtProp / rootFontSizePx).toFixed(2))}em`
      : mtProp;
  const mb =
    typeof mbProp === "number"
      ? `${parseFloat((mbProp / rootFontSizePx).toFixed(2))}em`
      : mbProp;
  const va =
    typeof verticalAlign === "string"
      ? verticalAlign
      : parseFloat((verticalAlign / rootFontSizePx).toFixed(2));

  const icon = React.createElement(IconComponent, iconProps, null);

  return (
    <IconContainer
      id={id}
      className={className}
      w={w}
      h={h}
      square={square}
      mr={mr}
      ml={ml}
      mt={mt}
      mb={mb}
      verticalAlign={va}
      fontColor={color}
      data-tutorial-tip={tutorialStep?.toString()}
    >
      {icon}
    </IconContainer>
  );
}

type IconContainerProps = {
  w: number;
  h: number | "auto";
  mr: string;
  ml: string;
  mt: string;
  mb: string;
  verticalAlign: string | number;
  fontColor?: FontColorKey | undefined;
  square: boolean;
};

export const IconContainer = styled.span<IconContainerProps>`
  pointer-events: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  ${({ mr, ml, mt, mb, w, h }) => `
    width: ${w}em;
    height: ${typeof h === "number" ? `${h}em` : h};
    /* ensure no shrink in flex containers: */
    min-width: ${w}em;
    ${mr ? `margin-right: ${mr};` : ""}
    ${ml ? `margin-left: ${ml};` : ""}
    ${mt ? `margin-top: ${mt};` : ""}
    ${mb ? `margin-bottom: ${mb};` : ""}
  `}

  vertical-align: ${({ verticalAlign }) =>
    isString(verticalAlign) ? verticalAlign : `${verticalAlign}em`};

  ${({ square }) => {
    return square
      ? `
      svg {
        width: 100%;
        height: 100%;
      }
    `
      : "";
  }}

  ${({ theme, fontColor }) => {
    const color = getFontColor(theme, fontColor, "inherit");
    return `
    svg, path {
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
        fill: ${color ? theme.hcNeutralFromBg(color) : "currentColor"};
      }
      .${invertStrokeColor} {
        stroke: ${color ? theme.hcNeutralFromBg(color) : "currentColor"};
      }
    }
  `;
  }}
`;
