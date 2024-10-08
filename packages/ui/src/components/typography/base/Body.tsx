"use client";

import styled from "@emotion/styled";
import { applyTypography } from "../../../styles/typography.js";
import {
  type CommonStyledTypographyProps,
  type CommonTypographyProps,
} from "../types.js";
import { typographyStyles } from "../typographyStyles.js";
import { getPropDefaultsBase } from "./getPropDefaults.js";

type AllowedBodyTags = "span" | "p" | "pre" | "div";

export type BodyProps = CommonTypographyProps & {
  tag?: AllowedBodyTags | undefined;
};

export function BodyString(props: BodyProps) {
  const { children, ...rest } = getPropDefaults(props);
  return <StyledBody {...rest}>{children}</StyledBody>;
}

export function getPropDefaults<T extends BodyProps>(props: T) {
  return getPropDefaultsBase(props, { as: props.tag || "span" });
}

type StyledBodyProps = CommonStyledTypographyProps;

export const StyledBody = styled.span<StyledBodyProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Body", size, colorProp)}
  ${typographyStyles}
`;
