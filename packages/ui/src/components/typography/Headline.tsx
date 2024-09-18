"use client";

import styled from "@emotion/styled";
import { type ReactNode } from "react";
import { applyTypography } from "../../styles/typography.js";
import { select } from "../../utils/emotion.js";
import { toReactNodesBase } from "../../utils/toReactNodes/toReactNodesBase.js";
import {
  type CommonStyledTypographyProps,
  type CommonTypographyProps,
} from "./types.js";
import { typographyStyles } from "./typographyStyles.js";

export const headlineElements = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
export type Heading = (typeof headlineElements)[number];

type HeadlineProps = CommonTypographyProps & {
  heading?: Heading | undefined;
};

export const Headline = ({
  block = false,
  children,
  color,
  content,
  display,
  heading = "h1",
  hideOverflow = false,
  id,
  size = "Medium",
}: HeadlineProps) => {
  let reactNodes: ReactNode = children || null;
  if (content) {
    reactNodes = toReactNodesBase(content);
  }
  return (
    <StyledHeadline
      as={heading}
      block={block}
      colorProp={color}
      displayProp={display}
      hideOverflow={hideOverflow}
      id={id}
      size={size}
    >
      {reactNodes}
    </StyledHeadline>
  );
};

type StyledHeadlineProps = CommonStyledTypographyProps;

export const StyledHeadline = styled.span<StyledHeadlineProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Headline", size, colorProp)}
  ${typographyStyles}
`;

export function headlineSelector(heading: Heading) {
  return `${heading}${select(StyledHeadline)}`;
}

export const ALL_HEADLINE_SELECTORS = headlineElements
  .map(headlineSelector)
  .join(",");
