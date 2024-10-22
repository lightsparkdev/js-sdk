import { stringToNodes } from "../../../utils/toReactNodes/stringToNodes.js";
import { type CommonTypographyProps } from "../types.js";

export function getPropDefaultsBase<
  T extends CommonTypographyProps,
  E extends Record<string, unknown>,
>(props: T, extra: E) {
  return {
    block: props.block || false,
    colorProp: props.color,
    displayProp: props.display,
    hideOverflow: props.hideOverflow || false,
    id: props.id,
    display: props.display,
    size: props.size || "Medium",
    textAlign: props.textAlign,
    onClick: props.onClick,
    children: props.children ? stringToNodes(props.children) : null,
    ...extra,
  };
}
