"use client";

import styled from "@emotion/styled";
import { colors } from "../../colors";
import { getTypographyString, TokenSize } from "../typographyTokens";

export const HEADINGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
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

/**
 * Assumes the element is a header element containing a link with an href.
 * Getting the id from the href ensures we get the id that remains
 * compatible with the links generated automatically in the markdown
 * with the rehypeAutolinkHeadings plugin. Otherwise, anchor links will not work.
 */
const getHeaderId = (element: React.ReactElement): string => {
  if (element.type === "a") {
    return getHeaderId(element.props.href);
  }

  if (typeof element === "string") {
    // Remove the # from the id
    return (element as string).replace("#", "");
  }

  if (Array.isArray(element)) {
    return getHeaderId(element[0]);
  }

  if (element.props?.children !== undefined) {
    return getHeaderId(element.props.children);
  }

  throw new Error("Could not find text in Headline element: " + element);
};

const toKebabCase = (str: string) => {
  return str.replaceAll(" ", "-").toLowerCase();
};

export const Headline = ({
  children,
  color,
  size = TokenSize.Medium,
  heading = "h1",
}: Props) => {
  const id = toKebabCase(getHeaderId(children as React.ReactElement));
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
