"use client";

import styled from "@emotion/styled";
import { colors } from "../../colors";
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
  if (!color) {
    if (app === App.UmaDocs) {
      color = colors.uma.black;
    }
  }
  return (
    <StyledBody app={app} size={size} color={color}>
      {children}
    </StyledBody>
  );
};

/**
 * Images rendered by the markdown renderer are wrapped in a paragraph tag, so we need to use a span and set it display: block to mimic a paragraph element.
 */
export const StyledBody = styled.span<Props>`
  display: block;
  ${(props) => (props.color === undefined ? "" : `color: ${props.color};`)}
  ${({ theme, app, size }) => {
    return app && size
      ? getTypographyString(theme.typography[app].Body[size])
      : "";
  }}
`;
