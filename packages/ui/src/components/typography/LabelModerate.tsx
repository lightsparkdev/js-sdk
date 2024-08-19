"use client";

import styled from "@emotion/styled";
import { type ReactNode } from "react";
import { applyTypography } from "../../styles/typography.js";
import { toNonTypographicReactNodes } from "../../utils/toNonTypographicReactNodes.js";
import {
  type CommonStyledTypographyProps,
  type CommonTypographyProps,
} from "./types.js";
import { typographyStyles } from "./typographyStyles.js";

export type LabelModerateProps = CommonTypographyProps;

export const LabelModerate = ({
  block = false,
  children,
  color,
  content,
  display,
  hideOverflow = false,
  id,
  size = "Medium",
}: LabelModerateProps) => {
  let reactNodes: ReactNode = children || null;
  if (content) {
    reactNodes = toNonTypographicReactNodes(content);
  }
  return (
    <StyledLabelModerate
      block={block}
      colorProp={color}
      displayProp={display}
      hideOverflow={hideOverflow}
      id={id}
      size={size}
    >
      {reactNodes}
    </StyledLabelModerate>
  );
};

type StyledLabelModerateProps = CommonStyledTypographyProps;

export const StyledLabelModerate = styled.span<StyledLabelModerateProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Label Moderate", size, colorProp)}
  ${typographyStyles}
`;
