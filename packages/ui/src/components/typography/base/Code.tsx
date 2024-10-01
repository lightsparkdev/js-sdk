"use client";

import styled from "@emotion/styled";
import { applyTypography } from "../../../styles/typography.js";
import {
  type CommonStyledTypographyProps,
  type CommonTypographyProps,
} from "../types.js";
import { typographyStyles } from "../typographyStyles.js";
import { getPropDefaultsBase } from "./getPropDefaults.js";

type AllowedCodeTags = "span";

export type CodeProps = CommonTypographyProps & {
  tag?: AllowedCodeTags | undefined;
};

export function CodeString(props: CodeProps) {
  const { children, ...rest } = getPropDefaults(props);
  return <StyledCode {...rest}>{children}</StyledCode>;
}

export function getPropDefaults<T extends CodeProps>(props: T) {
  return getPropDefaultsBase(props, { as: props.tag || "span" });
}

type StyledCodeProps = CommonStyledTypographyProps;

export const StyledCode = styled.span<StyledCodeProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Code", size, colorProp)}
  ${typographyStyles}
`;
