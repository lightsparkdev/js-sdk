"use client";

import styled from "@emotion/styled";
import { applyTypography } from "../../../styles/typography.js";
import {
  type CommonStyledTypographyProps,
  type CommonTypographyProps,
} from "../types.js";
import { typographyStyles } from "../typographyStyles.js";
import { getPropDefaultsBase } from "./getPropDefaults.js";

type AllowedLabelStrongTags = "span";

export type LabelStrongProps = CommonTypographyProps & {
  tag?: AllowedLabelStrongTags | undefined;
};

export function LabelStrongString(props: LabelStrongProps) {
  const { children, ...rest } = getPropDefaults(props);
  return <StyledLabelStrong {...rest}>{children}</StyledLabelStrong>;
}

export function getPropDefaults<T extends LabelStrongProps>(props: T) {
  return getPropDefaultsBase(props, { as: props.tag || "span" });
}

type StyledLabelStrongProps = CommonStyledTypographyProps;

export const StyledLabelStrong = styled.span<StyledLabelStrongProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Label Strong", size, colorProp)}
  ${typographyStyles}
`;
