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

export type TitleProps = {
  content?: ToNonTypographicReactNodesArgs | undefined | null;
  /* children must be a string. use content prop for more complex content */
  children?: string | undefined | null;
  size?: TokenSizeKey | undefined;
  color?: FontColorKey | undefined;
  block?: boolean | undefined;
};

export const Title = ({
  content,
  color,
  size = "Medium",
  children,
  block = false,
}: TitleProps) => {
  let reactNodes: ReactNode = children || null;
  if (content) {
    reactNodes = toNonTypographicReactNodes(content);
  }
  return (
    <StyledTitle size={size} colorProp={color} block={block}>
      {reactNodes}
    </StyledTitle>
  );
};

type StyledTitleStrongProps = {
  children: ReactNode;
  size: TokenSizeKey;
  /* color is an inherent html prop so we need to use colorProp instead */
  colorProp?: FontColorKey | undefined;
  block: boolean;
};

export const StyledTitle = styled.span<StyledTitleStrongProps>`
  ${({ block }) => (block ? "display: block;" : "")}
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Title", size, colorProp)}
`;
