"use client";

import styled from "@emotion/styled";
import { getTypographyString, TokenSize } from "../typographyTokens.js";

interface Props {
  children: React.ReactNode;
  size?: TokenSize;
}

export const Code = ({ children, size = TokenSize.Medium }: Props) => {
  return <CodeStyles size={size}>{children}</CodeStyles>;
};

const CodeStyles = styled.div<Props>`
  ${({ theme, size }) => {
    return size
      ? getTypographyString(theme.typography[theme.app].Code[size])
      : "";
  }}
`;
