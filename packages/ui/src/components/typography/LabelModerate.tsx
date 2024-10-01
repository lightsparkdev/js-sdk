"use client";

import { type ReactNode } from "react";
import {
  toReactNodes,
  type ToReactNodesArgs,
} from "../../utils/toReactNodes/toReactNodes.js";
import {
  getPropDefaults,
  StyledLabelModerate,
  type LabelModerateProps,
} from "./base/LabelModerate.js";

export type LabelModeratePropsWithContentNodes = LabelModerateProps & {
  content?: ToReactNodesArgs;
};

export function LabelModerate(props: LabelModeratePropsWithContentNodes) {
  const propsWithDefaults = getPropDefaults(props);
  let reactNodes: ReactNode = props.children || null;
  if (props.content) {
    reactNodes = toReactNodes(props.content);
  }
  return (
    <StyledLabelModerate {...propsWithDefaults}>
      {reactNodes}
    </StyledLabelModerate>
  );
}
