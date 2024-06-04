import { isValidElement, type ReactElement, type ReactNode } from "react";

type ReactNodeWithChildren = ReactElement<{
  children: ReactNode;
}>;

export function isReactNodeWithChildren(
  node: unknown,
): node is ReactNodeWithChildren {
  return Boolean(
    node &&
      isValidElement(node) &&
      typeof node.props === "object" &&
      node.props !== null &&
      "children" in node.props &&
      node.props.children !== undefined,
  );
}
