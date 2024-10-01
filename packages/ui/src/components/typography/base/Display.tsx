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

export const displayElements = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
type DisplayElement = (typeof displayElements)[number];

export type DisplayProps = CommonTypographyProps & {
  tag?: DisplayElement | undefined;
};

export function DisplayString(props: DisplayProps) {
  const { children, ...rest } = getPropDefaults(props);
  return <StyledDisplay {...rest}>{children}</StyledDisplay>;
}

export function getPropDefaults<T extends DisplayProps>(props: T) {
  return getPropDefaultsBase(props, { as: props.tag || "h1" });
}

type StyledDisplayProps = CommonStyledTypographyProps;

export const StyledDisplay = styled.h1<StyledDisplayProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Display", size, colorProp)}
  ${typographyStyles}
`;

export function displaySelector(element: DisplayElement) {
  return `${element}${select(StyledDisplay)}`;
}
