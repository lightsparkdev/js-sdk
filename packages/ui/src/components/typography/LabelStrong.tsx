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

export type LabelStrongProps = CommonTypographyProps;

export const LabelStrong = ({
  block = false,
  children,
  color,
  content,
  display,
  hideOverflow = false,
  id,
  size = "Medium",
}: LabelStrongProps) => {
  let reactNodes: ReactNode = children || null;
  if (content) {
    reactNodes = toNonTypographicReactNodes(content);
  }
  return (
    <StyledLabelStrong
      size={size}
      colorProp={color}
      block={block}
      id={id}
      hideOverflow={hideOverflow}
      displayProp={display}
    >
      {reactNodes}
    </StyledLabelStrong>
  );
};

type StyledLabelStrongProps = CommonStyledTypographyProps;

export const StyledLabelStrong = styled.span<StyledLabelStrongProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Label Strong", size, colorProp)}
  ${({ block }) => (block ? "display: block;" : "")}
  ${typographyStyles}
`;
