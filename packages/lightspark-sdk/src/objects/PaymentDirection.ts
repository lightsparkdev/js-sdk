// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

/** This is an enum indicating the direction of the payment. **/
export enum PaymentDirection {
  /**
   * This is an enum value that represents values that could be added in the future.
   * Clients should support unknown values as more of them could be added without notice.
   */
  FUTURE_VALUE = "FUTURE_VALUE",

  SENT = "SENT",

  RECEIVED = "RECEIVED",
}

export default PaymentDirection;
