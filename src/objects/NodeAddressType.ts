// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

/** An enum that enumerates all possible types of addresses of a node on the Lightning Network. **/
export enum NodeAddressType {
  /**
   * This is an enum value that represents values that could be added in the future.
   * Clients should support unknown values as more of them could be added without notice.
   */
  FUTURE_VALUE = "FUTURE_VALUE",

  IPV4 = "IPV4",

  IPV6 = "IPV6",

  TOR = "TOR",
}

export default NodeAddressType;
