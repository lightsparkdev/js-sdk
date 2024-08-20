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

export type TitleProps = CommonTypographyProps;

export const Title = ({
  block = false,
  children,
  color,
  content,
  display,
  hideOverflow = false,
  id,
  size = "Medium",
}: TitleProps) => {
  let reactNodes: ReactNode = children || null;
  if (content) {
    reactNodes = toNonTypographicReactNodes(content);
  }
  return (
    <StyledTitle
      size={size}
      colorProp={color}
      block={block}
      id={id}
      hideOverflow={hideOverflow}
      displayProp={display}
    >
      {reactNodes}
    </StyledTitle>
  );
};

type StyledTitleStrongProps = CommonStyledTypographyProps;

export const StyledTitle = styled.span<StyledTitleStrongProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Title", size, colorProp)}
  ${typographyStyles}
`;
