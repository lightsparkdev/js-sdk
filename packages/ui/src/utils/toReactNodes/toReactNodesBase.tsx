// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

/* ToReactNodesBaseArgs is only for avoiding a circular dependency between typography
   components and toReactNodes functionality. All other components should use toReactNodes.tsx */

import { ensureArray } from "@lightsparkdev/core";
import { type ReactElement } from "react";
import { CurrencyAmount } from "../../components/CurrencyAmount.js";
import { Icon } from "../../components/Icon/Icon.js";
import { Link } from "../../router.js";
import { NextLink } from "../NextLink.js";
import {
  isCurrencyAmountNode,
  isIconNode,
  isLinkNode,
  isNextLinkNode,
  isTextNode,
  type CurrencyAmountNode,
  type IconNode,
  type LinkNode,
  type NextLinkNode,
  type TextNode,
} from "./nodes.js";

type ToReactNodesBaseArg =
  | string
  | LinkNode
  | NextLinkNode
  | TextNode
  | IconNode
  | CurrencyAmountNode;

export type ToReactNodesBaseArgs = ToReactNodesBaseArg | ToReactNodesBaseArg[];

export function toReactNodesBase(toReactNodesBaseArg: ToReactNodesBaseArgs) {
  const toReactNodesArray = ensureArray(toReactNodesBaseArg);

  const reactNodes = toReactNodesArray.map((node, i) => {
    /* For some nodes obtaining a stable key is not straightforward. Index will be used by default
       but parents should provide an id for cases where index is not sufficient. */
    if (isLinkNode(node)) {
      return <Link key={`link-${i}-${node.link.id}`} {...node.link} />;
    } else if (isNextLinkNode(node)) {
      return (
        <NextLink
          key={`next-link-${i}-${node.nextLink.id}`}
          {...node.nextLink}
        />
      );
    } else if (isIconNode(node)) {
      return (
        <Icon
          key={`icon-${i}-${node.icon.id}`}
          {...node.icon}
          width={node.icon.width || 12}
        />
      );
    } else if (isCurrencyAmountNode(node)) {
      return (
        <CurrencyAmount
          key={`currency-amount-${i}-${node.currencyAmount.id}`}
          {...node.currencyAmount}
        />
      );
    } else if (typeof node === "string" || isTextNode(node)) {
      const text = typeof node === "string" ? node : node.text;
      /* text property is a sufficient key for both strings and text nodes due to minimal impl */
      const key = `str-${i}-${text.substr(0, 10)}`;
      let content: ReactElement | ReactElement[] = text
        .split("\n")
        .map((str, j, strArr) => (
          /* Must use spans to avoid conditional Fragment rendering errors https://bit.ly/3zkHEEM */
          <span key={`str-${i}-break-${j}`}>
            {str.length
              ? str.split("&nbsp;").map((strPart, k, strPartArr) => (
                  <span key={`str-${i}-part-${k}`}>
                    {strPart}
                    {k < strPartArr.length - 1 ? <span>&nbsp;</span> : null}
                  </span>
                ))
              : null}
            {j < strArr.length - 1 ? <br /> : null}
          </span>
        ));
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
      return content;
    }

    return null;
  });

  return reactNodes;
}
