// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";

interface WithdrawalFeeEstimateOutput {
  /** The estimated fee for the withdrawal. **/
  feeEstimate: CurrencyAmount;
}

export const WithdrawalFeeEstimateOutputFromJson = (
  obj: any,
): WithdrawalFeeEstimateOutput => {
  return {
    feeEstimate: CurrencyAmountFromJson(
      obj["withdrawal_fee_estimate_output_fee_estimate"],
    ),
  } as WithdrawalFeeEstimateOutput;
};
export const WithdrawalFeeEstimateOutputToJson = (
  obj: WithdrawalFeeEstimateOutput,
): any => {
  return {
    withdrawal_fee_estimate_output_fee_estimate: CurrencyAmountToJson(
      obj.feeEstimate,
    ),
  };
};

export const FRAGMENT = `
fragment WithdrawalFeeEstimateOutputFragment on WithdrawalFeeEstimateOutput {
    __typename
    withdrawal_fee_estimate_output_fee_estimate: fee_estimate {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
}`;

export default WithdrawalFeeEstimateOutput;
