"use client";

import { type ReactNode } from "react";
import {
  toReactNodes,
  type ToReactNodesArgs,
} from "../../utils/toReactNodes/toReactNodes.js";
import { type CodeProps, getPropDefaults, StyledCode } from "./base/Code.js";

export type CodePropsWithContentNodes = CodeProps & {
  content?: ToReactNodesArgs;
};

export function Code(props: CodePropsWithContentNodes) {
  const propsWithDefaults = getPropDefaults(props);
  let reactNodes: ReactNode = props.children || null;
  if (props.content) {
    reactNodes = toReactNodes(props.content);
  }
  return <StyledCode {...propsWithDefaults}>{reactNodes}</StyledCode>;
}
