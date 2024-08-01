// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

/**
 * This is an enum of the potential statuses a transaction associated with your Lightspark Node can
 * take. *
 */
export enum TransactionStatus {
  /**
   * This is an enum value that represents values that could be added in the future.
   * Clients should support unknown values as more of them could be added without notice.
   */
  FUTURE_VALUE = "FUTURE_VALUE",
  /** Transaction succeeded. **/
  SUCCESS = "SUCCESS",
  /** Transaction failed. **/
  FAILED = "FAILED",
  /** Transaction has been initiated and is currently in-flight. **/
  PENDING = "PENDING",
  /**
   * For transaction type PAYMENT_REQUEST only. No payments have been made to a payment request. *
   */
  NOT_STARTED = "NOT_STARTED",
  /** For transaction type PAYMENT_REQUEST only. A payment request has expired. **/
  EXPIRED = "EXPIRED",
  /** For transaction type PAYMENT_REQUEST only. **/
  CANCELLED = "CANCELLED",
}

export default TransactionStatus;
