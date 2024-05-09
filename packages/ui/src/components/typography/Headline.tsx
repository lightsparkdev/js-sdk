"use client";

import styled from "@emotion/styled";
import { type ReactNode } from "react";
import { applyTypography } from "../../styles/applyTypography.js";
import { type FontColorKey } from "../../styles/themes.js";
import { type TokenSizeKey } from "../../styles/tokens/typography.js";
import { select } from "../../utils/emotion.js";
import {
  toNonTypographicReactNodes,
  type ToNonTypographicReactNodesArgs,
} from "../../utils/toNonTypographicReactNodes.js";

export const headlineElements = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
export type Heading = (typeof headlineElements)[number];

type HeadlineProps = {
  content?: ToNonTypographicReactNodesArgs | undefined | null;
  /* children must be a string. use content prop for more complex content */
  children?: string | undefined | null;
  size?: TokenSizeKey;
  color?: FontColorKey | undefined;
  heading?: Heading;
  block?: boolean;
  id?: string | undefined;
};

export const Headline = ({
  content,
  color,
  size = "Medium",
  children,
  heading = "h1",
  id,
}: HeadlineProps) => {
  let reactNodes: ReactNode = children || null;
  if (content) {
    reactNodes = toNonTypographicReactNodes(content);
  }
  return (
    <StyledHeadline as={heading} id={id} size={size} colorProp={color}>
      {reactNodes}
    </StyledHeadline>
  );
};

type StyledHeadlineProps = {
  /* color is an inherent html prop so we need to use colorProp instead */
  colorProp?: FontColorKey | undefined;
  children: ReactNode;
  size: TokenSizeKey;
};

export const StyledHeadline = styled.span<StyledHeadlineProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Headline", size, colorProp)}
`;

export function headlineSelector(heading: Heading) {
  return `${heading}${select(StyledHeadline)}`;
}

export const ALL_HEADLINE_SELECTORS = headlineElements
  .map(headlineSelector)
  .join(",");
