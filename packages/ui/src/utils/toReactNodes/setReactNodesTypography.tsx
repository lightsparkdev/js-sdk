import { ensureArray } from "@lightsparkdev/core";
import { type TypographyPropsWithoutChildren } from "../../components/typography/renderTypography.js";
import { isString } from "../strings.js";
import {
  isClipboardTextFieldNode,
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
  "default",
  "link",
  "text",
  "nextLink",
  "currencyAmount",
  "clipboardTextField",
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

  const typographyMap = {
    link: typography.link || typography.default,
    text: typography.text || typography.default,
    nextLink: typography.nextLink || typography.default,
    currencyAmount: typography.currencyAmount || typography.default,
    clipboardTextField: typography.clipboardTextField || typography.default,
  };

  const nodesWithTypography = nodes.map((node) => {
    if (isNonTypographicReactNode(node)) {
      return node;
    } else if (isLinkNode(node) && typographyMap.link) {
      return {
        link: {
          ...node.link,
          typography: replaceExistingTypography
            ? typographyMap.link
            : node.link.typography || typographyMap.link,
        },
      };
    } else if (isNextLinkNode(node) && typographyMap.nextLink) {
      return {
        nextLink: {
          ...node.nextLink,
          typography: replaceExistingTypography
            ? typographyMap.nextLink
            : node.nextLink.typography || typographyMap.nextLink,
        },
      };
    } else if (isCurrencyAmountNode(node) && typographyMap.currencyAmount) {
      return {
        currencyAmount: {
          ...node.currencyAmount,
          typography: typographyMap.currencyAmount,
        },
      };
    } else if (
      isClipboardTextFieldNode(node) &&
      typographyMap.clipboardTextField
    ) {
      return {
        clipboardTextField: {
          ...node.clipboardTextField,
          typography: typographyMap.clipboardTextField,
        },
      };
    } else if ((isTextNode(node) || isString(node)) && typographyMap.text) {
      return setTextNodeTypography(
        node,
        typographyMap.text,
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
  replaceExistingTypography = true,
) {
  if (!nodesArg) {
    return null;
  }

  const nodesWithTypography = setReactNodesTypography(
    nodesArg,
    nodesTypographyMap,
    replaceExistingTypography,
  );

  const nodes = toReactNodes(nodesWithTypography);
  return nodes;
}

/* Set typography on react nodes without replacing existing existing typography already set
   on the nodes. In this way we are just setting a "default" typography which is useful for
   several components while still allowing downstream instances to override as needed. */
export function setDefaultReactNodesTypography(
  nodesArg: ToReactNodesArgs,
  setDefaultReactNodesTypographyArg: SetReactNodesTypographyMap,
) {
  return setReactNodesTypography(
    nodesArg,
    setDefaultReactNodesTypographyArg,
    false,
  );
}
