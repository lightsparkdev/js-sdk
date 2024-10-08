"use client";

import { type ReactNode } from "react";
import {
  toReactNodes,
  type ToReactNodesArgs,
} from "../../utils/toReactNodes/toReactNodes.js";
import { type BodyProps, getPropDefaults, StyledBody } from "./base/Body.js";

export type BodyPropsWithContentNodes = BodyProps & {
  content?: ToReactNodesArgs;
};

export function Body(props: BodyPropsWithContentNodes) {
  const propsWithDefaults = getPropDefaults(props);
  let reactNodes: ReactNode = props.children || null;
  if (props.content) {
    reactNodes = toReactNodes(props.content);
  }

  return <StyledBody {...propsWithDefaults}>{reactNodes}</StyledBody>;
}
