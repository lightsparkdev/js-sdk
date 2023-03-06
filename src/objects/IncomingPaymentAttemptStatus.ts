// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

/** Enum that enumerates all the possible status of an incoming payment attempt. **/
export enum IncomingPaymentAttemptStatus {
  ACCEPTED = "ACCEPTED",

  SETTLED = "SETTLED",

  CANCELED = "CANCELED",

  UNKNOWN = "UNKNOWN",
}

export default IncomingPaymentAttemptStatus;
