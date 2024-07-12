// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

/* toNonTypograhpicReactNodes is only for avoiding a circular dependency between typography
   components and toReactNodes functionality. All other components should use toReactNodes.tsx */

import { isObject } from "lodash-es";
import { nanoid } from "nanoid";
// import NextLinkModule from "next/link.js";
import { Fragment, type ReactNode } from "react";
import { Icon } from "../components/Icon/Icon.js";
import { type IconName } from "../components/Icon/types.js";
import { Link } from "../router.js";
import { type FontColorKey } from "../styles/themes.js";
import { type NewRoutesType } from "../types/index.js";
import { NextLink } from "./NextLink.js";

// const NextLink = NextLinkModule.default;

export type LinkNode = {
  text: string;
  to: NewRoutesType | undefined;
  newTab?: boolean;
};

export type ExternalLinkNode = {
  text: string;
  externalLink: string | undefined;
};

export type NextLinkNode = {
  nextHref: string;
  text: string;
};

export type IconNode = {
  icon: IconName;
  width?: number;
  ml?: number;
  mr?: number;
  color?: FontColorKey;
};

export type TextNode = {
  text: string;
};

export function isLinkNode(node: unknown): node is LinkNode {
  return Boolean(node && isObject(node) && "text" in node && "to" in node);
}

export function isExternalLinkNode(node: unknown): node is ExternalLinkNode {
  return Boolean(
    node && isObject(node) && "text" in node && "externalLink" in node,
  );
}

export function isNextLinkNode(node: unknown): node is NextLinkNode {
  return Boolean(
    node && isObject(node) && "text" in node && "nextHref" in node,
  );
}

export function isIconNode(node: unknown): node is IconNode {
  return Boolean(node && isObject(node) && "icon" in node);
}

export function isTextNode(node: unknown): node is TextNode {
  return Boolean(
    /* Exclude other nodes by ensuring `text` is the only property: */
    node &&
      isObject(node) &&
      "text" in node &&
      !isLinkNode(node) &&
      !isExternalLinkNode(node) &&
      !isNextLinkNode(node) &&
      !isIconNode(node),
  );
}

type ToNonTypographicReactNodesArg =
  | string
  | LinkNode
  | ExternalLinkNode
  | NextLinkNode
  | IconNode
  | TextNode;

export type ToNonTypographicReactNodesArgs =
  | ToNonTypographicReactNodesArg
  | ToNonTypographicReactNodesArg[];

export function toNonTypographicReactNodes(
  toNonTypographicReactNodesArg: ToNonTypographicReactNodesArgs,
) {
  const toReactNodesArray = Array.isArray(toNonTypographicReactNodesArg)
    ? toNonTypographicReactNodesArg
    : [toNonTypographicReactNodesArg];

  const reactNodes = toReactNodesArray.map((node, i) => {
    let content: ReactNode;
    if (isLinkNode(node)) {
      content = (
        <Link<NewRoutesType>
          to={node.to}
          key={`link-${i}-${node.text.substr(0, 10)}`}
          newTab={!!node.newTab}
        >
          {node.text}
        </Link>
      );
    } else if (isExternalLinkNode(node)) {
      content = (
        <a
          href={node.externalLink}
          key={`link-${i}-${node.text.substr(0, 10)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {node.text}
        </a>
      );
    } else if (isNextLinkNode(node)) {
      const isExternal = node.nextHref.startsWith("http");
      return (
        <Fragment key={`next-link-${i}`}>
          <NextLink
            href={node.nextHref}
            text={node.text}
            target={isExternal ? "_blank" : undefined}
          />
        </Fragment>
      );
    } else if (isIconNode(node)) {
      content = (
        <Icon
          name={node.icon}
          key={`icon-${i}`}
          width={node.width || 12}
          ml={node.ml}
          mr={node.mr}
          color={node.color}
        />
      );
    } else if (typeof node === "string" || isTextNode(node)) {
      const text = typeof node === "string" ? node : node.text;
      content = (
        <Fragment key={`str-${i}-${text.substr(0, 10)}`}>
          {text.split("\n").map((str, j, strArr) => (
            <Fragment key={`str-${i}-break-${j}`}>
              {str}
              {j < strArr.length - 1 && <br />}
            </Fragment>
          ))}
        </Fragment>
      );
    }

    return content || null;
  });

  return <Fragment key={nanoid()}>{reactNodes}</Fragment>;
}
