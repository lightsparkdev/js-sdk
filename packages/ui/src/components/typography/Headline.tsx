"use client";

import { type ReactNode } from "react";
import {
  toReactNodes,
  type ToReactNodesArgs,
} from "../../utils/toReactNodes/toReactNodes.js";
import {
  getPropDefaults,
  StyledHeadline,
  type HeadlineProps,
} from "./base/Headline.js";

export type HeadlinePropsWithContentNodes = HeadlineProps & {
  content?: ToReactNodesArgs;
};

export function Headline(props: HeadlinePropsWithContentNodes) {
  const propsWithDefaults = getPropDefaults(props);
  let reactNodes: ReactNode = props.children || null;
  if (props.content) {
    reactNodes = toReactNodes(props.content);
  }
  return <StyledHeadline {...propsWithDefaults}>{reactNodes}</StyledHeadline>;
}
