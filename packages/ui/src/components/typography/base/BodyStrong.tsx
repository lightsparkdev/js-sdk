"use client";

import styled from "@emotion/styled";
import { applyTypography } from "../../../styles/typography.js";
import {
  type CommonStyledTypographyProps,
  type CommonTypographyProps,
} from "../types.js";
import { typographyStyles } from "../typographyStyles.js";
import { getPropDefaultsBase } from "./getPropDefaults.js";

type AllowedBodyStrongTags = "span";

export type BodyStrongProps = CommonTypographyProps & {
  tag?: AllowedBodyStrongTags | undefined;
};

export function BodyStrongString(props: BodyStrongProps) {
  const { children, ...rest } = getPropDefaults(props);
  return <StyledBodyStrong {...rest}>{children}</StyledBodyStrong>;
}

export function getPropDefaults<T extends BodyStrongProps>(props: T) {
  return getPropDefaultsBase(props, { as: props.tag || "span" });
}

type StyledBodyStrongProps = CommonStyledTypographyProps;

export const StyledBodyStrong = styled.span<StyledBodyStrongProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Body Strong", size, colorProp)}
  ${typographyStyles}
`;
