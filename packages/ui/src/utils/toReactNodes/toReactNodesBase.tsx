// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

/* ToReactNodesBaseArgs is only for avoiding a circular dependency between typography
   components and toReactNodes functionality. All other components should use toReactNodes.tsx */

import { nanoid } from "nanoid";
// import NextLinkModule from "next/link.js";
import { Fragment, type ReactNode } from "react";
import { CurrencyAmount } from "../../components/CurrencyAmount.js";
import { Icon } from "../../components/Icon/Icon.js";
import { Link } from "../../router.js";
import { type NewRoutesType } from "../../types/index.js";
import { NextLink } from "../NextLink.js";
import {
  isCurrencyAmountNode,
  isExternalLinkNode,
  isIconNode,
  isLinkNode,
  isNextLinkNode,
  isTextNode,
  type CurrencyAmountNode,
  type ExternalLinkNode,
  type IconNode,
  type LinkNode,
  type NextLinkNode,
  type TextNode,
} from "./nodes.js";

// const NextLink = NextLinkModule.default;

type ToReactNodesBaseArg =
  | string
  | LinkNode
  | ExternalLinkNode
  | NextLinkNode
  | TextNode
  | IconNode
  | CurrencyAmountNode;

export type ToReactNodesBaseArgs = ToReactNodesBaseArg | ToReactNodesBaseArg[];

export function toReactNodesBase(toReactNodesBaseArg: ToReactNodesBaseArgs) {
  const toReactNodesArray = Array.isArray(toReactNodesBaseArg)
    ? toReactNodesBaseArg
    : [toReactNodesBaseArg];

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
        <Icon key={`icon-${i}`} {...node.icon} width={node.icon.width || 12} />
      );
    } else if (isCurrencyAmountNode(node)) {
      content = (
        <CurrencyAmount key={`currency-amount-${i}`} {...node.currencyAmount} />
      );
    } else if (typeof node === "string" || isTextNode(node)) {
      const text = typeof node === "string" ? node : node.text;
      const key = `str-${i}-${text.substr(0, 10)}`;
      content = (
        <Fragment key={key}>
          {text.split("\n").map((str, j, strArr) => (
            <Fragment key={`str-${i}-break-${j}`}>
              {str.split("&nbsp;").map((strPart, k, strPartArr) => (
                <Fragment key={`str-${i}-part-${k}`}>
                  {strPart}
                  {k < strPartArr.length - 1 && <>&nbsp;</>}
                </Fragment>
              ))}
              {j < strArr.length - 1 && <br />}
            </Fragment>
          ))}
        </Fragment>
      );
      if (isTextNode(node) && "onClick" in node) {
        content = (
          <span
            key={`onClick-span-${key}`}
            onClick={node.onClick}
            style={{ cursor: "pointer" }}
          >
            {content}
          </span>
        );
      }
    }

    return content || null;
  });

  return <Fragment key={nanoid()}>{reactNodes}</Fragment>;
}
