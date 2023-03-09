// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import Entity from "./Entity.js";
import { NodeToAddressesConnectionFromJson } from "./NodeToAddressesConnection.js";
import NodeAddressType from "./NodeAddressType.js";
import { BlockchainBalanceFromJson } from "./BlockchainBalance.js";
import LightsparkClient from "../client.js";
import Query from "../requester/Query.js";
import autoBind from "auto-bind";
import BitcoinNetwork from "./BitcoinNetwork.js";
import NodeToAddressesConnection from "./NodeToAddressesConnection.js";
import LightsparkNode from "./LightsparkNode.js";
import { SecretFromJson } from "./Secret.js";
import LightsparkNodePurpose from "./LightsparkNodePurpose.js";
import LightsparkNodeStatus from "./LightsparkNodeStatus.js";
import { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import { KeyFromJson } from "./Key.js";
import GraphNode from "./GraphNode.js";

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
  if (obj["__typename"] == "LightsparkNode") {
    return new LightsparkNode(
      obj["lightspark_node_id"],
      obj["lightspark_node_created_at"],
      obj["lightspark_node_updated_at"],
      BitcoinNetwork[obj["lightspark_node_bitcoin_network"]],
      obj["lightspark_node_display_name"],
      obj["lightspark_node_account"].id,
      obj["lightspark_node_name"],
      obj["lightspark_node_upgrade_available"],
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
  }
  if (obj["__typename"] == "GraphNode") {
    return new GraphNode(
      obj["graph_node_id"],
      obj["graph_node_created_at"],
      obj["graph_node_updated_at"],
      BitcoinNetwork[obj["graph_node_bitcoin_network"]],
      obj["graph_node_display_name"],
      "GraphNode",
      obj["graph_node_alias"],
      obj["graph_node_color"],
      obj["graph_node_conductivity"],
      obj["graph_node_public_key"]
    );
  }
  throw new Error(
    `Couldn't find a concrete type for interface Node corresponding to the typename=${obj["__typename"]}`
  );
};

export const FRAGMENT = `
fragment NodeFragment on Node {
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
}`;

export default Node;
