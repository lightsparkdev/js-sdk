import { Fragment } from "react";
import {
  toReactNodes,
  type ToReactNodesArgs,
} from "../utils/toReactNodes/toReactNodes.js";
import { Icon } from "./Icon/Icon.js";
import { Tooltip } from "./Tooltip.js";

type InfoIconTooltipProps = {
  id: string;
  content: ToReactNodesArgs;
  verticalAlign?: "middle" | number;
};

export function InfoIconTooltip({
  id,
  content,
  verticalAlign = "middle",
}: InfoIconTooltipProps) {
  const contentNodes = toReactNodes(content);
  return (
    <Fragment>
      <div
        data-tooltip-id={id}
        style={{ display: "inline-flex", alignItems: "center", verticalAlign }}
      >
        <Icon name="Info" width={12} ml={4} />
      </div>
      <Tooltip id={id} render={() => contentNodes} clickable />
    </Fragment>
  );
}
