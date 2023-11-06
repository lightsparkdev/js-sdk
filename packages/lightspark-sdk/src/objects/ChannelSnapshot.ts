// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type CurrencyAmount from "./CurrencyAmount.js";
import { CurrencyAmountFromJson } from "./CurrencyAmount.js";

type ChannelSnapshot = {
  channelId: string;

  timestamp: string;

  localBalance?: CurrencyAmount;

  localUnsettledBalance?: CurrencyAmount;

  localChannelReserve?: CurrencyAmount;

  remoteBalance?: CurrencyAmount;

  remoteUnsettledBalance?: CurrencyAmount;
};

export const ChannelSnapshotFromJson = (obj: any): ChannelSnapshot => {
  return {
    channelId: obj["channel_snapshot_channel"].id,
    timestamp: obj["channel_snapshot_timestamp"],
    localBalance: !!obj["channel_snapshot_local_balance"]
      ? CurrencyAmountFromJson(obj["channel_snapshot_local_balance"])
      : undefined,
    localUnsettledBalance: !!obj["channel_snapshot_local_unsettled_balance"]
      ? CurrencyAmountFromJson(obj["channel_snapshot_local_unsettled_balance"])
      : undefined,
    localChannelReserve: !!obj["channel_snapshot_local_channel_reserve"]
      ? CurrencyAmountFromJson(obj["channel_snapshot_local_channel_reserve"])
      : undefined,
    remoteBalance: !!obj["channel_snapshot_remote_balance"]
      ? CurrencyAmountFromJson(obj["channel_snapshot_remote_balance"])
      : undefined,
    remoteUnsettledBalance: !!obj["channel_snapshot_remote_unsettled_balance"]
      ? CurrencyAmountFromJson(obj["channel_snapshot_remote_unsettled_balance"])
      : undefined,
  } as ChannelSnapshot;
};

export const FRAGMENT = `
fragment ChannelSnapshotFragment on ChannelSnapshot {
    __typename
    channel_snapshot_channel: channel {
        id
    }
    channel_snapshot_timestamp: timestamp
    channel_snapshot_local_balance: local_balance {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    channel_snapshot_local_unsettled_balance: local_unsettled_balance {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    channel_snapshot_local_channel_reserve: local_channel_reserve {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    channel_snapshot_remote_balance: remote_balance {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    channel_snapshot_remote_unsettled_balance: remote_unsettled_balance {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
}`;

export default ChannelSnapshot;
