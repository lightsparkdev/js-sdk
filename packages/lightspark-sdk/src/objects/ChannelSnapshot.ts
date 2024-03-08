// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query } from "@lightsparkdev/core";
import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";

interface ChannelSnapshot {
  /**
   * The unique identifier of this entity across all Lightspark systems. Should be treated as an
   * opaque string.
   **/
  id: string;

  /** The date and time when the entity was first created. **/
  createdAt: string;

  /** The date and time when the entity was last updated. **/
  updatedAt: string;

  channelId: string;

  /** The timestamp that was used to query the snapshot of the channel **/
  timestamp: string;

  /** The typename of the object **/
  typename: string;

  localBalance?: CurrencyAmount | undefined;

  localUnsettledBalance?: CurrencyAmount | undefined;

  remoteBalance?: CurrencyAmount | undefined;

  remoteUnsettledBalance?: CurrencyAmount | undefined;

  status?: string | undefined;

  localChannelReserve?: CurrencyAmount | undefined;
}

export const ChannelSnapshotFromJson = (obj: any): ChannelSnapshot => {
  return {
    id: obj["channel_snapshot_id"],
    createdAt: obj["channel_snapshot_created_at"],
    updatedAt: obj["channel_snapshot_updated_at"],
    channelId: obj["channel_snapshot_channel"].id,
    timestamp: obj["channel_snapshot_timestamp"],
    typename: "ChannelSnapshot",
    localBalance: !!obj["channel_snapshot_local_balance"]
      ? CurrencyAmountFromJson(obj["channel_snapshot_local_balance"])
      : undefined,
    localUnsettledBalance: !!obj["channel_snapshot_local_unsettled_balance"]
      ? CurrencyAmountFromJson(obj["channel_snapshot_local_unsettled_balance"])
      : undefined,
    remoteBalance: !!obj["channel_snapshot_remote_balance"]
      ? CurrencyAmountFromJson(obj["channel_snapshot_remote_balance"])
      : undefined,
    remoteUnsettledBalance: !!obj["channel_snapshot_remote_unsettled_balance"]
      ? CurrencyAmountFromJson(obj["channel_snapshot_remote_unsettled_balance"])
      : undefined,
    status: obj["channel_snapshot_status"],
    localChannelReserve: !!obj["channel_snapshot_local_channel_reserve"]
      ? CurrencyAmountFromJson(obj["channel_snapshot_local_channel_reserve"])
      : undefined,
  } as ChannelSnapshot;
};
export const ChannelSnapshotToJson = (obj: ChannelSnapshot): any => {
  return {
    __typename: "ChannelSnapshot",
    channel_snapshot_id: obj.id,
    channel_snapshot_created_at: obj.createdAt,
    channel_snapshot_updated_at: obj.updatedAt,
    channel_snapshot_local_balance: obj.localBalance
      ? CurrencyAmountToJson(obj.localBalance)
      : undefined,
    channel_snapshot_local_unsettled_balance: obj.localUnsettledBalance
      ? CurrencyAmountToJson(obj.localUnsettledBalance)
      : undefined,
    channel_snapshot_remote_balance: obj.remoteBalance
      ? CurrencyAmountToJson(obj.remoteBalance)
      : undefined,
    channel_snapshot_remote_unsettled_balance: obj.remoteUnsettledBalance
      ? CurrencyAmountToJson(obj.remoteUnsettledBalance)
      : undefined,
    channel_snapshot_status: obj.status,
    channel_snapshot_channel: { id: obj.channelId },
    channel_snapshot_local_channel_reserve: obj.localChannelReserve
      ? CurrencyAmountToJson(obj.localChannelReserve)
      : undefined,
    channel_snapshot_timestamp: obj.timestamp,
  };
};

export const FRAGMENT = `
fragment ChannelSnapshotFragment on ChannelSnapshot {
    __typename
    channel_snapshot_id: id
    channel_snapshot_created_at: created_at
    channel_snapshot_updated_at: updated_at
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
    channel_snapshot_status: status
    channel_snapshot_channel: channel {
        id
    }
    channel_snapshot_local_channel_reserve: local_channel_reserve {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    channel_snapshot_timestamp: timestamp
}`;

export const getChannelSnapshotQuery = (id: string): Query<ChannelSnapshot> => {
  return {
    queryPayload: `
query GetChannelSnapshot($id: ID!) {
    entity(id: $id) {
        ... on ChannelSnapshot {
            ...ChannelSnapshotFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => ChannelSnapshotFromJson(data.entity),
  };
};

export default ChannelSnapshot;
