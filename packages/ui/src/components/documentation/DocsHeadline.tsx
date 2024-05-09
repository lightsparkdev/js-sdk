"use client";

import React from "react";
import { type FontColorKey } from "../../styles/themes.js";
import { type TokenSizeKey } from "../../styles/tokens/typography.js";
import { isReactNodeWithChildren } from "../../utils/isReactNodeWithChildren.js";
import { StyledHeadline, type Heading } from "../typography/Headline.js";

/* NOTE: Should only be used for documentation sites where we can't currently control 
   the MDX to ReactNode rendering. Instead we allow these components to render any
   children. */

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

type DocsHeadlineProps = {
  children: React.ReactNode;
  size?: TokenSizeKey;
  heading?: Heading;
  color?: FontColorKey | undefined;
};

export const DocsHeadline = ({
  children,
  color,
  size = "Medium",
  heading = "h1",
}: DocsHeadlineProps) => {
  const id = toKebabCase(getHeaderId(children as React.ReactElement));
  return (
    <StyledHeadline as={heading} id={id} size={size} colorProp={color}>
      {children}
    </StyledHeadline>
  );
};
