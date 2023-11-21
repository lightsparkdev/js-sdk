// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";

/** This represents the fee policies set for a channel on the Lightning Network. **/
interface ChannelFees {
  baseFee?: CurrencyAmount | undefined;

  feeRatePerMil?: number | undefined;
}

export const ChannelFeesFromJson = (obj: any): ChannelFees => {
  return {
    baseFee: !!obj["channel_fees_base_fee"]
      ? CurrencyAmountFromJson(obj["channel_fees_base_fee"])
      : undefined,
    feeRatePerMil: obj["channel_fees_fee_rate_per_mil"],
  } as ChannelFees;
};
export const ChannelFeesToJson = (obj: ChannelFees): any => {
  return {
    channel_fees_base_fee: obj.baseFee
      ? CurrencyAmountToJson(obj.baseFee)
      : undefined,
    channel_fees_fee_rate_per_mil: obj.feeRatePerMil,
  };
};

export const FRAGMENT = `
fragment ChannelFeesFragment on ChannelFees {
    __typename
    channel_fees_base_fee: base_fee {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    channel_fees_fee_rate_per_mil: fee_rate_per_mil
}`;

export default ChannelFees;
