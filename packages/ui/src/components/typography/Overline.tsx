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

export type OverlineProps = CommonTypographyProps;

export const Overline = ({
  block = false,
  children,
  color,
  content,
  display,
  hideOverflow = false,
  id,
  size = "Medium",
}: OverlineProps) => {
  let reactNodes: ReactNode = children || null;
  if (content) {
    reactNodes = toNonTypographicReactNodes(content);
  }
  return (
    <StyledOverline
      size={size}
      colorProp={color}
      block={block}
      id={id}
      hideOverflow={hideOverflow}
      displayProp={display}
    >
      {reactNodes}
    </StyledOverline>
  );
};

type StyledOverlineProps = CommonStyledTypographyProps;

export const StyledOverline = styled.span<StyledOverlineProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Overline", size, colorProp)}
  ${typographyStyles}
`;
