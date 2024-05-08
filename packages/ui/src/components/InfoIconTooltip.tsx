import { Fragment } from "react";
import { type TypographyTypeKey } from "../styles/tokens/typography.js";
import { toReactNodes, type ToReactNodesArgs } from "../utils/toReactNodes.js";
import { Icon } from "./Icon.js";
import { Tooltip } from "./Tooltip.js";

type InfoIconTooltipProps<T extends TypographyTypeKey> = {
  id: string;
  content: ToReactNodesArgs<T>;
  verticalAlign?: "middle" | number;
};

export function InfoIconTooltip<T extends TypographyTypeKey>({
  id,
  content,
  verticalAlign = "middle",
}: InfoIconTooltipProps<T>) {
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
