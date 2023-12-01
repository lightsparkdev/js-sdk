// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query } from "@lightsparkdev/core";
import autoBind from "auto-bind";
import type LightsparkClient from "../client.js";
import BitcoinNetwork from "./BitcoinNetwork.js";
import type Entity from "./Entity.js";
import type Node from "./Node.js";
import type NodeAddressType from "./NodeAddressType.js";
import type NodeToAddressesConnection from "./NodeToAddressesConnection.js";
import { NodeToAddressesConnectionFromJson } from "./NodeToAddressesConnection.js";

/**
 * This object represents a node that exists on the Lightning Network, including nodes not managed
 * by Lightspark. You can retrieve this object to get publicly available information about any node
 * on the Lightning Network. *
 */
class GraphNode implements Node, Entity {
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
        ... on GraphNode {
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

  static getGraphNodeQuery(id: string): Query<GraphNode> {
    return {
      queryPayload: `
query GetGraphNode($id: ID!) {
    entity(id: $id) {
        ... on GraphNode {
            ...GraphNodeFragment
        }
    }
}

${FRAGMENT}    
`,
      variables: { id },
      constructObject: (data: any) => GraphNodeFromJson(data.entity),
    };
  }

  public toJson() {
    return {
      __typename: "GraphNode",
      graph_node_id: this.id,
      graph_node_created_at: this.createdAt,
      graph_node_updated_at: this.updatedAt,
      graph_node_alias: this.alias,
      graph_node_bitcoin_network: this.bitcoinNetwork,
      graph_node_color: this.color,
      graph_node_conductivity: this.conductivity,
      graph_node_display_name: this.displayName,
      graph_node_public_key: this.publicKey,
    };
  }
}

export const GraphNodeFromJson = (obj: any): GraphNode => {
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
    obj["graph_node_public_key"],
  );
};

export const FRAGMENT = `
fragment GraphNodeFragment on GraphNode {
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
}`;

export default GraphNode;
