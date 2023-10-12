"use client";

import styled from "@emotion/styled";
import { App, getTypographyString, TokenSize } from "../typographyTokens";

interface Props {
  children: React.ReactNode;
  app?: App;
  size?: TokenSize;
}

export const Code = ({
  children,
  app = App.Lightspark,
  size = TokenSize.Medium,
}: Props) => {
  return (
    <CodeStyles app={app} size={size}>
      {children}
    </CodeStyles>
  );
};

const CodeStyles = styled.div<Props>`
  ${({ theme, app, size }) => {
    return app && size
      ? getTypographyString(theme.typography[app].Code[size])
      : "";
  }}
`;
