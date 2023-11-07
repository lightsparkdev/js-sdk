// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";

interface LightningFeeEstimateOutput {
  /** The estimated fees for the payment. **/
  feeEstimate: CurrencyAmount;
}

export const LightningFeeEstimateOutputFromJson = (
  obj: any,
): LightningFeeEstimateOutput => {
  return {
    feeEstimate: CurrencyAmountFromJson(
      obj["lightning_fee_estimate_output_fee_estimate"],
    ),
  } as LightningFeeEstimateOutput;
};
export const LightningFeeEstimateOutputToJson = (
  obj: LightningFeeEstimateOutput,
): any => {
  return {
    lightning_fee_estimate_output_fee_estimate: CurrencyAmountToJson(
      obj.feeEstimate,
    ),
  };
};

export const FRAGMENT = `
fragment LightningFeeEstimateOutputFragment on LightningFeeEstimateOutput {
    __typename
    lightning_fee_estimate_output_fee_estimate: fee_estimate {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
}`;

export default LightningFeeEstimateOutput;
