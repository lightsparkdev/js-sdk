"use client";

import styled from "@emotion/styled";
import { colors } from "../../colors";
import { App, getTypographyString, TokenSize } from "../typographyTokens";

type Heading = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface Props {
  children: React.ReactNode;
  app?: App;
  size?: TokenSize;
  heading?: Heading;
  pt?: number;
  mt?: number;
  color?: string | undefined;
}

const toKebabCase = (str: string) => {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.join("-")
    .toLowerCase();
};

export const Headline = ({
  children,
  color,
  app = App.Lightspark,
  size = TokenSize.Medium,
  heading = "h1",
}: Props) => {
  if (!color) {
    if (app === App.UmaDocs) {
      color = colors.uma.black;
    }
  }
  return (
    <StyledHeadline
      as={heading}
      id={`${toKebabCase(children as string)}`}
      app={app}
      size={size}
      color={color}
    >
      {children}
    </StyledHeadline>
  );
};

const StyledHeadline = styled.span<Props>`
  ${(props) => (props.color === undefined ? "" : `color: ${props.color};`)}
  ${({ theme, app, size }) => {
    return app && size
      ? getTypographyString(theme.typography[app].Headline[size])
      : "";
  }}
`;

export function headlineSelector(heading: Heading) {
  return `${heading}${StyledHeadline}`;
}
