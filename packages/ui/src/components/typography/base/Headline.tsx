"use client";

import styled from "@emotion/styled";
import { applyTypography } from "../../../styles/typography.js";
import { select } from "../../../utils/emotion.js";
import {
  type CommonStyledTypographyProps,
  type CommonTypographyProps,
} from "../types.js";
import { typographyStyles } from "../typographyStyles.js";
import { getPropDefaultsBase } from "./getPropDefaults.js";

export const headlineElements = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
export type Heading = (typeof headlineElements)[number];

export type HeadlineProps = CommonTypographyProps & {
  heading?: Heading | undefined;
};

export function HeadlineString(props: HeadlineProps) {
  const { children, ...rest } = getPropDefaults(props);
  return <StyledHeadline {...rest}>{children}</StyledHeadline>;
}

export function getPropDefaults<T extends HeadlineProps>(props: T) {
  return getPropDefaultsBase(props, { as: props.heading || "h1" });
}

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
