// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import CurrencyAmount from "./CurrencyAmount.js";

type ChannelFees = {
  baseFee?: CurrencyAmount;

  feeRatePerMil?: number;
};

export const ChannelFeesFromJson = (obj: any): ChannelFees => {
  return {
    baseFee: !!obj["channel_fees_base_fee"]
      ? CurrencyAmountFromJson(obj["channel_fees_base_fee"])
      : undefined,
    feeRatePerMil: obj["channel_fees_fee_rate_per_mil"],
  } as ChannelFees;
};

export const FRAGMENT = `
fragment ChannelFeesFragment on ChannelFees {
    __typename
    channel_fees_base_fee: base_fee {
        __typename
        currency_amount_value: value
        currency_amount_unit: unit
    }
    channel_fees_fee_rate_per_mil: fee_rate_per_mil
}`;

export default ChannelFees;
