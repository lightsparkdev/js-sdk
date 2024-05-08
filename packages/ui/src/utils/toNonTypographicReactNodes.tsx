// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

/* toNonTypograhpicReactNodes is only for avoiding a circular dependency between typography
   components and toReactNodes functionality. All other components should use toReactNodes.tsx */

import { isObject } from "lodash-es";
import { nanoid } from "nanoid";
import { Fragment, type ReactNode } from "react";
import { Link } from "../router.js";
import { type NewRoutesType } from "../types/index.js";

export type LinkNode = {
  text: string;
  to: NewRoutesType | undefined;
};

export type ExternalLinkNode = {
  text: string;
  externalLink: string | undefined;
};

export type TextNode = {
  text: string;
};

function isLinkNode(node: unknown): node is LinkNode {
  return Boolean(node && isObject(node) && "text" in node && "to" in node);
}

function isExternalLinkNode(node: unknown): node is ExternalLinkNode {
  return Boolean(
    node && isObject(node) && "text" in node && "externalLink" in node,
  );
}

function isTextNode(node: unknown): node is TextNode {
  return Boolean(node && isObject(node) && "text" in node);
}

type ToNonTypographicReactNodesArg =
  | string
  | LinkNode
  | ExternalLinkNode
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
