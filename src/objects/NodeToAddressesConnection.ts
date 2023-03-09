// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { NodeAddressFromJson } from "./NodeAddress.js";
import NodeAddress from "./NodeAddress.js";

/** A connection between a node and the addresses it has announced for itself on Lightning Network. **/
type NodeToAddressesConnection = {
  /** The total count of objects in this connection, using the current filters. It is different from the number of objects returned in the current page (in the `entities` field). **/
  count: number;

  /** The addresses for the current page of this connection. **/
  entities: NodeAddress[];
};

export const NodeToAddressesConnectionFromJson = (
  obj: any
): NodeToAddressesConnection => {
  return {
    count: obj["node_to_addresses_connection_count"],
    entities: obj["node_to_addresses_connection_entities"].map((e) =>
      NodeAddressFromJson(e)
    ),
  } as NodeToAddressesConnection;
};

export const FRAGMENT = `
fragment NodeToAddressesConnectionFragment on NodeToAddressesConnection {
    __typename
    node_to_addresses_connection_count: count
    node_to_addresses_connection_entities: entities {
        __typename
        node_address_address: address
        node_address_type: type
    }
}`;

export default NodeToAddressesConnection;
