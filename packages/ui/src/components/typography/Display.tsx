"use client";

import styled from "@emotion/styled";
import { type ReactNode } from "react";
import { getFontColor, type FontColorKey } from "../../styles/themes.js";
import {
  getTypographyString,
  type TokenSizeKey,
} from "../../styles/tokens/typography.js";
import { select } from "../../utils/emotion.js";
import {
  toNonTypographicReactNodes,
  type ToNonTypographicReactNodesArgs,
} from "../../utils/toNonTypographicReactNodes.js";

export const displayElements = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
type DisplayElement = (typeof displayElements)[number];

export type DisplayProps = {
  content?: ToNonTypographicReactNodesArgs | undefined | null;
  /* children must be a string. use content prop for more complex content */
  children?: string | undefined | null;
  size?: TokenSizeKey;
  element?: DisplayElement;
  color?: FontColorKey | undefined;
};

export const Display = ({
  content,
  children,
  color,
  size = "Medium",
  element = "h1",
}: DisplayProps) => {
  let reactNodes: ReactNode = children || null;
  if (content) {
    reactNodes = toNonTypographicReactNodes(content);
  }
  return (
    <StyledDisplay as={element} size={size} colorProp={color}>
      {reactNodes}
    </StyledDisplay>
  );
};

type StyledDisplayProps = {
  children: ReactNode;
  size: TokenSizeKey;
  /* color is an inherent html prop so we need to use colorProp instead */
  colorProp?: FontColorKey | undefined;
};

const StyledDisplay = styled.span<StyledDisplayProps>`
  color: ${({ theme, colorProp }) => getFontColor(theme, colorProp, "inherit")};
  ${({ theme, size }) => getTypographyString(theme, "Display", size)}
`;

export function displaySelector(element: DisplayElement) {
  return `${element}${select(StyledDisplay)}`;
}
