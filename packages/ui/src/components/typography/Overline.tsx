"use client";

import styled from "@emotion/styled";
import { colors } from "../../styles/colors.js";
import {
  getTypographyString,
  type TokenSizeKey,
} from "../../styles/tokens/typography.js";

interface Props {
  children: React.ReactNode;
  size?: TokenSizeKey;
  color?: string | undefined;
}

export const Overline = ({ children, color, size = "Medium" }: Props) => {
  return (
    <StyledOverline size={size} color={color}>
      {children}
    </StyledOverline>
  );
};

export const StyledOverline = styled.span<Props>`
  color: ${({ theme, color }) => `${color || theme.text || colors.black}`};
  ${({ theme, size }) => {
    return size ? getTypographyString(theme, "Overline", size) : "";
  }}
  cursor: inherit;
`;
