// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import CurrencyAmount, { CurrencyAmountFromJson } from "./CurrencyAmount.js";

type FundWalletOutput = {
  amount: CurrencyAmount;
};

export const FundWalletOutputFromJson = (obj: any): FundWalletOutput => {
  return {
    amount: CurrencyAmountFromJson(obj["fund_wallet_output_amount"]),
  } as FundWalletOutput;
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
