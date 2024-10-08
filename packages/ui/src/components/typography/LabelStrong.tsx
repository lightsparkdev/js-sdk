"use client";

import { type ReactNode } from "react";
import {
  toReactNodes,
  type ToReactNodesArgs,
} from "../../utils/toReactNodes/toReactNodes.js";
import {
  getPropDefaults,
  StyledLabelStrong,
  type LabelStrongProps,
} from "./base/LabelStrong.js";

export type LabelStrongPropsWithContentNodes = LabelStrongProps & {
  content?: ToReactNodesArgs;
};

export function LabelStrong(props: LabelStrongPropsWithContentNodes) {
  const propsWithDefaults = getPropDefaults(props);
  let reactNodes: ReactNode = props.children || null;
  if (props.content) {
    reactNodes = toReactNodes(props.content);
  }
  return (
    <StyledLabelStrong {...propsWithDefaults}>{reactNodes}</StyledLabelStrong>
  );
}
