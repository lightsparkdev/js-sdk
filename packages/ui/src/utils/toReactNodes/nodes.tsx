import { isObject } from "lodash-es";
import type { ComponentProps } from "react";
import { type ClipboardTextField } from "../../components/ClipboardTextField.js";
import type { CurrencyAmount } from "../../components/CurrencyAmount.js";
import type { Icon } from "../../components/Icon/Icon.js";
import { type TypographyPropsWithoutChildren } from "../../components/typography/renderTypography.js";
import type { Link } from "../../router.js";
import type { NextLink } from "../NextLink.js";

export type LinkNode = {
  /* Only content prop is allowed as a ToReactNodes LinkNode arg */
  link: Omit<ComponentProps<typeof Link>, "children">;
};

export type NextLinkNode = {
  /* Only content prop is allowed as a ToReactNodes NextLinkNode arg */
  nextLink: Omit<ComponentProps<typeof NextLink>, "children">;
};

export type TextNode = {
  text: string;
  typography?: TypographyPropsWithoutChildren;
};

export type IconNode = {
  /* a default width is provided */
  icon: Omit<ComponentProps<typeof Icon>, "width"> & { width?: number };
};

export type CurrencyAmountNode = {
  currencyAmount: ComponentProps<typeof CurrencyAmount>;
};

export type ClipboardTextFieldNode = {
  clipboardTextField: ComponentProps<typeof ClipboardTextField>;
};

export function isLinkNode(node: unknown): node is LinkNode {
  return Boolean(node && isObject(node) && "link" in node);
}

export function isNextLinkNode(node: unknown): node is NextLinkNode {
  return Boolean(node && isObject(node) && "nextLink" in node);
}

export function isIconNode(node: unknown): node is IconNode {
  return Boolean(node && isObject(node) && "icon" in node);
}

export function isCurrencyAmountNode(
  node: unknown,
): node is CurrencyAmountNode {
  return Boolean(node && isObject(node) && "currencyAmount" in node);
}

export function isClipboardTextFieldNode(
  node: unknown,
): node is ClipboardTextFieldNode {
  return Boolean(node && isObject(node) && "clipboardTextField" in node);
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

export const link = (link: LinkNode["link"]): LinkNode => ({ link });

export const nextLink = (nextLink: NextLinkNode["nextLink"]): NextLinkNode => ({
  nextLink,
});

export const currencyAmount = (
  currencyAmount: ComponentProps<typeof CurrencyAmount>,
): CurrencyAmountNode => ({ currencyAmount });

export const icon = (icon: IconNode["icon"]): IconNode => ({ icon });
export const clipboardTextField = (
  clipboardTextField: ComponentProps<typeof ClipboardTextField>,
): ClipboardTextFieldNode => ({ clipboardTextField });
