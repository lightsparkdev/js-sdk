// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { isObject } from "lodash-es";
import { Fragment, type ReactNode } from "react";
import {
  renderTypography,
  type RenderTypographyArgs,
} from "../components/typography/renderTypography.js";
import { type TypographyTypeKey } from "../styles/tokens/typography.js";
import {
  isExternalLinkNode,
  isIconNode,
  isLinkNode,
  isNextLinkNode,
  isTextNode,
  toNonTypographicReactNodes,
  type ExternalLinkNode,
  type IconNode,
  type LinkNode,
  type NextLinkNode,
  type TextNode,
  type ToNonTypographicReactNodesArgs,
} from "./toNonTypographicReactNodes.js";

type RenderTypographyArgsOptionalProps<T extends TypographyTypeKey> = Omit<
  RenderTypographyArgs<T>,
  "props"
> & {
  props?: RenderTypographyArgs<T>["props"];
};

type TypographicReactNodes<T extends TypographyTypeKey> =
  | (LinkNode & { typography?: RenderTypographyArgsOptionalProps<T> })
  | (ExternalLinkNode & { typography?: RenderTypographyArgsOptionalProps<T> })
  | (TextNode & { typography?: RenderTypographyArgsOptionalProps<T> })
  | (NextLinkNode & { typography?: RenderTypographyArgsOptionalProps<T> });

type ToReactNodesArg<T extends TypographyTypeKey> =
  | string
  | TypographicReactNodes<T>
  | IconNode
  | null
  | undefined;

export type ToReactNodesArgs<T extends TypographyTypeKey = TypographyTypeKey> =
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
    if (!node) {
      return null;
    } else if (
      typeof node !== "string" &&
      "typography" in node &&
      node.typography &&
      node.typography.type
    ) {
      const props =
        node.typography.props ||
        ({} as NonNullable<RenderTypographyArgs<T>["props"]>);

      content = (
        <Fragment key={`typography-${i}-${node.text.substr(0, 10)}`}>
          {renderTypography(
            node.typography.type,
            Object.assign(props, { content: node }),
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

const setReactNodesTypographyMapTypes = [
  "link",
  "externalLink",
  "text",
  "nextLink",
] as const;

type SetReactNodesTypographyMapType =
  (typeof setReactNodesTypographyMapTypes)[number];

type SetReactNodesTypographyMap<T extends TypographyTypeKey> = {
  [nodeType in SetReactNodesTypographyMapType]?: RenderTypographyArgsOptionalProps<T>;
};

export function setReactNodesTypography<T extends TypographyTypeKey>(
  nodesArg: ToReactNodesArgs<T> | ToNonTypographicReactNodesArgs,
  nodesTypographyMap: SetReactNodesTypographyMap<T>,
  replaceExistingTypography = true,
) {
  const nodes = Array.isArray(nodesArg) ? nodesArg : [nodesArg];

  const nodesWithTypography = nodes.map((node) => {
    if (isIconNode(node)) {
      return node;
    } else if (typeof node === "string") {
      if (nodesTypographyMap.text) {
        return {
          text: node,
          typography: nodesTypographyMap.text,
        };
      }
    } else if (!node) {
      return node;
    }

    const useExistingTypography =
      !replaceExistingTypography && isObject(node) && "typography" in node
        ? node.typography
        : undefined;

    if (isLinkNode(node)) {
      if (nodesTypographyMap.link) {
        return {
          ...node,
          typography: useExistingTypography || nodesTypographyMap.link,
        };
      }
    } else if (isExternalLinkNode(node)) {
      if (nodesTypographyMap.externalLink) {
        return {
          ...node,
          typography: useExistingTypography || nodesTypographyMap.externalLink,
        };
      }
    } else if (isNextLinkNode(node)) {
      if (nodesTypographyMap.nextLink) {
        return {
          ...node,
          typography: useExistingTypography || nodesTypographyMap.nextLink,
        };
      }
    } else if (isTextNode(node)) {
      if (nodesTypographyMap.text) {
        return {
          ...node,
          typography: useExistingTypography || nodesTypographyMap.text,
        };
      }
    }

    return node;
  });

  return nodesWithTypography;
}

export function toReactNodesWithTypographyMap<T extends TypographyTypeKey>(
  /** The initial typography is unimportant since we'll
   *  replace it, so it doesn't need to be generic */
  nodesArg: ToReactNodesArgs<TypographyTypeKey>,
  nodesTypographyMap: SetReactNodesTypographyMap<T>,
) {
  if (!nodesArg) {
    return null;
  }

  const nodesWithTypography = setReactNodesTypography(
    nodesArg,
    nodesTypographyMap,
  );

  const nodes = toReactNodes(nodesWithTypography);
  return nodes;
}

/* Set typography on react nodes without replacing existing existing typography already set
   on the nodes. In this way we are just setting a "default" typography which is useful for
   several components while still allowing downstream instances to override as needed. */
export function setDefaultReactNodesTypography<T extends TypographyTypeKey>(
  nodesArg: ToReactNodesArgs<T> | ToNonTypographicReactNodesArgs,
  nodesTypographyMap: SetReactNodesTypographyMap<T>,
) {
  return setReactNodesTypography(nodesArg, nodesTypographyMap, false);
}
