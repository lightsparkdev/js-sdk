// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import CurrencyAmountInput from "./CurrencyAmountInput.js";
import { CurrencyAmountInputFromJson } from "./CurrencyAmountInput.js";

type FundNodeInput = {
  nodeId: string;

  amount?: CurrencyAmountInput;
};

export const FundNodeInputFromJson = (obj: any): FundNodeInput => {
  return {
    nodeId: obj["fund_node_input_node_id"],
    amount: !!obj["fund_node_input_amount"]
      ? CurrencyAmountInputFromJson(obj["fund_node_input_amount"])
      : undefined,
  } as FundNodeInput;
};

export default FundNodeInput;
