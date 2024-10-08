import { ensureArray } from "@lightsparkdev/core";
import { type TypographyPropsWithoutChildren } from "../../components/typography/renderTypography.js";
import { isString } from "../strings.js";
import {
  isCurrencyAmountNode,
  isIconNode,
  isLinkNode,
  isNextLinkNode,
  isTextNode,
  type IconNode,
  type TextNode,
} from "./nodes.js";
import { toReactNodes, type ToReactNodesArgs } from "./toReactNodes.js";

const setReactNodesTypographyMapTypes = [
  "link",
  "text",
  "nextLink",
  "currencyAmount",
] as const;

export function isNonTypographicReactNode(
  node: unknown,
): node is undefined | null | IconNode {
  return typeof node === "undefined" || node === null || isIconNode(node);
}

type SetReactNodesTypographyMapType =
  (typeof setReactNodesTypographyMapTypes)[number];

type SetReactNodesTypographyMap = {
  [nodeType in SetReactNodesTypographyMapType]?: TypographyPropsWithoutChildren;
};

export function setReactNodesTypography(
  nodesArg: ToReactNodesArgs,
  typography: SetReactNodesTypographyMap,
  replaceExistingTypography = true,
) {
  const nodes = ensureArray(nodesArg);

  const nodesWithTypography = nodes.map((node) => {
    if (isNonTypographicReactNode(node)) {
      return node;
    } else if (isLinkNode(node) && typography.link) {
      return {
        link: {
          ...node.link,
          typography: replaceExistingTypography
            ? typography.link
            : node.link.typography || typography.link,
        },
      };
    } else if (isNextLinkNode(node) && typography.nextLink) {
      return {
        nextLink: {
          ...node.nextLink,
          typography: replaceExistingTypography
            ? typography.nextLink
            : node.nextLink.typography || typography.nextLink,
        },
      };
    } else if (isCurrencyAmountNode(node) && typography.currencyAmount) {
      return {
        currencyAmount: {
          ...node.currencyAmount,
          typography: typography.currencyAmount,
        },
      };
    } else if ((isTextNode(node) || isString(node)) && typography.text) {
      return setTextNodeTypography(
        node,
        typography.text,
        replaceExistingTypography,
      );
    }

    return node;
  });

  return nodesWithTypography;
}

function setTextNodeTypography(
  node: TextNode | string,
  typography: TypographyPropsWithoutChildren,
  replaceExistingTypography = true,
) {
  if (isString(node)) {
    return {
      text: node,
      typography,
    };
  }
  const useExistingTypography =
    !replaceExistingTypography && "typography" in node
      ? node.typography
      : undefined;
  return {
    ...node,
    typography: useExistingTypography || typography,
  };
}

export function toReactNodesWithTypographyMap(
  nodesArg: ToReactNodesArgs,
  nodesTypographyMap: SetReactNodesTypographyMap,
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
export function setDefaultReactNodesTypography(
  nodesArg: ToReactNodesArgs,
  nodesTypographyMap: SetReactNodesTypographyMap,
) {
  return setReactNodesTypography(nodesArg, nodesTypographyMap, false);
}
