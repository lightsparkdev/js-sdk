// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query } from "@lightsparkdev/core";
import autoBind from "auto-bind";
import type LightsparkClient from "../client.js";
import type Balances from "./Balances.js";
import { BalancesFromJson } from "./Balances.js";
import BitcoinNetwork from "./BitcoinNetwork.js";
import type BlockchainBalance from "./BlockchainBalance.js";
import { BlockchainBalanceFromJson } from "./BlockchainBalance.js";
import type ChannelStatus from "./ChannelStatus.js";
import type CurrencyAmount from "./CurrencyAmount.js";
import { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import type LightsparkNode from "./LightsparkNode.js";
import LightsparkNodeStatus from "./LightsparkNodeStatus.js";
import type LightsparkNodeToChannelsConnection from "./LightsparkNodeToChannelsConnection.js";
import { LightsparkNodeToChannelsConnectionFromJson } from "./LightsparkNodeToChannelsConnection.js";
import type NodeAddressType from "./NodeAddressType.js";
import type NodeToAddressesConnection from "./NodeToAddressesConnection.js";
import { NodeToAddressesConnectionFromJson } from "./NodeToAddressesConnection.js";
import type Secret from "./Secret.js";
import { SecretFromJson } from "./Secret.js";

/** This is a Lightspark node with OSK. **/
class LightsparkNodeWithOSK implements LightsparkNode {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly bitcoinNetwork: BitcoinNetwork,
    public readonly displayName: string,
    public readonly ownerId: string,
    public readonly umaPrescreeningUtxos: string[],
    public readonly typename: string,
    public readonly alias?: string,
    public readonly color?: string,
    public readonly conductivity?: number,
    public readonly publicKey?: string,
    public readonly status?: LightsparkNodeStatus,
    public readonly totalBalance?: CurrencyAmount,
    public readonly totalLocalBalance?: CurrencyAmount,
    public readonly localBalance?: CurrencyAmount,
    public readonly remoteBalance?: CurrencyAmount,
    public readonly blockchainBalance?: BlockchainBalance,
    public readonly balances?: Balances,
    public readonly encryptedSigningPrivateKey?: Secret,
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
