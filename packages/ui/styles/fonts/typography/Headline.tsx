"use client";

import styled from "@emotion/styled";
import { colors } from "../../colors";
import { App, getTypographyString, TokenSize } from "../typographyTokens";

type Heading = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface Props {
  children: React.ReactNode;
  app?: App;
  size?: TokenSize;
  heading?: Heading;
  color?: string | undefined;
}

export const getHeadlineText = (element: React.ReactElement): string => {
  if (typeof element === "string") {
    return element;
  }

  if (Array.isArray(element)) {
    return getHeadlineText(element[0]);
  }

  if (element.props?.children !== undefined) {
    return getHeadlineText(element.props.children);
  }

  throw new Error("Could not find text in Headline element: " + element);
};

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
  const id = toKebabCase(getHeadlineText(children as React.ReactElement));
  return (
    <StyledHeadline as={heading} id={id} app={app} size={size} color={color}>
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

  a {
    ${(props) => (props.color === undefined ? "" : `color: ${props.color};`)}
    ${({ theme, app, size }) => {
      return app && size
        ? getTypographyString(theme.typography[app].Headline[size])
        : "";
    }}
  }
`;

export function headlineSelector(heading: Heading) {
  return `${heading}${StyledHeadline}`;
}
