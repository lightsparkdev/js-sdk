"use client";

import styled from "@emotion/styled";
import { applyTypography } from "../../../styles/typography.js";
import {
  type CommonStyledTypographyProps,
  type CommonTypographyProps,
} from "../types.js";
import { typographyStyles } from "../typographyStyles.js";
import { getPropDefaultsBase } from "./getPropDefaults.js";

type AllowedLabelTags = "span";

export type LabelProps = CommonTypographyProps & {
  tag?: AllowedLabelTags | undefined;
};

export function LabelString(props: LabelProps) {
  const { children, ...rest } = getPropDefaults(props);
  return <StyledLabel {...rest}>{children}</StyledLabel>;
}

export function getPropDefaults<T extends LabelProps>(props: T) {
  return getPropDefaultsBase(props, { as: props.tag || "span" });
}

type StyledLabelProps = CommonStyledTypographyProps;

export const StyledLabel = styled.span<StyledLabelProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Label", size, colorProp)}
  ${typographyStyles}
`;
