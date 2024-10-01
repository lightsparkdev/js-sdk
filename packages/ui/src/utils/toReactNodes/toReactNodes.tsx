// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import { ensureArray } from "@lightsparkdev/core";
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

import { Fragment, type ReactNode } from "react";
import { renderTypography } from "../../components/typography/renderTypography.js";
import { stringToNodes } from "./stringToNodes.js";

export type ToReactNodesArg =
  | string
  | TextNode
  | LinkNode
  | NextLinkNode
  | IconNode
  | CurrencyAmountNode
  | null
  | undefined;

export type ToReactNodesArgs = ToReactNodesArg | ToReactNodesArg[];

/* toReactNodes accepts an array or single string or object definition to convert to
   react nodes like text, line breaks, and links. This allows components to constrain
   rendered content props by only allowing certain types. */
export function toReactNodes(toReactNodesArg: ToReactNodesArgs) {
  const toReactNodesArray = ensureArray(toReactNodesArg);

  const reactNodes = toReactNodesArray.map((node, i) => {
    if (!node) {
      return null;
    } else if (typeof node === "string" || isTextNode(node)) {
      const text = typeof node === "string" ? node : node.text;
      let content: ReactNode = text;
      if (isTextNode(node) && node.typography) {
        const { type: typographyType, ...typographyProps } = node.typography;
        content = renderTypography(typographyType, {
          ...typographyProps,
          children: text,
        });
      } else {
        content = stringToNodes(text);
      }
      const props = isTextNode(node)
        ? {
            onClick: node.onClick,
            style: { cursor: "pointer" },
          }
        : undefined;
      /* text property is a sufficient key for both strings and text nodes due to minimal impl */
      const key = `text-${i}-${text.substr(0, 20)}`;
      return (
        <span key={key} {...props}>
          {content}
        </span>
      );
    } else if (isLinkNode(node)) {
      /* For some nodes obtaining a stable key is not straightforward. Index will be used by default
       but parents should provide an id for cases where index is not sufficient. */
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
    }

    return null;
  });

  return <Fragment>{reactNodes}</Fragment>;
}
