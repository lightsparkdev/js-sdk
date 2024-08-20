"use client";

import styled from "@emotion/styled";
import { type ReactNode } from "react";
import { applyTypography } from "../../styles/typography.js";
import { select } from "../../utils/emotion.js";
import { toNonTypographicReactNodes } from "../../utils/toNonTypographicReactNodes.js";
import {
  type CommonStyledTypographyProps,
  type CommonTypographyProps,
} from "./types.js";
import { typographyStyles } from "./typographyStyles.js";

export const displayElements = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
type DisplayElement = (typeof displayElements)[number];

export type DisplayProps = CommonTypographyProps & {
  tag?: DisplayElement | undefined;
};

export const Display = ({
  block = false,
  children,
  color,
  content,
  display,
  hideOverflow = false,
  id,
  size = "Medium",
  tag = "h1",
}: DisplayProps) => {
  let reactNodes: ReactNode = children || null;
  if (content) {
    reactNodes = toNonTypographicReactNodes(content);
  }
  return (
    <StyledDisplay
      as={tag}
      block={block}
      colorProp={color}
      displayProp={display}
      hideOverflow={hideOverflow}
      id={id}
      size={size}
    >
      {reactNodes}
    </StyledDisplay>
  );
};

type StyledDisplayProps = CommonStyledTypographyProps;

const StyledDisplay = styled.span<StyledDisplayProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Display", size, colorProp)}
  ${typographyStyles}
`;

export function displaySelector(element: DisplayElement) {
  return `${element}${select(StyledDisplay)}`;
}
