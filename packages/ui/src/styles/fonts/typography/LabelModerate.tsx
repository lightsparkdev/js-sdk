"use client";

import styled from "@emotion/styled";
import { colors } from "../../colors.js";
import { getTypographyString, TokenSize } from "../typographyTokens.js";

interface Props {
  children: React.ReactNode;
  size?: TokenSize;
  color?: string | undefined;
}

export const LabelModerate = ({
  children,
  color,
  size = TokenSize.Medium,
}: Props) => {
  return (
    <StyledLabelModerate size={size} color={color}>
      {children}
    </StyledLabelModerate>
  );
};

export const StyledLabelModerate = styled.label<Props>`
  color: ${({ theme, color }) => `${color || theme.text || colors.black}`};
  ${({ theme, size }) => {
    return size
      ? getTypographyString(theme.typography[theme.app]["Label Moderate"][size])
      : "";
  }}
  cursor: inherit;

  * {
    color: ${({ theme, color }) => `${color || theme.text || colors.black}`};
    ${({ theme, size }) => {
      return size
        ? getTypographyString(
            theme.typography[theme.app]["Label Moderate"][size],
          )
        : "";
    }}
  }
`;
