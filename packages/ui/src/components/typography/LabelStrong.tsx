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

export type LabelStrongProps = {
  content?: ToNonTypographicReactNodesArgs | undefined | null;
  /* children must be a string. use content prop for more complex content */
  children?: string | undefined | null;
  size?: TokenSizeKey;
  color?: FontColorKey | undefined;
};

export const LabelStrong = ({
  content,
  color,
  size = "Medium",
  children,
}: LabelStrongProps) => {
  let reactNodes: ReactNode = children || null;
  if (content) {
    reactNodes = toNonTypographicReactNodes(content);
  }
  return (
    <StyledLabelStrong size={size} colorProp={color}>
      {reactNodes}
    </StyledLabelStrong>
  );
};

type StyledLabelStrongProps = {
  /* color is an inherent html prop so we need to use colorProp instead */
  colorProp?: FontColorKey | undefined;
  children: React.ReactNode;
  size: TokenSizeKey;
};

export const StyledLabelStrong = styled.label<StyledLabelStrongProps>`
  ${({ theme, size, colorProp }) =>
    applyTypography(theme, "Label Strong", size, colorProp)}
  cursor: inherit;
`;
