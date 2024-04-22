"use client";

import styled from "@emotion/styled";
import { colors } from "../colors.js";
import { getTypographyString, TokenSize } from "../tokens/typography.js";

interface Props {
  children: React.ReactNode;
  size?: TokenSize;
  color?: string | undefined;
}

export const Overline = ({
  children,
  color,
  size = TokenSize.Medium,
}: Props) => {
  return (
    <StyledOverline size={size} color={color}>
      {children}
    </StyledOverline>
  );
};

export const StyledOverline = styled.span<Props>`
  color: ${({ theme, color }) => `${color || theme.text || colors.black}`};
  ${({ theme, size }) => {
    return size
      ? getTypographyString(theme.typography[theme.app].Overline[size])
      : "";
  }}
  cursor: inherit;
`;
