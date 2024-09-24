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

export type CodeProps = CommonTypographyProps;

export const Code = ({
  block = false,
  children,
  color,
  content,
  display,
  hideOverflow = false,
  id,
  size = "Medium",
}: CodeProps) => {
  let reactNodes: ReactNode = children || null;
  if (content) {
    reactNodes = toReactNodesBase(content);
  }
  return (
    <StyledCode
      block={block}
      colorProp={color}
      displayProp={display}
      hideOverflow={hideOverflow}
      id={id}
      size={size}
    >
      {reactNodes}
    </StyledCode>
  );
};

type StyledCodeProps = CommonStyledTypographyProps;

export const StyledCode = styled.span<StyledCodeProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Code", size, colorProp)}
  ${typographyStyles}
`;
