// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { Fragment, type ReactNode } from "react";
import {
  renderTypography,
  type RenderTypographyArgs,
} from "../components/typography/renderTypography.js";
import { type TypographyTypeKey } from "../styles/tokens/typography.js";
import {
  toNonTypographicReactNodes,
  type ExternalLinkNode,
  type LinkNode,
  type TextNode,
} from "./toNonTypographicReactNodes.js";

type ToReactNodesArg<T extends TypographyTypeKey> =
  | string
  | (LinkNode & { typography?: RenderTypographyArgs<T> })
  | (ExternalLinkNode & { typography?: RenderTypographyArgs<T> })
  | (TextNode & { typography?: RenderTypographyArgs<T> });

export type ToReactNodesArgs<T extends TypographyTypeKey> =
  | ToReactNodesArg<T>
  | ToReactNodesArg<T>[];

/* toReactNodes accepts an array or single string or object definition to convert to
   react nodes like text, line breaks, and links. This allows components to constrain
   rendered content props by only allowing certain types. */
export function toReactNodes<T extends TypographyTypeKey>(
  toReactNodesArg: ToReactNodesArgs<T>,
) {
  const toReactNodesArray = Array.isArray(toReactNodesArg)
    ? toReactNodesArg
    : [toReactNodesArg];

  const reactNodes = toReactNodesArray.map((node, i) => {
    let content: ReactNode;
    if (
      typeof node !== "string" &&
      node.typography &&
      node.typography.type &&
      node.typography.props
    ) {
      content = (
        <Fragment key={`typography-${i}-${node.text.substr(0, 10)}`}>
          {renderTypography(
            node.typography.type,
            Object.assign(node.typography.props, {
              content: node,
            }),
          )}
        </Fragment>
      );
    } else {
      content = toNonTypographicReactNodes(node);
    }

    return content || null;
  });

  return <Fragment>{reactNodes}</Fragment>;
}
