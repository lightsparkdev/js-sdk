"use client";

import { type ReactNode } from "react";
import {
  toReactNodes,
  type ToReactNodesArgs,
} from "../../utils/toReactNodes/toReactNodes.js";
import { type BtnProps, getPropDefaults, StyledBtn } from "./base/Btn.js";

export type BtnPropsWithContentNodes = BtnProps & {
  content?: ToReactNodesArgs;
};

export function Btn(props: BtnPropsWithContentNodes) {
  const propsWithDefaults = getPropDefaults(props);
  let reactNodes: ReactNode = props.children || null;
  if (props.content) {
    reactNodes = toReactNodes(props.content);
  }

  return <StyledBtn {...propsWithDefaults}>{reactNodes}</StyledBtn>;
}
