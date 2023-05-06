// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { Query } from "@lightsparkdev/core";
import autoBind from "auto-bind";
import LightsparkClient from "../client.js";
import ChannelFees, { ChannelFeesFromJson } from "./ChannelFees.js";
import ChannelStatus from "./ChannelStatus.js";
import ChannelToTransactionsConnection, {
  ChannelToTransactionsConnectionFromJson,
} from "./ChannelToTransactionsConnection.js";
import CurrencyAmount, { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import Entity from "./Entity.js";
import TransactionType from "./TransactionType.js";

/** An object that represents a payment channel between two nodes in the Lightning Network. **/
class Channel implements Entity {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly localNodeId: string,
    public readonly typename: string,
    public readonly fundingTransactionId?: string,
    public readonly capacity?: CurrencyAmount,
    public readonly localBalance?: CurrencyAmount,
    public readonly localUnsettledBalance?: CurrencyAmount,
    public readonly remoteBalance?: CurrencyAmount,
    public readonly remoteUnsettledBalance?: CurrencyAmount,
    public readonly unsettledBalance?: CurrencyAmount,
    public readonly totalBalance?: CurrencyAmount,
    public readonly status?: ChannelStatus,
    public readonly estimatedForceClosureWaitMinutes?: number,
    public readonly commitFee?: CurrencyAmount,
    public readonly fees?: ChannelFees,
    public readonly remoteNodeId?: string,
    public readonly shortChannelId?: string
  ) {
    autoBind(this);
  }

  public async getUptimePercentage(
    client: LightsparkClient,
    afterDate: string | undefined = undefined,
    beforeDate: string | undefined = undefined
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
    beforeDate: string | undefined = undefined
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
    obj["channel_short_channel_id"]
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
