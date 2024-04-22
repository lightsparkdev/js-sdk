"use client";

import styled from "@emotion/styled";
import { colors } from "../colors.js";
import { getTypographyString, TokenSize } from "../tokens/typography.js";

interface Props {
  children: React.ReactNode;
  size?: TokenSize;
  color?: string | undefined;
}

export const Body = ({ children, color, size = TokenSize.Medium }: Props) => {
  return (
    <StyledBody size={size} color={color}>
      {children}
    </StyledBody>
  );
};

/**
 * Images rendered by the markdown renderer are wrapped in a paragraph tag,
 * so we need to use a span and set it display: block to mimic a paragraph
 * element.
 */
export const StyledBody = styled.span<Props>`
  display: block;
  color: ${({ theme, color }) => `${color || theme.text || colors.black}`};
  ${({ theme, size }) => {
    return size
      ? getTypographyString(theme.typography[theme.app].Body[size])
      : "";
  }}
`;
