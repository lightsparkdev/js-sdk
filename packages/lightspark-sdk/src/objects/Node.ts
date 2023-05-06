// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { LightsparkException, Query } from "@lightsparkdev/core";
import autoBind from "auto-bind";
import LightsparkClient from "../client.js";
import BitcoinNetwork from "./BitcoinNetwork.js";
import { BlockchainBalanceFromJson } from "./BlockchainBalance.js";
import { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import Entity from "./Entity.js";
import GraphNode from "./GraphNode.js";
import LightsparkNode from "./LightsparkNode.js";
import LightsparkNodePurpose from "./LightsparkNodePurpose.js";
import LightsparkNodeStatus from "./LightsparkNodeStatus.js";
import NodeAddressType from "./NodeAddressType.js";
import NodeToAddressesConnection, {
  NodeToAddressesConnectionFromJson,
} from "./NodeToAddressesConnection.js";
import { SecretFromJson } from "./Secret.js";

/** This interface represents a lightning node that can be connected to the Lightning Network to send and receive transactions. **/
class Node implements Entity {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly bitcoinNetwork: BitcoinNetwork,
    public readonly displayName: string,
    public readonly typename: string,
    public readonly alias?: string,
    public readonly color?: string,
    public readonly conductivity?: number,
    public readonly publicKey?: string
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
        ... on Node {
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

  static getNodeQuery(id: string): Query<Node> {
    return {
      queryPayload: `
query GetNode($id: ID!) {
    entity(id: $id) {
        ... on Node {
            ...NodeFragment
        }
    }
}

${FRAGMENT}    
`,
      variables: { id },
      constructObject: (data: any) => NodeFromJson(data.entity),
    };
  }
}

export const NodeFromJson = (obj: any): Node => {
  if (obj["__typename"] == "GraphNode") {
    return new GraphNode(
      obj["graph_node_id"],
      obj["graph_node_created_at"],
      obj["graph_node_updated_at"],
      BitcoinNetwork[obj["graph_node_bitcoin_network"]] ??
        BitcoinNetwork.FUTURE_VALUE,
      obj["graph_node_display_name"],
      "GraphNode",
      obj["graph_node_alias"],
      obj["graph_node_color"],
      obj["graph_node_conductivity"],
      obj["graph_node_public_key"]
    );
  }
  if (obj["__typename"] == "LightsparkNode") {
    return new LightsparkNode(
      obj["lightspark_node_id"],
      obj["lightspark_node_created_at"],
      obj["lightspark_node_updated_at"],
      BitcoinNetwork[obj["lightspark_node_bitcoin_network"]] ??
        BitcoinNetwork.FUTURE_VALUE,
      obj["lightspark_node_display_name"],
      obj["lightspark_node_account"].id,
      "LightsparkNode",
      obj["lightspark_node_alias"],
      obj["lightspark_node_color"],
      obj["lightspark_node_conductivity"],
      obj["lightspark_node_public_key"],
      !!obj["lightspark_node_blockchain_balance"]
        ? BlockchainBalanceFromJson(obj["lightspark_node_blockchain_balance"])
        : undefined,
      !!obj["lightspark_node_encrypted_signing_private_key"]
        ? SecretFromJson(obj["lightspark_node_encrypted_signing_private_key"])
        : undefined,
      !!obj["lightspark_node_total_balance"]
        ? CurrencyAmountFromJson(obj["lightspark_node_total_balance"])
        : undefined,
      !!obj["lightspark_node_total_local_balance"]
        ? CurrencyAmountFromJson(obj["lightspark_node_total_local_balance"])
        : undefined,
      !!obj["lightspark_node_local_balance"]
        ? CurrencyAmountFromJson(obj["lightspark_node_local_balance"])
        : undefined,
      !!obj["lightspark_node_purpose"]
        ? LightsparkNodePurpose[obj["lightspark_node_purpose"]] ??
          LightsparkNodePurpose.FUTURE_VALUE
        : null,
      !!obj["lightspark_node_remote_balance"]
        ? CurrencyAmountFromJson(obj["lightspark_node_remote_balance"])
        : undefined,
      !!obj["lightspark_node_status"]
        ? LightsparkNodeStatus[obj["lightspark_node_status"]] ??
          LightsparkNodeStatus.FUTURE_VALUE
        : null
    );
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface Node corresponding to the typename=${obj["__typename"]}`
  );
};

export const FRAGMENT = `
fragment NodeFragment on Node {
    __typename
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
        lightspark_node_encrypted_signing_private_key: encrypted_signing_private_key {
            __typename
            secret_encrypted_value: encrypted_value
            secret_cipher: cipher
        }
        lightspark_node_total_balance: total_balance {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        lightspark_node_total_local_balance: total_local_balance {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        lightspark_node_local_balance: local_balance {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        lightspark_node_purpose: purpose
        lightspark_node_remote_balance: remote_balance {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        lightspark_node_status: status
    }
}`;

export default Node;
