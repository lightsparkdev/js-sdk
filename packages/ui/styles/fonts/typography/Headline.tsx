"use client";

import styled from "@emotion/styled";
import { colors } from "../../colors";
import { getTypographyString, TokenSize } from "../typographyTokens";

const HEADINGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
type Heading = (typeof HEADINGS)[number];

export interface Props {
  children: React.ReactNode;
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
  size = TokenSize.Medium,
  heading = "h1",
}: Props) => {
  const id = toKebabCase(getHeadlineText(children as React.ReactElement));
  return (
    <StyledHeadline as={heading} id={id} size={size} color={color}>
      {children}
    </StyledHeadline>
  );
};

const StyledHeadline = styled.span<Props>`
  color: ${({ theme, color }) => `${color || theme.text || colors.black}`};
  ${({ theme, size }) => {
    return size
      ? getTypographyString(theme.typography[theme.app].Headline[size])
      : "";
  }}

  * {
    color: ${({ theme, color }) => `${color || theme.text || colors.black}`};
    ${({ theme, size }) => {
      return size
        ? getTypographyString(theme.typography[theme.app].Headline[size])
        : "";
    }}
  }
`;

export function headlineSelector(heading: Heading) {
  return `${heading}${StyledHeadline}`;
}

export const ALL_HEADLINE_SELECTORS = HEADINGS.map(headlineSelector).join(",");
