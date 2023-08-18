// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

/** This is an enum of potential purposes set by a user for a Lightspark node. **/
export enum LightsparkNodePurpose {
  /**
   * This is an enum value that represents values that could be added in the future.
   * Clients should support unknown values as more of them could be added without notice.
   */
  FUTURE_VALUE = "FUTURE_VALUE",

  SEND = "SEND",

  RECEIVE = "RECEIVE",

  ROUTING = "ROUTING",
}

export default LightsparkNodePurpose;
