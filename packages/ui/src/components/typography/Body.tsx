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

type AllowedBodyTags = "span" | "p" | "pre" | "div";

type BodyProps = {
  content?: ToNonTypographicReactNodesArgs | undefined | null;
  /* children must be a string. use content prop for more complex content */
  children?: string | undefined | null;
  size?: TokenSizeKey;
  color?: FontColorKey | undefined;
  block?: boolean | undefined;
  tag?: AllowedBodyTags | undefined;
};

export const Body = ({
  content,
  color,
  size = "Medium",
  children,
  block = false,
  tag = "span",
}: BodyProps) => {
  let reactNodes: ReactNode = children || null;
  if (content) {
    reactNodes = toNonTypographicReactNodes(content);
  }
  return (
    <StyledBody size={size} colorProp={color} block={block} as={tag}>
      {reactNodes}
    </StyledBody>
  );
};

type StyledBodyProps = {
  children: ReactNode;
  size: TokenSizeKey;
  /* color is an inherent html prop so we need to use colorProp instead */
  colorProp?: FontColorKey | undefined;
  block: boolean;
};

export const StyledBody = styled.span<StyledBodyProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Body", size, colorProp)}
  ${({ block }) => (block ? "display: block;" : "")}
`;
