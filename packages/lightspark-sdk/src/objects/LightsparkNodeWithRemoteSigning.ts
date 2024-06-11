// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query } from "@lightsparkdev/core";
import autoBind from "auto-bind";
import type LightsparkClient from "../client.js";
import type Balances from "./Balances.js";
import { BalancesFromJson, BalancesToJson } from "./Balances.js";
import BitcoinNetwork from "./BitcoinNetwork.js";
import type BlockchainBalance from "./BlockchainBalance.js";
import {
  BlockchainBalanceFromJson,
  BlockchainBalanceToJson,
} from "./BlockchainBalance.js";
import type ChannelStatus from "./ChannelStatus.js";
import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";
import type Entity from "./Entity.js";
import type LightningPaymentDirection from "./LightningPaymentDirection.js";
import type LightsparkNode from "./LightsparkNode.js";
import LightsparkNodeStatus from "./LightsparkNodeStatus.js";
import type LightsparkNodeToChannelsConnection from "./LightsparkNodeToChannelsConnection.js";
import { LightsparkNodeToChannelsConnectionFromJson } from "./LightsparkNodeToChannelsConnection.js";
import type LightsparkNodeToDailyLiquidityForecastsConnection from "./LightsparkNodeToDailyLiquidityForecastsConnection.js";
import { LightsparkNodeToDailyLiquidityForecastsConnectionFromJson } from "./LightsparkNodeToDailyLiquidityForecastsConnection.js";
import type Node from "./Node.js";
import type NodeAddressType from "./NodeAddressType.js";
import type NodeToAddressesConnection from "./NodeToAddressesConnection.js";
import { NodeToAddressesConnectionFromJson } from "./NodeToAddressesConnection.js";

/** This is a Lightspark node with remote signing. **/
class LightsparkNodeWithRemoteSigning implements LightsparkNode, Node, Entity {
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
    /** The Bitcoin Network this node is deployed in. **/
    public readonly bitcoinNetwork: BitcoinNetwork,
    /**
     * The name of this node in the network. It will be the most human-readable option possible,
     * depending on the data available for this node.
     **/
    public readonly displayName: string,
    /** The owner of this LightsparkNode. **/
    public readonly ownerId: string,
    /**
     * The utxos of the channels that are connected to this node. This is used in uma flow for
     * pre-screening.
     **/
    public readonly umaPrescreeningUtxos: string[],
    /** The typename of the object **/
    public readonly typename: string,
    /**
     * A name that identifies the node. It has no importance in terms of operating the node, it is
     * just a way to identify and search for commercial services or popular nodes. This alias can
     * be changed at any time by the node operator.
     **/
    public readonly alias?: string | undefined,
    /**
     * A hexadecimal string that describes a color. For example "#000000" is black, "#FFFFFF" is
     * white. It has no importance in terms of operating the node, it is just a way to visually
     * differentiate nodes. That color can be changed at any time by the node operator.
     **/
    public readonly color?: string | undefined,
    /**
     * A summary metric used to capture how well positioned a node is to send, receive, or route
     * transactions efficiently. Maximizing a node's conductivity helps a node’s transactions to be
     * capital efficient. The value is an integer ranging between 0 and 10 (bounds included).
     **/
    public readonly conductivity?: number | undefined,
    /**
     * The public key of this node. It acts as a unique identifier of this node in the Lightning
     * Network. *
     */
    public readonly publicKey?: string | undefined,
    /** The current status of this node. **/
    public readonly status?: LightsparkNodeStatus | undefined,
    /**
     * The sum of the balance on the Bitcoin Network, channel balances, and commit fees on this
     * node.
     *
     * @deprecated Use `balances` instead.
     **/
    public readonly totalBalance?: CurrencyAmount | undefined,
    /**
     * The total sum of the channel balances (online and offline) on this node.
     *
     * @deprecated Use `balances` instead.
     **/
    public readonly totalLocalBalance?: CurrencyAmount | undefined,
    /**
     * The sum of the channel balances (online only) that are available to send on this node.
     *
     * @deprecated Use `balances` instead.
     **/
    public readonly localBalance?: CurrencyAmount | undefined,
    /**
     * The sum of the channel balances that are available to receive on this node.
     *
     * @deprecated Use `balances` instead.
     **/
    public readonly remoteBalance?: CurrencyAmount | undefined,
    /**
     * The details of the balance of this node on the Bitcoin Network.
     *
     * @deprecated Use `balances` instead.
     **/
    public readonly blockchainBalance?: BlockchainBalance | undefined,
    /** The balances that describe the funds in this node. **/
    public readonly balances?: Balances | undefined,
  ) {
    autoBind(this);
  }

  public async getAddresses(
    client: LightsparkClient,
    first: number | undefined = undefined,
    types: NodeAddressType[] | undefined = undefined,
  ): Promise<NodeToAddressesConnection> {
    return (await client.executeRawQuery({
      queryPayload: ` 
query FetchNodeToAddressesConnection($entity_id: ID!, $first: Int, $types: [NodeAddressType!]) {
    entity(id: $entity_id) {
        ... on LightsparkNodeWithRemoteSigning {
            addresses(, first: $first, types: $types) {
                __typename
                node_to_addresses_connection_count: count
                node_to_addresses_connection_entities: entities {
                    __typename
                    node_address_address: address
                    node_address_type: type
                }
            }
        }
    }
}
`,
      variables: { entity_id: this.id, first: first, types: types },
      constructObject: (json) => {
        const connection = json["entity"]["addresses"];
        return NodeToAddressesConnectionFromJson(connection);
      },
    }))!;
  }

  public async getChannels(
    client: LightsparkClient,
    first: number | undefined = undefined,
    after: string | undefined = undefined,
    beforeDate: string | undefined = undefined,
    afterDate: string | undefined = undefined,
    statuses: ChannelStatus[] | undefined = undefined,
  ): Promise<LightsparkNodeToChannelsConnection> {
    return (await client.executeRawQuery({
      queryPayload: ` 
query FetchLightsparkNodeToChannelsConnection($entity_id: ID!, $first: Int, $after: String, $before_date: DateTime, $after_date: DateTime, $statuses: [ChannelStatus!]) {
    entity(id: $entity_id) {
        ... on LightsparkNodeWithRemoteSigning {
            channels(, first: $first, after: $after, before_date: $before_date, after_date: $after_date, statuses: $statuses) {
                __typename
                lightspark_node_to_channels_connection_count: count
                lightspark_node_to_channels_connection_page_info: page_info {
                    __typename
                    page_info_has_next_page: has_next_page
                    page_info_has_previous_page: has_previous_page
                    page_info_start_cursor: start_cursor
                    page_info_end_cursor: end_cursor
                }
                lightspark_node_to_channels_connection_entities: entities {
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
                }
            }
        }
    }
}
`,
      variables: {
        entity_id: this.id,
        first: first,
        after: after,
        before_date: beforeDate,
        after_date: afterDate,
        statuses: statuses,
      },
      constructObject: (json) => {
        const connection = json["entity"]["channels"];
        return LightsparkNodeToChannelsConnectionFromJson(connection);
      },
    }))!;
  }

  public async getDailyLiquidityForecasts(
    client: LightsparkClient,
    fromDate: string,
    toDate: string,
    direction: LightningPaymentDirection,
  ): Promise<LightsparkNodeToDailyLiquidityForecastsConnection> {
    return (await client.executeRawQuery({
      queryPayload: ` 
query FetchLightsparkNodeToDailyLiquidityForecastsConnection($entity_id: ID!, $from_date: Date!, $to_date: Date!, $direction: LightningPaymentDirection!) {
    entity(id: $entity_id) {
        ... on LightsparkNodeWithRemoteSigning {
            daily_liquidity_forecasts(, from_date: $from_date, to_date: $to_date, direction: $direction) {
                __typename
                lightspark_node_to_daily_liquidity_forecasts_connection_from_date: from_date
                lightspark_node_to_daily_liquidity_forecasts_connection_to_date: to_date
                lightspark_node_to_daily_liquidity_forecasts_connection_direction: direction
                lightspark_node_to_daily_liquidity_forecasts_connection_entities: entities {
                    __typename
                    daily_liquidity_forecast_date: date
                    daily_liquidity_forecast_direction: direction
                    daily_liquidity_forecast_amount: amount {
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
}
`,
      variables: {
        entity_id: this.id,
        from_date: fromDate,
        to_date: toDate,
        direction: direction,
      },
      constructObject: (json) => {
        const connection = json["entity"]["daily_liquidity_forecasts"];
        return LightsparkNodeToDailyLiquidityForecastsConnectionFromJson(
          connection,
        );
      },
    }))!;
  }

  static getLightsparkNodeWithRemoteSigningQuery(
    id: string,
  ): Query<LightsparkNodeWithRemoteSigning> {
    return {
      queryPayload: `
query GetLightsparkNodeWithRemoteSigning($id: ID!) {
    entity(id: $id) {
        ... on LightsparkNodeWithRemoteSigning {
            ...LightsparkNodeWithRemoteSigningFragment
        }
    }
}

${FRAGMENT}    
`,
      variables: { id },
      constructObject: (data: any) =>
        LightsparkNodeWithRemoteSigningFromJson(data.entity),
    };
  }

  public toJson() {
    return {
      __typename: "LightsparkNodeWithRemoteSigning",
      lightspark_node_with_remote_signing_id: this.id,
      lightspark_node_with_remote_signing_created_at: this.createdAt,
      lightspark_node_with_remote_signing_updated_at: this.updatedAt,
      lightspark_node_with_remote_signing_alias: this.alias,
      lightspark_node_with_remote_signing_bitcoin_network: this.bitcoinNetwork,
      lightspark_node_with_remote_signing_color: this.color,
      lightspark_node_with_remote_signing_conductivity: this.conductivity,
      lightspark_node_with_remote_signing_display_name: this.displayName,
      lightspark_node_with_remote_signing_public_key: this.publicKey,
      lightspark_node_with_remote_signing_owner: { id: this.ownerId },
      lightspark_node_with_remote_signing_status: this.status,
      lightspark_node_with_remote_signing_total_balance: this.totalBalance
        ? CurrencyAmountToJson(this.totalBalance)
        : undefined,
      lightspark_node_with_remote_signing_total_local_balance: this
        .totalLocalBalance
        ? CurrencyAmountToJson(this.totalLocalBalance)
        : undefined,
      lightspark_node_with_remote_signing_local_balance: this.localBalance
        ? CurrencyAmountToJson(this.localBalance)
        : undefined,
      lightspark_node_with_remote_signing_remote_balance: this.remoteBalance
        ? CurrencyAmountToJson(this.remoteBalance)
        : undefined,
      lightspark_node_with_remote_signing_blockchain_balance: this
        .blockchainBalance
        ? BlockchainBalanceToJson(this.blockchainBalance)
        : undefined,
      lightspark_node_with_remote_signing_uma_prescreening_utxos:
        this.umaPrescreeningUtxos,
      lightspark_node_with_remote_signing_balances: this.balances
        ? BalancesToJson(this.balances)
        : undefined,
    };
  }
}

export const LightsparkNodeWithRemoteSigningFromJson = (
  obj: any,
): LightsparkNodeWithRemoteSigning => {
  return new LightsparkNodeWithRemoteSigning(
    obj["lightspark_node_with_remote_signing_id"],
    obj["lightspark_node_with_remote_signing_created_at"],
    obj["lightspark_node_with_remote_signing_updated_at"],
    BitcoinNetwork[
      obj["lightspark_node_with_remote_signing_bitcoin_network"]
    ] ?? BitcoinNetwork.FUTURE_VALUE,
    obj["lightspark_node_with_remote_signing_display_name"],
    obj["lightspark_node_with_remote_signing_owner"].id,
    obj["lightspark_node_with_remote_signing_uma_prescreening_utxos"],
    "LightsparkNodeWithRemoteSigning",
    obj["lightspark_node_with_remote_signing_alias"],
    obj["lightspark_node_with_remote_signing_color"],
    obj["lightspark_node_with_remote_signing_conductivity"],
    obj["lightspark_node_with_remote_signing_public_key"],
    !!obj["lightspark_node_with_remote_signing_status"]
      ? LightsparkNodeStatus[
          obj["lightspark_node_with_remote_signing_status"]
        ] ?? LightsparkNodeStatus.FUTURE_VALUE
      : null,
    !!obj["lightspark_node_with_remote_signing_total_balance"]
      ? CurrencyAmountFromJson(
          obj["lightspark_node_with_remote_signing_total_balance"],
        )
      : undefined,
    !!obj["lightspark_node_with_remote_signing_total_local_balance"]
      ? CurrencyAmountFromJson(
          obj["lightspark_node_with_remote_signing_total_local_balance"],
        )
      : undefined,
    !!obj["lightspark_node_with_remote_signing_local_balance"]
      ? CurrencyAmountFromJson(
          obj["lightspark_node_with_remote_signing_local_balance"],
        )
      : undefined,
    !!obj["lightspark_node_with_remote_signing_remote_balance"]
      ? CurrencyAmountFromJson(
          obj["lightspark_node_with_remote_signing_remote_balance"],
        )
      : undefined,
    !!obj["lightspark_node_with_remote_signing_blockchain_balance"]
      ? BlockchainBalanceFromJson(
          obj["lightspark_node_with_remote_signing_blockchain_balance"],
        )
      : undefined,
    !!obj["lightspark_node_with_remote_signing_balances"]
      ? BalancesFromJson(obj["lightspark_node_with_remote_signing_balances"])
      : undefined,
  );
};

export const FRAGMENT = `
fragment LightsparkNodeWithRemoteSigningFragment on LightsparkNodeWithRemoteSigning {
    __typename
    lightspark_node_with_remote_signing_id: id
    lightspark_node_with_remote_signing_created_at: created_at
    lightspark_node_with_remote_signing_updated_at: updated_at
    lightspark_node_with_remote_signing_alias: alias
    lightspark_node_with_remote_signing_bitcoin_network: bitcoin_network
    lightspark_node_with_remote_signing_color: color
    lightspark_node_with_remote_signing_conductivity: conductivity
    lightspark_node_with_remote_signing_display_name: display_name
    lightspark_node_with_remote_signing_public_key: public_key
    lightspark_node_with_remote_signing_owner: owner {
        id
    }
    lightspark_node_with_remote_signing_status: status
    lightspark_node_with_remote_signing_total_balance: total_balance {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    lightspark_node_with_remote_signing_total_local_balance: total_local_balance {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    lightspark_node_with_remote_signing_local_balance: local_balance {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    lightspark_node_with_remote_signing_remote_balance: remote_balance {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    lightspark_node_with_remote_signing_blockchain_balance: blockchain_balance {
        __typename
        blockchain_balance_total_balance: total_balance {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        blockchain_balance_confirmed_balance: confirmed_balance {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        blockchain_balance_unconfirmed_balance: unconfirmed_balance {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        blockchain_balance_locked_balance: locked_balance {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        blockchain_balance_required_reserve: required_reserve {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        blockchain_balance_available_balance: available_balance {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
    }
    lightspark_node_with_remote_signing_uma_prescreening_utxos: uma_prescreening_utxos
    lightspark_node_with_remote_signing_balances: balances {
        __typename
        balances_owned_balance: owned_balance {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        balances_available_to_send_balance: available_to_send_balance {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        balances_available_to_withdraw_balance: available_to_withdraw_balance {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
    }
}`;

export default LightsparkNodeWithRemoteSigning;
