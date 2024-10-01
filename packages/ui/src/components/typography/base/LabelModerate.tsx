"use client";

import styled from "@emotion/styled";
import { applyTypography } from "../../../styles/typography.js";
import {
  type CommonStyledTypographyProps,
  type CommonTypographyProps,
} from "../types.js";
import { typographyStyles } from "../typographyStyles.js";
import { getPropDefaultsBase } from "./getPropDefaults.js";

type AllowedLabelModerateTags = "span";

export type LabelModerateProps = CommonTypographyProps & {
  tag?: AllowedLabelModerateTags | undefined;
};

export function LabelModerateString(props: LabelModerateProps) {
  const { children, ...rest } = getPropDefaults(props);
  return <StyledLabelModerate {...rest}>{children}</StyledLabelModerate>;
}

export function getPropDefaults<T extends LabelModerateProps>(props: T) {
  return getPropDefaultsBase(props, { as: props.tag || "span" });
}

type StyledLabelModerateProps = CommonStyledTypographyProps;

export const StyledLabelModerate = styled.span<StyledLabelModerateProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Label Moderate", size, colorProp)}
  ${typographyStyles}
`;
