"use client";

import styled from "@emotion/styled";
import { App, getTypographyString, TokenSize } from "../typographyTokens";

interface Props {
  children: React.ReactNode;
  app?: App;
  size?: TokenSize;
}

export const Body = ({
  children,
  app = App.Lightspark,
  size = TokenSize.Medium,
}: Props) => {
  return (
    <StyledBody app={app} size={size}>
      {children}
    </StyledBody>
  );
};

export const StyledBody = styled.p<Props>`
  ${({ theme, app, size }) => {
    return app && size
      ? getTypographyString(theme.typography[app].Body[size])
      : "";
  }}
`;
