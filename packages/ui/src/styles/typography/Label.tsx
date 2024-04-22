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

export const Label = ({ children, color, size = "Medium" }: Props) => {
  return (
    <StyledLabel size={size} color={color}>
      {children}
    </StyledLabel>
  );
};

export const StyledLabel = styled.label<Props>`
  color: ${({ theme, color }) => `${color || theme.text || colors.black}`};
  ${({ theme, size }) => {
    return size ? getTypographyString(theme, "Label", size) : "";
  }}
  cursor: inherit;
`;
