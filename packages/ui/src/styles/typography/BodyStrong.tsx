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
}

export const BodyStrong = ({ children, color, size = "Medium" }: Props) => {
  return (
    <StyledBodyStrong size={size} color={color}>
      {children}
    </StyledBodyStrong>
  );
};

/**
 * Images rendered by the markdown renderer are wrapped in a paragraph tag,
 * so we need to use a span and set it display: block to mimic a paragraph
 * element.
 */
export const StyledBodyStrong = styled.span<Props>`
  display: block;
  color: ${({ theme, color }) => `${color || theme.text || colors.black}`};
  ${({ theme, size }) => {
    return size ? getTypographyString(theme, "Body Strong", size) : "";
  }}
`;
