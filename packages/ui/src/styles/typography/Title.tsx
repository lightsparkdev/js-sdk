"use client";

import styled from "@emotion/styled";
import { colors } from "../colors.js";
import {
  getTypographyString,
  type TokenSizeKey,
} from "../tokens/typography.js";

interface Props {
  children: React.ReactNode;
  size?: TokenSizeKey;
  color?: string | undefined;
  block?: boolean;
}

export const Title = ({
  children,
  color,
  size = "Medium",
  block = false,
}: Props) => {
  return (
    <StyledTitle size={size} color={color} block={block}>
      {children}
    </StyledTitle>
  );
};

export const StyledTitle = styled.span<Props>`
  ${({ block }) => (block ? "display: block;" : "")}
  color: ${({ theme, color }) => `${color || theme.text || colors.black}`};
  ${({ theme, size }) => {
    return size ? getTypographyString(theme, "Title", size) : "";
  }}
`;
