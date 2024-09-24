// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { ensureArray } from "@lightsparkdev/core";
import { Fragment, type ReactNode } from "react";
import { renderTypography } from "../../components/typography/renderTypography.js";
import {
  isTextNode,
  type CurrencyAmountNode,
  type IconNode,
  type LinkNode,
  type NextLinkNode,
  type TextNode,
} from "./nodes.js";
import { toReactNodesBase } from "./toReactNodesBase.js";

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
    let content: ReactNode;
    if (!node) {
      return null;
    } else if (isTextNode(node) && node.typography) {
      const { type: typographyType, ...typographyProps } = node.typography;
      content = (
        <Fragment key={`typography-${i}-${node.text.substr(0, 10)}`}>
          {renderTypography(typographyType, {
            ...typographyProps,
            content: node.text,
          })}
        </Fragment>
      );
    } else {
      content = toReactNodesBase(node);
    }

    return content || null;
  });

  return <Fragment>{reactNodes}</Fragment>;
}
