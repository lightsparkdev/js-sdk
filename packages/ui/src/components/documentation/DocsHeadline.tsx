"use client";

import React, { type ReactElement } from "react";
import { isReactNodeWithChildren } from "../../utils/isReactNodeWithChildren.js";
import {
  type HeadlineProps,
  StyledHeadline,
} from "../typography/base/Headline.js";

/* NOTE: Should only be used for documentation sites where we can't currently control 
   the MDX to ReactNode rendering. Instead we allow these components to render any
   children. */

export const getHeadlineText = (
  element: React.ReactNode,
): string | undefined => {
  if (typeof element === "string") {
    return element;
  }

  if (Array.isArray(element)) {
    return getHeadlineText(element[0] as React.ReactNode);
  }

  if (isReactNodeWithChildren(element)) {
    return getHeadlineText(element.props.children);
  }

  return undefined;
};

/**
 * Assumes the element is a header element containing a link with an href.
 * Getting the id from the href ensures we get the id that remains
 * compatible with the links generated automatically in the markdown
 * with the rehypeAutolinkHeadings plugin. Otherwise, anchor links will not
 * work.
 */
const getHeaderId = (element: React.ReactNode): string | undefined => {
  if (
    React.isValidElement(element) &&
    element?.type === "a" &&
    "href" in (element.props as object)
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

  return undefined;
};

const toKebabCase = (str: string) => {
  return str.replaceAll(" ", "-").toLowerCase();
};

type DocsHeadlineProps = {
  children: React.ReactNode;
  id?: string;
} & Partial<
  Pick<
    HeadlineProps,
    "color" | "size" | "heading" | "textAlign" | "onClick" | "underline"
  >
>;

export const DocsHeadline = ({
  children,
  color,
  id: idProp,
  size = "Medium",
  heading = "h1",
  onClick,
  textAlign,
  underline = false,
}: DocsHeadlineProps) => {
  const headerId = getHeaderId(children as ReactElement);
  const id = idProp ?? (headerId ? toKebabCase(headerId) : undefined);
  return (
    <StyledHeadline
      as={heading}
      id={id}
      size={size}
      colorProp={color}
      displayProp="block"
      hideOverflow={false}
      textAlign={textAlign}
      onClick={onClick}
      underline={underline}
      block
    >
      {children}
    </StyledHeadline>
  );
};
