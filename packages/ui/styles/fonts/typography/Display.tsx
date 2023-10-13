"use client";

import styled from "@emotion/styled";
import { App, getTypographyString, TokenSize } from "../typographyTokens";

type Element = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface Props {
  children: React.ReactNode;
  app?: App;
  size?: TokenSize;
  element?: Element;
  color?: string | undefined;
}

export const Display = ({
  children,
  color,
  app = App.Lightspark,
  size = TokenSize.Medium,
  element = "h1",
}: Props) => {
  return (
    <StyledDisplay as={element} app={app} size={size} color={color}>
      {children}
    </StyledDisplay>
  );
};

const StyledDisplay = styled.span<Props>`
  ${(props) => (props.color === undefined ? "" : `color: ${props.color};`)}
  ${({ theme, app, size }) => {
    return app && size
      ? getTypographyString(theme.typography[app].Display[size])
      : "";
  }}
`;

export function displaySelector(element: string) {
  return `${element}${StyledDisplay}`;
}
