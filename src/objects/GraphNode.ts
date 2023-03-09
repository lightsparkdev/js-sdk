// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import Node from "./Node.js";
import Entity from "./Entity.js";
import { NodeToAddressesConnectionFromJson } from "./NodeToAddressesConnection.js";
import NodeAddressType from "./NodeAddressType.js";
import LightsparkClient from "../client.js";
import Query from "../requester/Query.js";
import autoBind from "auto-bind";
import BitcoinNetwork from "./BitcoinNetwork.js";
import NodeToAddressesConnection from "./NodeToAddressesConnection.js";

/** This is a node on the Lightning Network, managed by a third party. The information about this node is public data that has been obtained by observing the Lightning Network. **/
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
    BitcoinNetwork[obj["graph_node_bitcoin_network"]],
    obj["graph_node_display_name"],
    "GraphNode",
    obj["graph_node_alias"],
    obj["graph_node_color"],
    obj["graph_node_conductivity"],
    obj["graph_node_public_key"]
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
