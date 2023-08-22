// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query } from "@lightsparkdev/core";
import autoBind from "auto-bind";
import type LightsparkClient from "../client.js";
import BitcoinNetwork from "./BitcoinNetwork.js";
import type Node from "./Node.js";
import type NodeAddressType from "./NodeAddressType.js";
import type NodeToAddressesConnection from "./NodeToAddressesConnection.js";
import { NodeToAddressesConnectionFromJson } from "./NodeToAddressesConnection.js";

/** This object represents a node that exists on the Lightning Network, including nodes not managed by Lightspark. You can retrieve this object to get publicly available information about any node on the Lightning Network. **/
class GraphNode implements Node {
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
    public readonly publicKey?: string,
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
