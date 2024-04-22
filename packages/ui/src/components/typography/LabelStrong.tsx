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

export const LabelStrong = ({ children, color, size = "Medium" }: Props) => {
  return (
    <StyledLabelStrong size={size} color={color}>
      {children}
    </StyledLabelStrong>
  );
};

export const StyledLabelStrong = styled.label<Props>`
  color: ${({ theme, color }) => `${color || theme.text || colors.black}`};
  ${({ theme, size }) => {
    return size ? getTypographyString(theme, "Label Strong", size) : "";
  }}
  cursor: inherit;

  * {
    color: ${({ theme, color }) => `${color || theme.text || colors.black}`};
    ${({ theme, size }) => {
      return size ? getTypographyString(theme, "Label Strong", size) : "";
    }}
  }
`;
