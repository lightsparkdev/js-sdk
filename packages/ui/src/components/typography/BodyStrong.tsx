"use client";

import styled from "@emotion/styled";
import { type ReactNode } from "react";
import { applyTypography } from "../../styles/applyTypography.js";
import { type FontColorKey } from "../../styles/themes.js";
import { type TokenSizeKey } from "../../styles/tokens/typography.js";
import {
  toNonTypographicReactNodes,
  type ToNonTypographicReactNodesArgs,
} from "../../utils/toNonTypographicReactNodes.js";

type BodyStrongProps = {
  content?: ToNonTypographicReactNodesArgs | undefined | null;
  /* children must be a string. use content prop for more complex content */
  children?: string | undefined | null;
  size?: TokenSizeKey;
  color?: FontColorKey | undefined;
  block?: boolean | undefined;
};

export const BodyStrong = ({
  content,
  children,
  color,
  size = "Medium",
  block = false,
}: BodyStrongProps) => {
  let reactNodes: ReactNode = children || null;
  if (content) {
    reactNodes = toNonTypographicReactNodes(content);
  }
  return (
    <StyledBodyStrong size={size} colorProp={color} block={block}>
      {reactNodes}
    </StyledBodyStrong>
  );
};

type StyledBodyStrongProps = {
  children: ReactNode;
  size: TokenSizeKey;
  /* color is an inherent html prop so we need to use colorProp instead */
  colorProp?: FontColorKey | undefined;
  block: boolean;
};

export const StyledBodyStrong = styled.span<StyledBodyStrongProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Body Strong", size, colorProp)}
  display: ${({ block }) => (block ? "block" : "inline")};
`;
