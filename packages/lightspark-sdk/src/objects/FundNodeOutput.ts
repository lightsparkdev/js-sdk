// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import CurrencyAmount, { CurrencyAmountFromJson } from "./CurrencyAmount.js";

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
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
}`;

export default FundNodeOutput;
