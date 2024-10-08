"use client";

import { type ReactNode } from "react";

import {
  toReactNodes,
  type ToReactNodesArgs,
} from "../../utils/toReactNodes/toReactNodes.js";
import {
  type DisplayProps,
  getPropDefaults,
  StyledDisplay,
} from "./base/Display.js";

export type DisplayPropsWithContentNodes = DisplayProps & {
  content?: ToReactNodesArgs;
};

export function Display(props: DisplayPropsWithContentNodes) {
  const propsWithDefaults = getPropDefaults(props);
  let reactNodes: ReactNode = props.children || null;
  if (props.content) {
    reactNodes = toReactNodes(props.content);
  }
  return <StyledDisplay {...propsWithDefaults}>{reactNodes}</StyledDisplay>;
}
