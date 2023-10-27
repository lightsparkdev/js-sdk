"use client";

import styled from "@emotion/styled";
import { colors } from "../../colors";
import { getTypographyString, TokenSize } from "../typographyTokens";

interface Props {
  children: React.ReactNode;
  size?: TokenSize;
  color?: string | undefined;
}

export const LabelStrong = ({
  children,
  color,
  size = TokenSize.Medium,
}: Props) => {
  return (
    <StyledLabelStrong size={size} color={color}>
      {children}
    </StyledLabelStrong>
  );
};

export const StyledLabelStrong = styled.label<Props>`
  color: ${({ theme, color }) => `${color || theme.text || colors.black}`};
  ${({ theme, size }) => {
    return size
      ? getTypographyString(theme.typography[theme.app]["Label Strong"][size])
      : "";
  }}
  cursor: inherit;

  * {
    color: ${({ theme, color }) => `${color || theme.text || colors.black}`};
    ${({ theme, size }) => {
      return size
        ? getTypographyString(theme.typography[theme.app]["Label Strong"][size])
        : "";
    }}
  }
`;
