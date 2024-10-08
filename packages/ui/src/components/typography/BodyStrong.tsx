"use client";

import { type ReactNode } from "react";
import {
  toReactNodes,
  type ToReactNodesArgs,
} from "../../utils/toReactNodes/toReactNodes.js";
import {
  type BodyStrongProps,
  getPropDefaults,
  StyledBodyStrong,
} from "./base/BodyStrong.js";

export type BodyStrongPropsWithContentNodes = BodyStrongProps & {
  content?: ToReactNodesArgs;
};

export function BodyStrong(props: BodyStrongPropsWithContentNodes) {
  const propsWithDefaults = getPropDefaults(props);
  let reactNodes: ReactNode = props.children || null;
  if (props.content) {
    reactNodes = toReactNodes(props.content);
  }
  return (
    <StyledBodyStrong {...propsWithDefaults}>{reactNodes}</StyledBodyStrong>
  );
}
