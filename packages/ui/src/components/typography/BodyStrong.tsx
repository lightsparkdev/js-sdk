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

type BodyStrongProps = CommonTypographyProps;

export const BodyStrong = ({
  block = false,
  children,
  color,
  content,
  display,
  hideOverflow = false,
  id,
  size = "Medium",
}: BodyStrongProps) => {
  let reactNodes: ReactNode = children || null;
  if (content) {
    reactNodes = toNonTypographicReactNodes(content);
  }
  return (
    <StyledBodyStrong
      block={block}
      colorProp={color}
      displayProp={display}
      hideOverflow={hideOverflow}
      id={id}
      size={size}
    >
      {reactNodes}
    </StyledBodyStrong>
  );
};

type StyledBodyStrongProps = CommonStyledTypographyProps;

export const StyledBodyStrong = styled.span<StyledBodyStrongProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Body Strong", size, colorProp)}
  ${typographyStyles}
`;
