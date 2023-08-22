// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

/** This is an enum that enumerates all potential statuses for an incoming payment attempt. **/
export enum IncomingPaymentAttemptStatus {
  /**
   * This is an enum value that represents values that could be added in the future.
   * Clients should support unknown values as more of them could be added without notice.
   */
  FUTURE_VALUE = "FUTURE_VALUE",

  ACCEPTED = "ACCEPTED",

  SETTLED = "SETTLED",

  CANCELED = "CANCELED",

  UNKNOWN = "UNKNOWN",
}

export default IncomingPaymentAttemptStatus;
