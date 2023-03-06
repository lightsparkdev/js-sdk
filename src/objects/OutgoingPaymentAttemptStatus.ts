// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

/** Enum that enumerates all the possible status of an outgoing payment attempt. **/
export enum OutgoingPaymentAttemptStatus {
  IN_FLIGHT = "IN_FLIGHT",

  SUCCEEDED = "SUCCEEDED",

  FAILED = "FAILED",
}

export default OutgoingPaymentAttemptStatus;
