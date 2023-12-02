// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { LightsparkException, type Query } from "@lightsparkdev/core";
import type LightsparkClient from "../client.js";
import BitcoinNetwork from "./BitcoinNetwork.js";
import GraphNode from "./GraphNode.js";
import type NodeAddressType from "./NodeAddressType.js";
import type NodeToAddressesConnection from "./NodeToAddressesConnection.js";

/**
 * This object is an interface representing a Lightning Node on the Lightning Network, and could
 * either be a Lightspark node or a node managed by a third party. *
 */
interface Node {
  /**
   * The unique identifier of this entity across all Lightspark systems. Should be treated as an
   * opaque string.
   **/
  id: string;

  /** The date and time when the entity was first created. **/
  createdAt: string;

  /** The date and time when the entity was last updated. **/
  updatedAt: string;

  /** The Bitcoin Network this node is deployed in. **/
  bitcoinNetwork: BitcoinNetwork;

  /**
   * The name of this node in the network. It will be the most human-readable option possible,
   * depending on the data available for this node.
   **/
  displayName: string;

  /** The typename of the object **/
  typename: string;

  /**
   * A name that identifies the node. It has no importance in terms of operating the node, it is
   * just a way to identify and search for commercial services or popular nodes. This alias can
   * be changed at any time by the node operator.
   **/
  alias?: string | undefined;

  /**
   * A hexadecimal string that describes a color. For example "#000000" is black, "#FFFFFF" is
   * white. It has no importance in terms of operating the node, it is just a way to visually
   * differentiate nodes. That color can be changed at any time by the node operator.
   **/
  color?: string | undefined;

  /**
   * A summary metric used to capture how well positioned a node is to send, receive, or route
   * transactions efficiently. Maximizing a node's conductivity helps a node’s transactions to be
   * capital efficient. The value is an integer ranging between 0 and 10 (bounds included).
   **/
  conductivity?: number | undefined;

  /**
   * The public key of this node. It acts as a unique identifier of this node in the Lightning
   * Network. *
   */
  publicKey?: string | undefined;

  getAddresses(
    client: LightsparkClient,
    first?: number | undefined,
    types?: NodeAddressType[] | undefined,
  ): Promise<NodeToAddressesConnection>;
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
      obj["graph_node_public_key"],
    );
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface Node corresponding to the typename=${obj["__typename"]}`,
  );
};
export const NodeToJson = (obj: Node): any => {
  if (obj.typename == "GraphNode") {
    const graphNode = obj as GraphNode;
    return {
      __typename: "GraphNode",
      graph_node_id: graphNode.id,
      graph_node_created_at: graphNode.createdAt,
      graph_node_updated_at: graphNode.updatedAt,
      graph_node_alias: graphNode.alias,
      graph_node_bitcoin_network: graphNode.bitcoinNetwork,
      graph_node_color: graphNode.color,
      graph_node_conductivity: graphNode.conductivity,
      graph_node_display_name: graphNode.displayName,
      graph_node_public_key: graphNode.publicKey,
    };
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface Node corresponding to the typename=${obj.typename}`,
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
}`;

export const getNodeQuery = (id: string): Query<Node> => {
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
};

export default Node;
