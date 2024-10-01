"use client";

import { type ReactNode } from "react";
import {
  toReactNodes,
  type ToReactNodesArgs,
} from "../../utils/toReactNodes/toReactNodes.js";
import { getPropDefaults, StyledLabel, type LabelProps } from "./base/Label.js";

export type LabelPropsWithContentNodes = LabelProps & {
  content?: ToReactNodesArgs;
};

export function Label(props: LabelPropsWithContentNodes) {
  const propsWithDefaults = getPropDefaults(props);
  let reactNodes: ReactNode = props.children || null;
  if (props.content) {
    reactNodes = toReactNodes(props.content);
  }
  return <StyledLabel {...propsWithDefaults}>{reactNodes}</StyledLabel>;
}
