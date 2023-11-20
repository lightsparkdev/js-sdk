"use client";

import styled from "@emotion/styled";
import { colors } from "../../colors.js";
import { getTypographyString, TokenSize } from "../typographyTokens.js";

interface Props {
  children: React.ReactNode;
  size?: TokenSize;
  color?: string | undefined;
}

export const Label = ({ children, color, size = TokenSize.Medium }: Props) => {
  return (
    <StyledLabel size={size} color={color}>
      {children}
    </StyledLabel>
  );
};

export const StyledLabel = styled.label<Props>`
  color: ${({ theme, color }) => `${color || theme.text || colors.black}`};
  ${({ theme, size }) => {
    return size
      ? getTypographyString(theme.typography[theme.app].Label[size])
      : "";
  }}
  cursor: inherit;
`;
