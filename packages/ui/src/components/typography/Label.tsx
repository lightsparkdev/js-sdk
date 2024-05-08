"use client";

import styled from "@emotion/styled";
import { type ReactNode } from "react";
import { getFontColor, type FontColorKey } from "../../styles/themes.js";
import {
  getTypographyString,
  type TokenSizeKey,
} from "../../styles/tokens/typography.js";
import {
  toNonTypographicReactNodes,
  type ToNonTypographicReactNodesArgs,
} from "../../utils/toNonTypographicReactNodes.js";

type LabelProps = {
  content?: ToNonTypographicReactNodesArgs | undefined | null;
  /* children must be a string. use content prop for more complex content */
  children?: string | undefined | null;
  size?: TokenSizeKey;
  color?: FontColorKey | undefined;
};

export const Label = ({
  content,
  color,
  size = "Medium",
  children,
}: LabelProps) => {
  let reactNodes: ReactNode = children || null;
  if (content) {
    reactNodes = toNonTypographicReactNodes(content);
  }
  return (
    <StyledLabel size={size} colorProp={color}>
      {reactNodes}
    </StyledLabel>
  );
};

type StyledLabelProps = {
  children: React.ReactNode;
  size: TokenSizeKey;
  /* color is an inherent html prop so we need to use colorProp instead */
  colorProp?: FontColorKey | undefined;
};

export const StyledLabel = styled.label<StyledLabelProps>`
  color: ${({ theme, colorProp }) => getFontColor(theme, colorProp, "inherit")};
  ${({ theme, size }) => getTypographyString(theme, "Label", size)}
  cursor: inherit;
`;
