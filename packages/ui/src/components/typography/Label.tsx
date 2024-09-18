"use client";

import styled from "@emotion/styled";
import { type ReactNode } from "react";
import { applyTypography } from "../../styles/typography.js";
import { toReactNodesBase } from "../../utils/toReactNodes/toReactNodesBase.js";
import {
  type CommonStyledTypographyProps,
  type CommonTypographyProps,
} from "./types.js";
import { typographyStyles } from "./typographyStyles.js";

type LabelProps = CommonTypographyProps;

export const Label = ({
  block = false,
  children,
  color,
  content,
  display,
  hideOverflow = false,
  id,
  size = "Medium",
}: LabelProps) => {
  let reactNodes: ReactNode = children || null;
  if (content) {
    reactNodes = toReactNodesBase(content);
  }
  return (
    <StyledLabel
      block={block}
      colorProp={color}
      displayProp={display}
      hideOverflow={hideOverflow}
      id={id}
      size={size}
    >
      {reactNodes}
    </StyledLabel>
  );
};

type StyledLabelProps = CommonStyledTypographyProps;

export const StyledLabel = styled.span<StyledLabelProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Label", size, colorProp)}
  ${typographyStyles}
`;
