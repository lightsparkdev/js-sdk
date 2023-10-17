"use client";

import styled from "@emotion/styled";
import { App, getTypographyString, TokenSize } from "../typographyTokens";

interface Props {
  children: React.ReactNode;
  app?: App;
  size?: TokenSize;
  color?: string | undefined;
}

export const Label = ({
  children,
  color,
  app = App.Lightspark,
  size = TokenSize.Medium,
}: Props) => {
  return (
    <StyledLabel app={app} size={size} color={color}>
      {children}
    </StyledLabel>
  );
};

export const StyledLabel = styled.label<Props>`
  ${(props) => (props.color === undefined ? "" : `color: ${props.color};`)}
  ${({ theme, app, size }) => {
    return app && size
      ? getTypographyString(theme.typography[app].Label[size])
      : "";
  }}
  cursor: inherit;
`;
