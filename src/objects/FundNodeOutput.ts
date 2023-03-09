// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import CurrencyAmount from "./CurrencyAmount.js";

type FundNodeOutput = {
  amount: CurrencyAmount;
};

export const FundNodeOutputFromJson = (obj: any): FundNodeOutput => {
  return {
    amount: CurrencyAmountFromJson(obj["fund_node_output_amount"]),
  } as FundNodeOutput;
};

export const FRAGMENT = `
fragment FundNodeOutputFragment on FundNodeOutput {
    __typename
    fund_node_output_amount: amount {
        __typename
        currency_amount_value: value
        currency_amount_unit: unit
    }
}`;

export default FundNodeOutput;
