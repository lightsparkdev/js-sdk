// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import NodeAddressType from "./NodeAddressType.js";

/** This object represents the address of a node on the Lightning Network. **/
type NodeAddress = {
  /** The string representation of the address. **/
  address: string;

  /** The type, or protocol, of this address. **/
  type: NodeAddressType;
};

export const NodeAddressFromJson = (obj: any): NodeAddress => {
  return {
    address: obj["node_address_address"],
    type:
      NodeAddressType[obj["node_address_type"]] ?? NodeAddressType.FUTURE_VALUE,
  } as NodeAddress;
};

export const FRAGMENT = `
fragment NodeAddressFragment on NodeAddress {
    __typename
    node_address_address: address
    node_address_type: type
}`;

export default NodeAddress;
