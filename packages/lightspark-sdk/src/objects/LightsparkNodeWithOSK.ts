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
import type LightsparkNode from "./LightsparkNode.js";
import LightsparkNodeStatus from "./LightsparkNodeStatus.js";
import type LightsparkNodeToChannelsConnection from "./LightsparkNodeToChannelsConnection.js";
import { LightsparkNodeToChannelsConnectionFromJson } from "./LightsparkNodeToChannelsConnection.js";
import type Node from "./Node.js";
import type NodeAddressType from "./NodeAddressType.js";
import type NodeToAddressesConnection from "./NodeToAddressesConnection.js";
import { NodeToAddressesConnectionFromJson } from "./NodeToAddressesConnection.js";
import type Secret from "./Secret.js";
import { SecretFromJson, SecretToJson } from "./Secret.js";

/** This is a Lightspark node with OSK. **/
class LightsparkNodeWithOSK implements LightsparkNode, Node, Entity {
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
    /**
     * The private key client is using to sign a GraphQL request which will be verified at server
     * side. *
     */
    public readonly encryptedSigningPrivateKey?: Secret | undefined,
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
        ... on LightsparkNodeWithOSK {
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
    statuses: ChannelStatus[] | undefined = undefined,
    after: string | undefined = undefined,
  ): Promise<LightsparkNodeToChannelsConnection> {
    return (await client.executeRawQuery({
      queryPayload: ` 
query FetchLightsparkNodeToChannelsConnection($entity_id: ID!, $first: Int, $statuses: [ChannelStatus!], $after: String) {
    entity(id: $entity_id) {
        ... on LightsparkNodeWithOSK {
            channels(, first: $first, statuses: $statuses, after: $after) {
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
        statuses: statuses,
        after: after,
      },
      constructObject: (json) => {
        const connection = json["entity"]["channels"];
        return LightsparkNodeToChannelsConnectionFromJson(connection);
      },
    }))!;
  }

  static getLightsparkNodeWithOSKQuery(
    id: string,
  ): Query<LightsparkNodeWithOSK> {
    return {
      queryPayload: `
query GetLightsparkNodeWithOSK($id: ID!) {
    entity(id: $id) {
        ... on LightsparkNodeWithOSK {
            ...LightsparkNodeWithOSKFragment
        }
    }
}

${FRAGMENT}    
`,
      variables: { id },
      constructObject: (data: any) =>
        LightsparkNodeWithOSKFromJson(data.entity),
    };
  }

  public toJson() {
    return {
      __typename: "LightsparkNodeWithOSK",
      lightspark_node_with_o_s_k_id: this.id,
      lightspark_node_with_o_s_k_created_at: this.createdAt,
      lightspark_node_with_o_s_k_updated_at: this.updatedAt,
      lightspark_node_with_o_s_k_alias: this.alias,
      lightspark_node_with_o_s_k_bitcoin_network: this.bitcoinNetwork,
      lightspark_node_with_o_s_k_color: this.color,
      lightspark_node_with_o_s_k_conductivity: this.conductivity,
      lightspark_node_with_o_s_k_display_name: this.displayName,
      lightspark_node_with_o_s_k_public_key: this.publicKey,
      lightspark_node_with_o_s_k_owner: { id: this.ownerId },
      lightspark_node_with_o_s_k_status: this.status,
      lightspark_node_with_o_s_k_total_balance: this.totalBalance
        ? CurrencyAmountToJson(this.totalBalance)
        : undefined,
      lightspark_node_with_o_s_k_total_local_balance: this.totalLocalBalance
        ? CurrencyAmountToJson(this.totalLocalBalance)
        : undefined,
      lightspark_node_with_o_s_k_local_balance: this.localBalance
        ? CurrencyAmountToJson(this.localBalance)
        : undefined,
      lightspark_node_with_o_s_k_remote_balance: this.remoteBalance
        ? CurrencyAmountToJson(this.remoteBalance)
        : undefined,
      lightspark_node_with_o_s_k_blockchain_balance: this.blockchainBalance
        ? BlockchainBalanceToJson(this.blockchainBalance)
        : undefined,
      lightspark_node_with_o_s_k_uma_prescreening_utxos:
        this.umaPrescreeningUtxos,
      lightspark_node_with_o_s_k_balances: this.balances
        ? BalancesToJson(this.balances)
        : undefined,
      lightspark_node_with_o_s_k_encrypted_signing_private_key: this
        .encryptedSigningPrivateKey
        ? SecretToJson(this.encryptedSigningPrivateKey)
        : undefined,
    };
  }
}

export const LightsparkNodeWithOSKFromJson = (
  obj: any,
): LightsparkNodeWithOSK => {
  return new LightsparkNodeWithOSK(
    obj["lightspark_node_with_o_s_k_id"],
    obj["lightspark_node_with_o_s_k_created_at"],
    obj["lightspark_node_with_o_s_k_updated_at"],
    BitcoinNetwork[obj["lightspark_node_with_o_s_k_bitcoin_network"]] ??
      BitcoinNetwork.FUTURE_VALUE,
    obj["lightspark_node_with_o_s_k_display_name"],
    obj["lightspark_node_with_o_s_k_owner"].id,
    obj["lightspark_node_with_o_s_k_uma_prescreening_utxos"],
    "LightsparkNodeWithOSK",
    obj["lightspark_node_with_o_s_k_alias"],
    obj["lightspark_node_with_o_s_k_color"],
    obj["lightspark_node_with_o_s_k_conductivity"],
    obj["lightspark_node_with_o_s_k_public_key"],
    !!obj["lightspark_node_with_o_s_k_status"]
      ? LightsparkNodeStatus[obj["lightspark_node_with_o_s_k_status"]] ??
        LightsparkNodeStatus.FUTURE_VALUE
      : null,
    !!obj["lightspark_node_with_o_s_k_total_balance"]
      ? CurrencyAmountFromJson(obj["lightspark_node_with_o_s_k_total_balance"])
      : undefined,
    !!obj["lightspark_node_with_o_s_k_total_local_balance"]
      ? CurrencyAmountFromJson(
          obj["lightspark_node_with_o_s_k_total_local_balance"],
        )
      : undefined,
    !!obj["lightspark_node_with_o_s_k_local_balance"]
      ? CurrencyAmountFromJson(obj["lightspark_node_with_o_s_k_local_balance"])
      : undefined,
    !!obj["lightspark_node_with_o_s_k_remote_balance"]
      ? CurrencyAmountFromJson(obj["lightspark_node_with_o_s_k_remote_balance"])
      : undefined,
    !!obj["lightspark_node_with_o_s_k_blockchain_balance"]
      ? BlockchainBalanceFromJson(
          obj["lightspark_node_with_o_s_k_blockchain_balance"],
        )
      : undefined,
    !!obj["lightspark_node_with_o_s_k_balances"]
      ? BalancesFromJson(obj["lightspark_node_with_o_s_k_balances"])
      : undefined,
    !!obj["lightspark_node_with_o_s_k_encrypted_signing_private_key"]
      ? SecretFromJson(
          obj["lightspark_node_with_o_s_k_encrypted_signing_private_key"],
        )
      : undefined,
  );
};

export const FRAGMENT = `
fragment LightsparkNodeWithOSKFragment on LightsparkNodeWithOSK {
    __typename
    lightspark_node_with_o_s_k_id: id
    lightspark_node_with_o_s_k_created_at: created_at
    lightspark_node_with_o_s_k_updated_at: updated_at
    lightspark_node_with_o_s_k_alias: alias
    lightspark_node_with_o_s_k_bitcoin_network: bitcoin_network
    lightspark_node_with_o_s_k_color: color
    lightspark_node_with_o_s_k_conductivity: conductivity
    lightspark_node_with_o_s_k_display_name: display_name
    lightspark_node_with_o_s_k_public_key: public_key
    lightspark_node_with_o_s_k_owner: owner {
        id
    }
    lightspark_node_with_o_s_k_status: status
    lightspark_node_with_o_s_k_total_balance: total_balance {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    lightspark_node_with_o_s_k_total_local_balance: total_local_balance {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    lightspark_node_with_o_s_k_local_balance: local_balance {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    lightspark_node_with_o_s_k_remote_balance: remote_balance {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    lightspark_node_with_o_s_k_blockchain_balance: blockchain_balance {
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
    lightspark_node_with_o_s_k_uma_prescreening_utxos: uma_prescreening_utxos
    lightspark_node_with_o_s_k_balances: balances {
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
    lightspark_node_with_o_s_k_encrypted_signing_private_key: encrypted_signing_private_key {
        __typename
        secret_encrypted_value: encrypted_value
        secret_cipher: cipher
    }
}`;

export default LightsparkNodeWithOSK;
