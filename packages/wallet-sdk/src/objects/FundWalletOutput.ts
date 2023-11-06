// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";

interface FundWalletOutput {
  amount: CurrencyAmount;
}

export const FundWalletOutputFromJson = (obj: any): FundWalletOutput => {
  return {
    amount: CurrencyAmountFromJson(obj["fund_wallet_output_amount"]),
  } as FundWalletOutput;
};
export const FundWalletOutputToJson = (obj: FundWalletOutput): any => {
  return {
    fund_wallet_output_amount: CurrencyAmountToJson(obj.amount),
  };
};

export const FRAGMENT = `
fragment FundWalletOutputFragment on FundWalletOutput {
    __typename
    fund_wallet_output_amount: amount {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
}`;

export default FundWalletOutput;
