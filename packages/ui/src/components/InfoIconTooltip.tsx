import { Fragment } from "react";
import { toReactNodes, type ToReactNodesArgs } from "../utils/toReactNodes.js";
import { Icon } from "./Icon.js";
import { Tooltip } from "./Tooltip.js";

type InfoIconTooltipProps<RoutesType extends string> = {
  id: string;
  content: ToReactNodesArgs<RoutesType>;
  verticalAlign?: "middle" | number;
};

export function InfoIconTooltip<RoutesType extends string>({
  id,
  content,
  verticalAlign = "middle",
}: InfoIconTooltipProps<RoutesType>) {
  const contentNodes = toReactNodes(content);
  return (
    <Fragment>
      <div
        data-tooltip-id={id}
        style={{ display: "inline-flex", alignItems: "center", verticalAlign }}
      >
        <Icon name="Info" width={12} ml={4} />
      </div>
      <Tooltip
        delayHide={100000}
        id={id}
        render={() => contentNodes}
        clickable
      />
    </Fragment>
  );
}
