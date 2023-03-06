// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

export enum TransactionStatus {
  /** Transaction succeeded.. **/
  SUCCESS = "SUCCESS",
  /** Transaction failed. **/
  FAILED = "FAILED",
  /** Transaction has been initiated and is currently in-flight. **/
  PENDING = "PENDING",
  /** For transaction type PAYMENT_REQUEST only. No payments have been made to a payment request. **/
  NOT_STARTED = "NOT_STARTED",
  /** For transaction type PAYMENT_REQUEST only. A payment request has expired. **/
  EXPIRED = "EXPIRED",
  /** For transaction type PAYMENT_REQUEST only. **/
  CANCELLED = "CANCELLED",
}

export default TransactionStatus;
