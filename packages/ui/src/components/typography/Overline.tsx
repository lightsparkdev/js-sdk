"use client";

import { type ReactNode } from "react";
import {
  toReactNodes,
  type ToReactNodesArgs,
} from "../../utils/toReactNodes/toReactNodes.js";
import {
  getPropDefaults,
  StyledOverline,
  type OverlineProps,
} from "./base/Overline.js";

export type OverlinePropsWithContentNodes = OverlineProps & {
  content?: ToReactNodesArgs;
};

export function Overline(props: OverlinePropsWithContentNodes) {
  const propsWithDefaults = getPropDefaults(props);
  let reactNodes: ReactNode = props.children || null;
  if (props.content) {
    reactNodes = toReactNodes(props.content);
  }
  return <StyledOverline {...propsWithDefaults}>{reactNodes}</StyledOverline>;
}
