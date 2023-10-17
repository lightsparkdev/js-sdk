"use client";

import styled from "@emotion/styled";
import { App, getTypographyString, TokenSize } from "../typographyTokens";

interface Props {
  children: React.ReactNode;
  app?: App;
  size?: TokenSize;
  color?: string | undefined;
}

export const Body = ({
  children,
  color,
  app = App.Lightspark,
  size = TokenSize.Medium,
}: Props) => {
  return (
    <StyledBody app={app} size={size} color={color}>
      {children}
    </StyledBody>
  );
};

export const StyledBody = styled.p<Props>`
  ${(props) => (props.color === undefined ? "" : `color: ${props.color};`)}
  ${({ theme, app, size }) => {
    return app && size
      ? getTypographyString(theme.typography[app].Body[size])
      : "";
  }}
`;
