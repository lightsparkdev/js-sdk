// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

/** Enum that enumerates all the possible status of an outgoing payment attempt. **/
export enum OutgoingPaymentAttemptStatus {
  /**
   * This is an enum value that represents values that could be added in the future.
   * Clients should support unknown values as more of them could be added without notice.
   */
  FUTURE_VALUE = "FUTURE_VALUE",

  IN_FLIGHT = "IN_FLIGHT",

  SUCCEEDED = "SUCCEEDED",

  FAILED = "FAILED",
}

export default OutgoingPaymentAttemptStatus;
