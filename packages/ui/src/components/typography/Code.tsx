"use client";

import styled from "@emotion/styled";
import { type ReactNode } from "react";
import { type FontColorKey } from "../../styles/themes.js";
import { type TokenSizeKey } from "../../styles/tokens/typography.js";
import { applyTypography } from "../../styles/typography.js";
import {
  toNonTypographicReactNodes,
  type ToNonTypographicReactNodesArgs,
} from "../../utils/toNonTypographicReactNodes.js";

export type CodeProps = {
  content?: ToNonTypographicReactNodesArgs | undefined | null;
  /* children must be a string. use content prop for more complex content */
  children?: string | undefined | null;
  size?: TokenSizeKey;
  color?: FontColorKey | undefined;
};

export const Code = ({
  content,
  color,
  size = "Medium",
  children,
}: CodeProps) => {
  let reactNodes: ReactNode = children || null;
  if (content) {
    reactNodes = toNonTypographicReactNodes(content);
  }
  return (
    <StyledCode size={size} colorProp={color}>
      {reactNodes}
    </StyledCode>
  );
};

type StyledCodeProps = {
  /* color is an inherent html prop so we need to use colorProp instead */
  colorProp?: FontColorKey | undefined;
  children: ReactNode;
  size: TokenSizeKey;
};

export const StyledCode = styled.div<StyledCodeProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Code", size, colorProp)}
`;
