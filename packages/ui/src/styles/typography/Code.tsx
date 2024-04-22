"use client";

import styled from "@emotion/styled";
import { getTypographyString, TokenSize } from "../tokens/typography.js";

interface Props {
  children: React.ReactNode;
  size?: TokenSize;
}

export const Code = ({ children, size = TokenSize.Medium }: Props) => {
  return <StyledCode size={size}>{children}</StyledCode>;
};

export const StyledCode = styled.div<Props>`
  ${({ theme, size }) => {
    return size
      ? getTypographyString(theme.typography[theme.app].Code[size])
      : "";
  }}
`;
