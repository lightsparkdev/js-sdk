"use client";

import styled from "@emotion/styled";
import {
  getTypographyString,
  type TokenSizeKey,
} from "../../styles/tokens/typography.js";

interface Props {
  children: React.ReactNode;
  size?: TokenSizeKey;
}

export const Code = ({ children, size = "Medium" }: Props) => {
  return <StyledCode size={size}>{children}</StyledCode>;
};

export const StyledCode = styled.div<Props>`
  ${({ theme, size }) => {
    return size ? getTypographyString(theme, "Code", size) : "";
  }}
`;
