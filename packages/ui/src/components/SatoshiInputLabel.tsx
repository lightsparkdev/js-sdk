// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import { Label } from "../styles/fields.js";
import { addCommasToDigits } from "../utils/strings.js";
import { link } from "../utils/toReactNodes/nodes.js";
import { Icon } from "./Icon/Icon.js";
import { InfoIconTooltip } from "./InfoIconTooltip.js";

export type SatoshiInputLabelProps = {
  availableSats?: number | undefined;
  showTooltip?: boolean | undefined;
  text: string;
};

export function SatoshiInputLabel({
  text,
  availableSats,
  showTooltip = true,
}: SatoshiInputLabelProps) {
  const availableSatsTooltipNode = showTooltip ? (
    <Label style={{ display: "inline-flex", margin: "0 0 0 3px" }}>
      available{" "}
      <InfoIconTooltip
        id="available-balance-tooltip"
        content={[
          "Your available balance may differ from your total balance due to operational funds being held on the Lightning Network. ",
          link({
            text: "Learn more",
            externalLink:
              "https://docs.lightspark.com/lightspark-sdk/api-reference/types/Balances",
          }),
        ]}
      />
    </Label>
  ) : null;

  return (
    <Label>
      <div>{text}</div>
      <div>
        {availableSats !== undefined && (
          <div>
            <Icon name="Satoshi" width={8} mr={4} verticalAlign={-2} />
            {addCommasToDigits(Math.floor(availableSats))}
            {availableSatsTooltipNode}
          </div>
        )}
      </div>
    </Label>
  );
}
