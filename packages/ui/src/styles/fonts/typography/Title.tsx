"use client";

import styled from "@emotion/styled";
import { colors } from "../../colors.js";
import { getTypographyString, TokenSize } from "../typographyTokens.js";

interface Props {
  children: React.ReactNode;
  size?: TokenSize;
  color?: string | undefined;
}

export const Title = ({ children, color, size = TokenSize.Medium }: Props) => {
  return (
    <StyledTitle size={size} color={color}>
      {children}
    </StyledTitle>
  );
};

export const StyledTitle = styled.span<Props>`
  color: ${({ theme, color }) => `${color || theme.text || colors.black}`};
  ${({ theme, size }) => {
    return size
      ? getTypographyString(theme.typography[theme.app].Title[size])
      : "";
  }}
`;
