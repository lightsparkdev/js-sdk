"use client";

import styled from "@emotion/styled";
import { applyTypography } from "../../../styles/typography.js";
import {
  type CommonStyledTypographyProps,
  type CommonTypographyProps,
} from "../types.js";
import { typographyStyles } from "../typographyStyles.js";
import { getPropDefaultsBase } from "./getPropDefaults.js";

type AllowedBtnTags = "span";

export type BtnProps = CommonTypographyProps & {
  tag?: AllowedBtnTags | undefined;
};

export function BtnString(props: BtnProps) {
  const { children, ...rest } = getPropDefaults(props);
  return <StyledBtn {...rest}>{children}</StyledBtn>;
}

export function getPropDefaults<T extends BtnProps>(props: T) {
  return getPropDefaultsBase(props, { as: props.tag || "span" });
}

type StyledBtnProps = CommonStyledTypographyProps;

export const StyledBtn = styled.span<StyledBtnProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Btn", size, colorProp)}
  ${typographyStyles}
`;
