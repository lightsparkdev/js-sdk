"use client";

import styled from "@emotion/styled";
import { applyTypography } from "../../../styles/typography.js";
import {
  type CommonStyledTypographyProps,
  type CommonTypographyProps,
} from "../types.js";
import { typographyStyles } from "../typographyStyles.js";
import { getPropDefaultsBase } from "./getPropDefaults.js";

type AllowedTitleTags = "span";

export type TitleProps = CommonTypographyProps & {
  tag?: AllowedTitleTags | undefined;
};

export function TitleString(props: TitleProps) {
  const { children, ...rest } = getPropDefaults(props);
  return <StyledTitle {...rest}>{children}</StyledTitle>;
}

export function getPropDefaults<T extends TitleProps>(props: T) {
  return getPropDefaultsBase(props, { as: props.tag || "span" });
}

type StyledTitleProps = CommonStyledTypographyProps;

export const StyledTitle = styled.span<StyledTitleProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Title", size, colorProp)}
  ${typographyStyles}
`;
