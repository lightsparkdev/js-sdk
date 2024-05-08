"use client";

import styled from "@emotion/styled";
import {
  getTypographyString,
  type TokenSizeKey,
} from "../../styles/tokens/typography.js";

export type CodeProps = {
  children: React.ReactNode;
  size?: TokenSizeKey;
};

export const Code = ({ children, size = "Medium" }: CodeProps) => {
  return <StyledCode size={size}>{children}</StyledCode>;
};

export const StyledCode = styled.div<CodeProps>`
  ${({ theme, size }) => {
    return size ? getTypographyString(theme, "Code", size) : "";
  }}
`;
