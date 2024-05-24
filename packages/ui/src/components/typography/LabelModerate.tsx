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

export type LabelModerateProps = {
  content?: ToNonTypographicReactNodesArgs | undefined | null;
  /* children must be a string. use content prop for more complex content */
  children?: string | undefined | null;
  size?: TokenSizeKey;
  color?: FontColorKey | undefined;
};

export const LabelModerate = ({
  content,
  color,
  size = "Medium",
  children,
}: LabelModerateProps) => {
  let reactNodes: ReactNode = children || null;
  if (content) {
    reactNodes = toNonTypographicReactNodes(content);
  }
  return (
    <StyledLabelModerate size={size} colorProp={color}>
      {reactNodes}
    </StyledLabelModerate>
  );
};

type StyledLabelModerateProps = {
  /* color is an inherent html prop so we need to use colorProp instead */
  colorProp?: FontColorKey | undefined;
  children: React.ReactNode;
  size: TokenSizeKey;
};

export const StyledLabelModerate = styled.label<StyledLabelModerateProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Label Moderate", size, colorProp)}
  cursor: inherit;
`;
