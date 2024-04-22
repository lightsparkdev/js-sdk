"use client";

import styled from "@emotion/styled";
import { colors } from "../../styles/colors.js";
import {
  getTypographyString,
  type TokenSizeKey,
} from "../../styles/tokens/typography.js";
import { select } from "../../utils/emotion.js";

export const displayElements = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
type DisplayElement = (typeof displayElements)[number];

interface Props {
  children: React.ReactNode;
  size?: TokenSizeKey;
  element?: DisplayElement;
  color?: string | undefined;
}

export const Display = ({
  children,
  color,
  size = "Medium",
  element = "h1",
}: Props) => {
  return (
    <StyledDisplay as={element} size={size} color={color}>
      {children}
    </StyledDisplay>
  );
};

const StyledDisplay = styled.span<Props>`
  color: ${({ theme, color }) => `${color || theme.text || colors.black}`};
  ${({ theme, size }) => {
    return size ? getTypographyString(theme, "Display", size) : "";
  }}
`;

export function displaySelector(element: DisplayElement) {
  return `${element}${select(StyledDisplay)}`;
}
