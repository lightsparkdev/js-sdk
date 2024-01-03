// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { Fragment } from "react";
import { Link } from "../router.js";

export const ToReactNodesTypes = {
  Link: "link",
} as const;
export type ToReactNodesArg<RoutesType extends string> =
  | string
  | { type: typeof ToReactNodesTypes.Link; text: string; to: RoutesType };
export type ToReactNodesArgs<RoutesType extends string> =
  | ToReactNodesArg<RoutesType>
  | ToReactNodesArg<RoutesType>[];

/* toReactNodes accepts an array or single string or object definition to convert to
   react nodes like text, line breaks, and links. This allows components to constrain
   rendered content props by only allowing certain types. */
export function toReactNodes<RoutesType extends string>(
  toReactNodesArg: ToReactNodesArgs<RoutesType>,
) {
  const toReactNodesArray = Array.isArray(toReactNodesArg)
    ? toReactNodesArg
    : [toReactNodesArg];

  const reactNodes = toReactNodesArray.map((node, i) => {
    if (typeof node === "string") {
      return (
        <Fragment key={`str-${i}`}>
          {node.split("\n").map((str, j, strArr) => (
            <Fragment key={`str-${i}-break-${j}`}>
              {str}
              {j < strArr.length - 1 && <br />}
            </Fragment>
          ))}
        </Fragment>
      );
    } else if (node.type === ToReactNodesTypes.Link) {
      return (
        <Link<RoutesType> to={node.to} key={`link-${i}`}>
          {node.text}
        </Link>
      );
    }

    return null;
  });

  return <Fragment>{reactNodes}</Fragment>;
}
