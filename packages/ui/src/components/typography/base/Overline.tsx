"use client";

import styled from "@emotion/styled";
import { applyTypography } from "../../../styles/typography.js";
import {
  type CommonStyledTypographyProps,
  type CommonTypographyProps,
} from "../types.js";
import { typographyStyles } from "../typographyStyles.js";
import { getPropDefaultsBase } from "./getPropDefaults.js";

type AllowedOverlineTags = "span";

export type OverlineProps = CommonTypographyProps & {
  tag?: AllowedOverlineTags | undefined;
};

export function OverlineString(props: OverlineProps) {
  const { children, ...rest } = getPropDefaults(props);
  return <StyledOverline {...rest}>{children}</StyledOverline>;
}

export function getPropDefaults<T extends OverlineProps>(props: T) {
  return getPropDefaultsBase(props, { as: props.tag || "span" });
}

type StyledOverlineProps = CommonStyledTypographyProps;

export const StyledOverline = styled.span<StyledOverlineProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Overline", size, colorProp)}
  ${typographyStyles}
`;
