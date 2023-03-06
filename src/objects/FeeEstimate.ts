// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import CurrencyAmount, { CurrencyAmountFromJson } from "./CurrencyAmount.js";

type FeeEstimate = {
  feeFast: CurrencyAmount;

  feeMin: CurrencyAmount;
};

export const FeeEstimateFromJson = (obj: any): FeeEstimate => {
  return {
    feeFast: CurrencyAmountFromJson(obj["fee_estimate_fee_fast"]),
    feeMin: CurrencyAmountFromJson(obj["fee_estimate_fee_min"]),
  } as FeeEstimate;
};

export const FRAGMENT = `
fragment FeeEstimateFragment on FeeEstimate {
    __typename
    fee_estimate_fee_fast: fee_fast {
        __typename
        currency_amount_value: value
        currency_amount_unit: unit
    }
    fee_estimate_fee_min: fee_min {
        __typename
        currency_amount_value: value
        currency_amount_unit: unit
    }
}`;

export default FeeEstimate;
