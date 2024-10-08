"use client";

import { type ReactNode } from "react";
import {
  toReactNodes,
  type ToReactNodesArgs,
} from "../../utils/toReactNodes/toReactNodes.js";
import { getPropDefaults, StyledTitle, type TitleProps } from "./base/Title.js";

export type TitlePropsWithContentNodes = TitleProps & {
  content?: ToReactNodesArgs;
};

export function Title(props: TitlePropsWithContentNodes) {
  const propsWithDefaults = getPropDefaults(props);
  let reactNodes: ReactNode = props.children || null;
  if (props.content) {
    reactNodes = toReactNodes(props.content);
  }
  return <StyledTitle {...propsWithDefaults}>{reactNodes}</StyledTitle>;
}
