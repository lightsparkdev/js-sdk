import { isObject } from "lodash-es";
import type { ComponentProps } from "react";
import type { CurrencyAmount } from "../../components/CurrencyAmount.js";
import type { Icon } from "../../components/Icon/Icon.js";
import type { RenderTypographyArgs } from "../../components/typography/renderTypography.js";
import type { TypographyTypeKey } from "../../styles/tokens/typography.js";
import type { NewRoutesType } from "../../types/index.js";

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
  text: string;
  nextHref: string;
};

export type TextNode = {
  text: string;
  onClick?: () => void;
};

export type IconNode = {
  /* a default width is provided */
  icon: Omit<ComponentProps<typeof Icon>, "width"> & { width?: number };
};

export type CurrencyAmountNode = {
  currencyAmount: ComponentProps<typeof CurrencyAmount>;
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

export function isCurrencyAmountNode(
  node: unknown,
): node is CurrencyAmountNode {
  return Boolean(node && isObject(node) && "currencyAmount" in node);
}

export function isTextNode(node: unknown): node is TextNode {
  const allowedKeys = ["text", "onClick", "typography"];
  return Boolean(
    /* Exclude other nodes by ensuring only text node properties: */
    node &&
      isObject(node) &&
      /* text is required: */
      "text" in node &&
      /* ensure the rest of the keys are allowed: */
      Object.keys(node).every((key) => allowedKeys.includes(key)),
  );
}

export function isNonTypographicReactNode(
  node: unknown,
): node is IconNode | CurrencyAmountNode {
  return isIconNode(node) || isCurrencyAmountNode(node);
}

export type RenderTypographyArgsWithOptionalProps<T extends TypographyTypeKey> =
  Omit<RenderTypographyArgs<T>, "props"> & {
    props?: RenderTypographyArgs<T>["props"];
  };

export type NodeTypography<T extends TypographyTypeKey> = {
  typography?: RenderTypographyArgsWithOptionalProps<T>;
};

export type TypographicReactNodes<T extends TypographyTypeKey> =
  | (TextNode & NodeTypography<T>)
  | (LinkNode & NodeTypography<T>)
  | (ExternalLinkNode & NodeTypography<T>)
  | (NextLinkNode & NodeTypography<T>);
