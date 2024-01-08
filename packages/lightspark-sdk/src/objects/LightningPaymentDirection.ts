// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

/** This is an enum identifying the payment direction. **/
export enum LightningPaymentDirection {
  /**
   * This is an enum value that represents values that could be added in the future.
   * Clients should support unknown values as more of them could be added without notice.
   */
  FUTURE_VALUE = "FUTURE_VALUE",
  /** A payment that is received by the node. **/
  INCOMING = "INCOMING",
  /** A payment that is sent by the node. **/
  OUTGOING = "OUTGOING",
}

export default LightningPaymentDirection;
