// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import autoBind from "auto-bind";
import LightsparkClient from "../client.js";
import Query from "../requester/Query.js";
import BitcoinNetwork from "./BitcoinNetwork.js";
import BlockchainBalance, {
  BlockchainBalanceFromJson,
} from "./BlockchainBalance.js";
import Channel, { ChannelFromJson } from "./Channel.js";
import ChannelStatus from "./ChannelStatus.js";
import CurrencyAmount, { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import Key, { KeyFromJson } from "./Key.js";
import LightsparkNodePurpose from "./LightsparkNodePurpose.js";
import LightsparkNodeStatus from "./LightsparkNodeStatus.js";
import LightsparkNodeToChannelsConnection, {
  LightsparkNodeToChannelsConnectionFromJson,
} from "./LightsparkNodeToChannelsConnection.js";
import Node from "./Node.js";
import NodeAddressType from "./NodeAddressType.js";
import NodeToAddressesConnection, {
  NodeToAddressesConnectionFromJson,
} from "./NodeToAddressesConnection.js";
import Secret, { SecretFromJson } from "./Secret.js";

/** This is a node that is managed by Lightspark and is managed within the current connected account. It contains many details about the node configuration, state, and metadata. **/
class LightsparkNode implements Node {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly bitcoinNetwork: BitcoinNetwork,
    public readonly displayName: string,
    public readonly accountId: string,
    public readonly name: string,
    public readonly upgradeAvailable: boolean,
    public readonly hasChannelFundingOp: boolean,
    public readonly typename: string,
    public readonly alias?: string,
    public readonly color?: string,
    public readonly conductivity?: number,
    public readonly publicKey?: string,
    public readonly blockchainBalance?: BlockchainBalance,
    public readonly encryptedAdminMacaroon?: Secret,
    public readonly encryptedSigningPrivateKey?: Secret,
    public readonly encryptionPublicKey?: Key,
    public readonly grpcHostname?: string,
    public readonly localBalance?: CurrencyAmount,
    public readonly purpose?: LightsparkNodePurpose,
    public readonly remoteBalance?: CurrencyAmount,
    public readonly restUrl?: string,
    public readonly status?: LightsparkNodeStatus
  ) {
    autoBind(this);
  }

  public async getAddresses(
    client: LightsparkClient,
    first: number | undefined = undefined,
    types: NodeAddressType[] | undefined = undefined
  ): Promise<NodeToAddressesConnection> {
    return (await client.executeRawQuery({
      queryPayload: ` 
query FetchNodeToAddressesConnection($entity_id: ID!, $first: Int, $types: [NodeAddressType!]) {
    entity(id: $entity_id) {
        ... on LightsparkNode {
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

  public async getChannelFromPoint(
    client: LightsparkClient,
    channelPoint: string
  ): Promise<Channel | null> {
    return await client.executeRawQuery({
      queryPayload: ` 
query FetchLightsparkNodeChannelFromPoint($entity_id: ID!, $channel_point: String!) {
    entity(id: $entity_id) {
        ... on LightsparkNode {
            channel_from_point(, channel_point: $channel_point) {
                __typename
                channel_id: id
                channel_created_at: created_at
                channel_updated_at: updated_at
                channel_channel_point: channel_point
                channel_funding_transaction: funding_transaction {
                    __typename
                    channel_opening_transaction_id: id
                    channel_opening_transaction_created_at: created_at
                    channel_opening_transaction_updated_at: updated_at
                    channel_opening_transaction_status: status
                    channel_opening_transaction_resolved_at: resolved_at
                    channel_opening_transaction_amount: amount {
                        __typename
                        currency_amount_value: value
                        currency_amount_unit: unit
                    }
                    channel_opening_transaction_transaction_hash: transaction_hash
                    channel_opening_transaction_fees: fees {
                        __typename
                        currency_amount_value: value
                        currency_amount_unit: unit
                    }
                    channel_opening_transaction_block_hash: block_hash
                    channel_opening_transaction_block_height: block_height
                    channel_opening_transaction_destination_addresses: destination_addresses
                    channel_opening_transaction_num_confirmations: num_confirmations
                    channel_opening_transaction_channel: channel {
                        id
                    }
                }
                channel_capacity: capacity {
                    __typename
                    currency_amount_value: value
                    currency_amount_unit: unit
                }
                channel_local_balance: local_balance {
                    __typename
                    currency_amount_value: value
                    currency_amount_unit: unit
                }
                channel_local_unsettled_balance: local_unsettled_balance {
                    __typename
                    currency_amount_value: value
                    currency_amount_unit: unit
                }
                channel_remote_balance: remote_balance {
                    __typename
                    currency_amount_value: value
                    currency_amount_unit: unit
                }
                channel_remote_unsettled_balance: remote_unsettled_balance {
                    __typename
                    currency_amount_value: value
                    currency_amount_unit: unit
                }
                channel_unsettled_balance: unsettled_balance {
                    __typename
                    currency_amount_value: value
                    currency_amount_unit: unit
                }
                channel_total_balance: total_balance {
                    __typename
                    currency_amount_value: value
                    currency_amount_unit: unit
                }
                channel_status: status
                channel_estimated_force_closure_wait_minutes: estimated_force_closure_wait_minutes
                channel_fees: fees {
                    __typename
                    channel_fees_base_fee: base_fee {
                        __typename
                        currency_amount_value: value
                        currency_amount_unit: unit
                    }
                    channel_fees_fee_rate_per_mil: fee_rate_per_mil
                }
                channel_remote_node: remote_node {
                    __typename
                    ... on LightsparkNode {
                        __typename
                        lightspark_node_id: id
                        lightspark_node_created_at: created_at
                        lightspark_node_updated_at: updated_at
                        lightspark_node_alias: alias
                        lightspark_node_bitcoin_network: bitcoin_network
                        lightspark_node_color: color
                        lightspark_node_conductivity: conductivity
                        lightspark_node_display_name: display_name
                        lightspark_node_public_key: public_key
                        lightspark_node_account: account {
                            id
                        }
                        lightspark_node_blockchain_balance: blockchain_balance {
                            __typename
                            blockchain_balance_total_balance: total_balance {
                                __typename
                                currency_amount_value: value
                                currency_amount_unit: unit
                            }
                            blockchain_balance_confirmed_balance: confirmed_balance {
                                __typename
                                currency_amount_value: value
                                currency_amount_unit: unit
                            }
                            blockchain_balance_unconfirmed_balance: unconfirmed_balance {
                                __typename
                                currency_amount_value: value
                                currency_amount_unit: unit
                            }
                            blockchain_balance_locked_balance: locked_balance {
                                __typename
                                currency_amount_value: value
                                currency_amount_unit: unit
                            }
                            blockchain_balance_required_reserve: required_reserve {
                                __typename
                                currency_amount_value: value
                                currency_amount_unit: unit
                            }
                            blockchain_balance_available_balance: available_balance {
                                __typename
                                currency_amount_value: value
                                currency_amount_unit: unit
                            }
                        }
                        lightspark_node_encrypted_admin_macaroon: encrypted_admin_macaroon {
                            __typename
                            secret_encrypted_value: encrypted_value
                            secret_cipher: cipher
                        }
                        lightspark_node_encrypted_signing_private_key: encrypted_signing_private_key {
                            __typename
                            secret_encrypted_value: encrypted_value
                            secret_cipher: cipher
                        }
                        lightspark_node_encryption_public_key: encryption_public_key {
                            __typename
                            key_type: type
                            key_public_key: public_key
                        }
                        lightspark_node_grpc_hostname: grpc_hostname
                        lightspark_node_local_balance: local_balance {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                        lightspark_node_name: name
                        lightspark_node_purpose: purpose
                        lightspark_node_remote_balance: remote_balance {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                        lightspark_node_rest_url: rest_url
                        lightspark_node_status: status
                        lightspark_node_upgrade_available: upgrade_available
                        lightspark_node_has_channel_funding_op: has_channel_funding_op
                    }
                    ... on GraphNode {
                        __typename
                        graph_node_id: id
                        graph_node_created_at: created_at
                        graph_node_updated_at: updated_at
                        graph_node_alias: alias
                        graph_node_bitcoin_network: bitcoin_network
                        graph_node_color: color
                        graph_node_conductivity: conductivity
                        graph_node_display_name: display_name
                        graph_node_public_key: public_key
                    }
                }
                channel_local_node: local_node {
                    __typename
                    lightspark_node_id: id
                    lightspark_node_created_at: created_at
                    lightspark_node_updated_at: updated_at
                    lightspark_node_alias: alias
                    lightspark_node_bitcoin_network: bitcoin_network
                    lightspark_node_color: color
                    lightspark_node_conductivity: conductivity
                    lightspark_node_display_name: display_name
                    lightspark_node_public_key: public_key
                    lightspark_node_account: account {
                        id
                    }
                    lightspark_node_blockchain_balance: blockchain_balance {
                        __typename
                        blockchain_balance_total_balance: total_balance {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                        blockchain_balance_confirmed_balance: confirmed_balance {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                        blockchain_balance_unconfirmed_balance: unconfirmed_balance {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                        blockchain_balance_locked_balance: locked_balance {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                        blockchain_balance_required_reserve: required_reserve {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                        blockchain_balance_available_balance: available_balance {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                    }
                    lightspark_node_encrypted_admin_macaroon: encrypted_admin_macaroon {
                        __typename
                        secret_encrypted_value: encrypted_value
                        secret_cipher: cipher
                    }
                    lightspark_node_encrypted_signing_private_key: encrypted_signing_private_key {
                        __typename
                        secret_encrypted_value: encrypted_value
                        secret_cipher: cipher
                    }
                    lightspark_node_encryption_public_key: encryption_public_key {
                        __typename
                        key_type: type
                        key_public_key: public_key
                    }
                    lightspark_node_grpc_hostname: grpc_hostname
                    lightspark_node_local_balance: local_balance {
                        __typename
                        currency_amount_value: value
                        currency_amount_unit: unit
                    }
                    lightspark_node_name: name
                    lightspark_node_purpose: purpose
                    lightspark_node_remote_balance: remote_balance {
                        __typename
                        currency_amount_value: value
                        currency_amount_unit: unit
                    }
                    lightspark_node_rest_url: rest_url
                    lightspark_node_status: status
                    lightspark_node_upgrade_available: upgrade_available
                    lightspark_node_has_channel_funding_op: has_channel_funding_op
                }
                channel_short_channel_id: short_channel_id
            }
        }
    }
}
`,
      variables: { entity_id: this.id, channel_point: channelPoint },
      constructObject: (json) => {
        const connection = json["entity"]["channel_from_point"];
        return !!connection ? ChannelFromJson(connection) : null;
      },
    });
  }

  public async getChannels(
    client: LightsparkClient,
    first: number | undefined = undefined,
    statuses: ChannelStatus[] | undefined = undefined
  ): Promise<LightsparkNodeToChannelsConnection> {
    return (await client.executeRawQuery({
      queryPayload: ` 
query FetchLightsparkNodeToChannelsConnection($entity_id: ID!, $first: Int, $statuses: [ChannelStatus!]) {
    entity(id: $entity_id) {
        ... on LightsparkNode {
            channels(, first: $first, statuses: $statuses) {
                __typename
                lightspark_node_to_channels_connection_page_info: page_info {
                    __typename
                    page_info_has_next_page: has_next_page
                    page_info_has_previous_page: has_previous_page
                    page_info_start_cursor: start_cursor
                    page_info_end_cursor: end_cursor
                }
                lightspark_node_to_channels_connection_count: count
                lightspark_node_to_channels_connection_entities: entities {
                    __typename
                    channel_id: id
                    channel_created_at: created_at
                    channel_updated_at: updated_at
                    channel_channel_point: channel_point
                    channel_funding_transaction: funding_transaction {
                        id
                    }
                    channel_capacity: capacity {
                        __typename
                        currency_amount_value: value
                        currency_amount_unit: unit
                    }
                    channel_local_balance: local_balance {
                        __typename
                        currency_amount_value: value
                        currency_amount_unit: unit
                    }
                    channel_local_unsettled_balance: local_unsettled_balance {
                        __typename
                        currency_amount_value: value
                        currency_amount_unit: unit
                    }
                    channel_remote_balance: remote_balance {
                        __typename
                        currency_amount_value: value
                        currency_amount_unit: unit
                    }
                    channel_remote_unsettled_balance: remote_unsettled_balance {
                        __typename
                        currency_amount_value: value
                        currency_amount_unit: unit
                    }
                    channel_unsettled_balance: unsettled_balance {
                        __typename
                        currency_amount_value: value
                        currency_amount_unit: unit
                    }
                    channel_total_balance: total_balance {
                        __typename
                        currency_amount_value: value
                        currency_amount_unit: unit
                    }
                    channel_status: status
                    channel_estimated_force_closure_wait_minutes: estimated_force_closure_wait_minutes
                    channel_fees: fees {
                        __typename
                        channel_fees_base_fee: base_fee {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
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
      variables: { entity_id: this.id, first: first, statuses: statuses },
      constructObject: (json) => {
        const connection = json["entity"]["channels"];
        return LightsparkNodeToChannelsConnectionFromJson(connection);
      },
    }))!;
  }

  static getLightsparkNodeQuery(id: string): Query<LightsparkNode> {
    return {
      queryPayload: `
query GetLightsparkNode($id: ID!) {
    entity(id: $id) {
        ... on LightsparkNode {
            ...LightsparkNodeFragment
        }
    }
}

${FRAGMENT}    
`,
      variables: { id },
      constructObject: (data: any) => LightsparkNodeFromJson(data.entity),
    };
  }
}

export const LightsparkNodeFromJson = (obj: any): LightsparkNode => {
  return new LightsparkNode(
    obj["lightspark_node_id"],
    obj["lightspark_node_created_at"],
    obj["lightspark_node_updated_at"],
    BitcoinNetwork[obj["lightspark_node_bitcoin_network"]],
    obj["lightspark_node_display_name"],
    obj["lightspark_node_account"].id,
    obj["lightspark_node_name"],
    obj["lightspark_node_upgrade_available"],
    obj["lightspark_node_has_channel_funding_op"],
    "LightsparkNode",
    obj["lightspark_node_alias"],
    obj["lightspark_node_color"],
    obj["lightspark_node_conductivity"],
    obj["lightspark_node_public_key"],
    !!obj["lightspark_node_blockchain_balance"]
      ? BlockchainBalanceFromJson(obj["lightspark_node_blockchain_balance"])
      : undefined,
    !!obj["lightspark_node_encrypted_admin_macaroon"]
      ? SecretFromJson(obj["lightspark_node_encrypted_admin_macaroon"])
      : undefined,
    !!obj["lightspark_node_encrypted_signing_private_key"]
      ? SecretFromJson(obj["lightspark_node_encrypted_signing_private_key"])
      : undefined,
    !!obj["lightspark_node_encryption_public_key"]
      ? KeyFromJson(obj["lightspark_node_encryption_public_key"])
      : undefined,
    obj["lightspark_node_grpc_hostname"],
    !!obj["lightspark_node_local_balance"]
      ? CurrencyAmountFromJson(obj["lightspark_node_local_balance"])
      : undefined,
    LightsparkNodePurpose[obj["lightspark_node_purpose"]] ?? null,
    !!obj["lightspark_node_remote_balance"]
      ? CurrencyAmountFromJson(obj["lightspark_node_remote_balance"])
      : undefined,
    obj["lightspark_node_rest_url"],
    LightsparkNodeStatus[obj["lightspark_node_status"]] ?? null
  );
};

export const FRAGMENT = `
fragment LightsparkNodeFragment on LightsparkNode {
    __typename
    lightspark_node_id: id
    lightspark_node_created_at: created_at
    lightspark_node_updated_at: updated_at
    lightspark_node_alias: alias
    lightspark_node_bitcoin_network: bitcoin_network
    lightspark_node_color: color
    lightspark_node_conductivity: conductivity
    lightspark_node_display_name: display_name
    lightspark_node_public_key: public_key
    lightspark_node_account: account {
        id
    }
    lightspark_node_blockchain_balance: blockchain_balance {
        __typename
        blockchain_balance_total_balance: total_balance {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        blockchain_balance_confirmed_balance: confirmed_balance {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        blockchain_balance_unconfirmed_balance: unconfirmed_balance {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        blockchain_balance_locked_balance: locked_balance {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        blockchain_balance_required_reserve: required_reserve {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
        blockchain_balance_available_balance: available_balance {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
        }
    }
    lightspark_node_encrypted_admin_macaroon: encrypted_admin_macaroon {
        __typename
        secret_encrypted_value: encrypted_value
        secret_cipher: cipher
    }
    lightspark_node_encrypted_signing_private_key: encrypted_signing_private_key {
        __typename
        secret_encrypted_value: encrypted_value
        secret_cipher: cipher
    }
    lightspark_node_encryption_public_key: encryption_public_key {
        __typename
        key_type: type
        key_public_key: public_key
    }
    lightspark_node_grpc_hostname: grpc_hostname
    lightspark_node_local_balance: local_balance {
        __typename
        currency_amount_value: value
        currency_amount_unit: unit
    }
    lightspark_node_name: name
    lightspark_node_purpose: purpose
    lightspark_node_remote_balance: remote_balance {
        __typename
        currency_amount_value: value
        currency_amount_unit: unit
    }
    lightspark_node_rest_url: rest_url
    lightspark_node_status: status
    lightspark_node_upgrade_available: upgrade_available
    lightspark_node_has_channel_funding_op: has_channel_funding_op
}`;

export default LightsparkNode;
