// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query } from "@lightsparkdev/core";
import autoBind from "auto-bind";
import type LightsparkClient from "../client.js";
import type ChannelFees from "./ChannelFees.js";
import { ChannelFeesFromJson, ChannelFeesToJson } from "./ChannelFees.js";
import ChannelStatus from "./ChannelStatus.js";
import type ChannelToTransactionsConnection from "./ChannelToTransactionsConnection.js";
import { ChannelToTransactionsConnectionFromJson } from "./ChannelToTransactionsConnection.js";
import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";
import type Entity from "./Entity.js";
import type TransactionType from "./TransactionType.js";

/**
 * This is an object representing a channel on the Lightning Network. You can retrieve this object
 * to get detailed information on a specific Lightning Network channel. *
 */
class Channel implements Entity {
  constructor(
    /**
     * The unique identifier of this entity across all Lightspark systems. Should be treated as an
     * opaque string.
     **/
    public readonly id: string,
    /** The date and time when the entity was first created. **/
    public readonly createdAt: string,
    /** The date and time when the entity was last updated. **/
    public readonly updatedAt: string,
    /** The local Lightspark node of the channel. **/
    public readonly localNodeId: string,
    /** The typename of the object **/
    public readonly typename: string,
    /** The transaction that funded the channel upon channel opening. **/
    public readonly fundingTransactionId?: string | undefined,
    /**
     * The total amount of funds in this channel, including the channel balance on the local node,
     * the channel balance on the remote node and the on-chain fees to close the channel.
     **/
    public readonly capacity?: CurrencyAmount | undefined,
    /** The channel balance on the local node. **/
    public readonly localBalance?: CurrencyAmount | undefined,
    /**
     * The channel balance on the local node that is currently allocated to in-progress payments. *
     */
    public readonly localUnsettledBalance?: CurrencyAmount | undefined,
    /** The channel balance on the remote node. **/
    public readonly remoteBalance?: CurrencyAmount | undefined,
    /**
     * The channel balance on the remote node that is currently allocated to in-progress payments.
     * *
     */
    public readonly remoteUnsettledBalance?: CurrencyAmount | undefined,
    /** The channel balance that is currently allocated to in-progress payments. **/
    public readonly unsettledBalance?: CurrencyAmount | undefined,
    /**
     * The total balance in this channel, including the channel balance on both local and remote
     * nodes. *
     */
    public readonly totalBalance?: CurrencyAmount | undefined,
    /** The current status of this channel. **/
    public readonly status?: ChannelStatus | undefined,
    /**
     * The estimated time to wait for the channel's hash timelock contract to expire when force
     * closing the channel. It is in unit of minutes.
     **/
    public readonly estimatedForceClosureWaitMinutes?: number | undefined,
    /** The amount to be paid in fees for the current set of commitment transactions. **/
    public readonly commitFee?: CurrencyAmount | undefined,
    /** The fees charged for routing payments through this channel. **/
    public readonly fees?: ChannelFees | undefined,
    /** If known, the remote node of the channel. **/
    public readonly remoteNodeId?: string | undefined,
    /**
     * The unique identifier of the channel on Lightning Network, which is the location in the
     * chain that the channel was confirmed. The format is <block-height>:<tx-index>:<tx-output>.
     **/
    public readonly shortChannelId?: string | undefined,
  ) {
    autoBind(this);
  }

  public async getUptimePercentage(
    client: LightsparkClient,
    afterDate: string | undefined = undefined,
    beforeDate: string | undefined = undefined,
  ): Promise<number> {
    return await client.executeRawQuery({
      queryPayload: ` 
query FetchChannelUptimePercentage($entity_id: ID!, $after_date: DateTime, $before_date: DateTime) {
    entity(id: $entity_id) {
        ... on Channel {
            uptime_percentage(, after_date: $after_date, before_date: $before_date)
        }
    }
}
`,
      variables: {
        entity_id: this.id,
        after_date: afterDate,
        before_date: beforeDate,
      },
      constructObject: (json) => {
        const connection = json["entity"]["uptime_percentage"];
        return connection;
      },
    });
  }

  public async getTransactions(
    client: LightsparkClient,
    types: TransactionType[] | undefined = undefined,
    afterDate: string | undefined = undefined,
    beforeDate: string | undefined = undefined,
  ): Promise<ChannelToTransactionsConnection> {
    return (await client.executeRawQuery({
      queryPayload: ` 
query FetchChannelToTransactionsConnection($entity_id: ID!, $types: [TransactionType!], $after_date: DateTime, $before_date: DateTime) {
    entity(id: $entity_id) {
        ... on Channel {
            transactions(, types: $types, after_date: $after_date, before_date: $before_date) {
                __typename
                channel_to_transactions_connection_count: count
                channel_to_transactions_connection_average_fee: average_fee {
                    __typename
                    currency_amount_original_value: original_value
                    currency_amount_original_unit: original_unit
                    currency_amount_preferred_currency_unit: preferred_currency_unit
                    currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                    currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                }
                channel_to_transactions_connection_total_amount_transacted: total_amount_transacted {
                    __typename
                    currency_amount_original_value: original_value
                    currency_amount_original_unit: original_unit
                    currency_amount_preferred_currency_unit: preferred_currency_unit
                    currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                    currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                }
                channel_to_transactions_connection_total_fees: total_fees {
                    __typename
                    currency_amount_original_value: original_value
                    currency_amount_original_unit: original_unit
                    currency_amount_preferred_currency_unit: preferred_currency_unit
                    currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                    currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                }
            }
        }
    }
}
`,
      variables: {
        entity_id: this.id,
        types: types,
        after_date: afterDate,
        before_date: beforeDate,
      },
      constructObject: (json) => {
        const connection = json["entity"]["transactions"];
        return ChannelToTransactionsConnectionFromJson(connection);
      },
    }))!;
  }

  static getChannelQuery(id: string): Query<Channel> {
    return {
      queryPayload: `
query GetChannel($id: ID!) {
    entity(id: $id) {
        ... on Channel {
            ...ChannelFragment
        }
    }
}

${FRAGMENT}    
`,
      variables: { id },
      constructObject: (data: any) => ChannelFromJson(data.entity),
    };
  }

  public toJson() {
    return {
      __typename: "Channel",
      channel_id: this.id,
      channel_created_at: this.createdAt,
      channel_updated_at: this.updatedAt,
      channel_funding_transaction:
        { id: this.fundingTransactionId } ?? undefined,
      channel_capacity: this.capacity
        ? CurrencyAmountToJson(this.capacity)
        : undefined,
      channel_local_balance: this.localBalance
        ? CurrencyAmountToJson(this.localBalance)
        : undefined,
      channel_local_unsettled_balance: this.localUnsettledBalance
        ? CurrencyAmountToJson(this.localUnsettledBalance)
        : undefined,
      channel_remote_balance: this.remoteBalance
        ? CurrencyAmountToJson(this.remoteBalance)
        : undefined,
      channel_remote_unsettled_balance: this.remoteUnsettledBalance
        ? CurrencyAmountToJson(this.remoteUnsettledBalance)
        : undefined,
      channel_unsettled_balance: this.unsettledBalance
        ? CurrencyAmountToJson(this.unsettledBalance)
        : undefined,
      channel_total_balance: this.totalBalance
        ? CurrencyAmountToJson(this.totalBalance)
        : undefined,
      channel_status: this.status,
      channel_estimated_force_closure_wait_minutes:
        this.estimatedForceClosureWaitMinutes,
      channel_commit_fee: this.commitFee
        ? CurrencyAmountToJson(this.commitFee)
        : undefined,
      channel_fees: this.fees ? ChannelFeesToJson(this.fees) : undefined,
      channel_remote_node: { id: this.remoteNodeId } ?? undefined,
      channel_local_node: { id: this.localNodeId },
      channel_short_channel_id: this.shortChannelId,
    };
  }
}

export const ChannelFromJson = (obj: any): Channel => {
  return new Channel(
    obj["channel_id"],
    obj["channel_created_at"],
    obj["channel_updated_at"],
    obj["channel_local_node"].id,
    "Channel",
    obj["channel_funding_transaction"]?.id ?? undefined,
    !!obj["channel_capacity"]
      ? CurrencyAmountFromJson(obj["channel_capacity"])
      : undefined,
    !!obj["channel_local_balance"]
      ? CurrencyAmountFromJson(obj["channel_local_balance"])
      : undefined,
    !!obj["channel_local_unsettled_balance"]
      ? CurrencyAmountFromJson(obj["channel_local_unsettled_balance"])
      : undefined,
    !!obj["channel_remote_balance"]
      ? CurrencyAmountFromJson(obj["channel_remote_balance"])
      : undefined,
    !!obj["channel_remote_unsettled_balance"]
      ? CurrencyAmountFromJson(obj["channel_remote_unsettled_balance"])
      : undefined,
    !!obj["channel_unsettled_balance"]
      ? CurrencyAmountFromJson(obj["channel_unsettled_balance"])
      : undefined,
    !!obj["channel_total_balance"]
      ? CurrencyAmountFromJson(obj["channel_total_balance"])
      : undefined,
    !!obj["channel_status"]
      ? ChannelStatus[obj["channel_status"]] ?? ChannelStatus.FUTURE_VALUE
      : null,
    obj["channel_estimated_force_closure_wait_minutes"],
    !!obj["channel_commit_fee"]
      ? CurrencyAmountFromJson(obj["channel_commit_fee"])
      : undefined,
    !!obj["channel_fees"]
      ? ChannelFeesFromJson(obj["channel_fees"])
      : undefined,
    obj["channel_remote_node"]?.id ?? undefined,
    obj["channel_short_channel_id"],
  );
};

export const FRAGMENT = `
fragment ChannelFragment on Channel {
    __typename
    channel_id: id
    channel_created_at: created_at
    channel_updated_at: updated_at
    channel_funding_transaction: funding_transaction {
        id
    }
    channel_capacity: capacity {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    channel_local_balance: local_balance {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    channel_local_unsettled_balance: local_unsettled_balance {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    channel_remote_balance: remote_balance {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    channel_remote_unsettled_balance: remote_unsettled_balance {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    channel_unsettled_balance: unsettled_balance {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    channel_total_balance: total_balance {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    channel_status: status
    channel_estimated_force_closure_wait_minutes: estimated_force_closure_wait_minutes
    channel_commit_fee: commit_fee {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    channel_fees: fees {
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
    }
    channel_remote_node: remote_node {
        id
    }
    channel_local_node: local_node {
        id
    }
    channel_short_channel_id: short_channel_id
}`;

export default Channel;
