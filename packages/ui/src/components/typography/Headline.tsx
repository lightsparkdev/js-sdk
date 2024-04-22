"use client";

import styled from "@emotion/styled";
import React from "react";
import { colors } from "../../styles/colors.js";
import {
  getTypographyString,
  type TokenSizeKey,
} from "../../styles/tokens/typography.js";
import { select } from "../../utils/emotion.js";

export const headlineElements = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
type Heading = (typeof headlineElements)[number];

export interface HeadlineProps {
  children: React.ReactNode;
  size?: TokenSizeKey;
  heading?: Heading;
  color?: string | undefined;
}

type ReactNodeWithChildren = React.ReactElement<{
  children: React.ReactNode;
}>;

function isReactNodeWithChildren(node: unknown): node is ReactNodeWithChildren {
  return Boolean(
    node &&
      React.isValidElement(node) &&
      typeof node.props === "object" &&
      node.props !== null &&
      "children" in node.props &&
      node.props.children !== undefined,
  );
}

export const getHeadlineText = (element: React.ReactNode): string => {
  if (typeof element === "string") {
    return element;
  }

  if (Array.isArray(element)) {
    return getHeadlineText(element[0] as React.ReactNode);
  }

  if (isReactNodeWithChildren(element)) {
    return getHeadlineText(element.props.children);
  }

  throw new Error(
    "Could not find text in Headline element: " + element?.toString(),
  );
};

/**
 * Assumes the element is a header element containing a link with an href.
 * Getting the id from the href ensures we get the id that remains
 * compatible with the links generated automatically in the markdown
 * with the rehypeAutolinkHeadings plugin. Otherwise, anchor links will not
 * work.
 */
const getHeaderId = (element: React.ReactNode): string => {
  if (
    React.isValidElement(element) &&
    element?.type === "a" &&
    "href" in element.props
  ) {
    const props = element.props as { href: string };
    return getHeaderId(props.href);
  }

  if (typeof element === "string") {
    // Remove the # from the id
    return element.replace("#", "");
  }

  if (Array.isArray(element)) {
    return getHeaderId(element[0] as React.ReactNode);
  }

  if (isReactNodeWithChildren(element)) {
    return getHeaderId(element.props.children);
  }

  throw new Error(
    "Could not find text in Headline element: " + element?.toString(),
  );
};

const toKebabCase = (str: string) => {
  return str.replaceAll(" ", "-").toLowerCase();
};

export const Headline = ({
  children,
  color,
  size = "Medium",
  heading = "h1",
}: HeadlineProps) => {
  const id = toKebabCase(getHeaderId(children as React.ReactElement));
  return (
    <StyledHeadline as={heading} id={id} size={size} color={color}>
      {children}
    </StyledHeadline>
  );
};

const StyledHeadline = styled.span<HeadlineProps>`
  color: ${({ theme, color }) => `${color || theme.text || colors.black}`};
  ${({ theme, size }) => {
    return size ? getTypographyString(theme, "Headline", size) : "";
  }}

  * {
    color: ${({ theme, color }) => `${color || theme.text || colors.black}`};
    ${({ theme, size }) => {
      return size ? getTypographyString(theme, "Headline", size) : "";
    }}
  }
`;

export function headlineSelector(heading: Heading) {
  return `${heading}${select(StyledHeadline)}`;
}

export const ALL_HEADLINE_SELECTORS = headlineElements
  .map(headlineSelector)
  .join(",");
