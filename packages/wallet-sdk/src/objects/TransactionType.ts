// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

/**
 * This is an enum of the potential types of transactions that can be associated with your
 * Lightspark Node. *
 */
export enum TransactionType {
  /**
   * This is an enum value that represents values that could be added in the future.
   * Clients should support unknown values as more of them could be added without notice.
   */
  FUTURE_VALUE = "FUTURE_VALUE",
  /** Transactions initiated from a Lightspark node on Lightning Network. **/
  OUTGOING_PAYMENT = "OUTGOING_PAYMENT",
  /** Transactions received by a Lightspark node on Lightning Network. **/
  INCOMING_PAYMENT = "INCOMING_PAYMENT",
  /** Transactions that forwarded payments through Lightspark nodes on Lightning Network. **/
  ROUTED = "ROUTED",
  /**
   * Transactions on the Bitcoin blockchain to withdraw funds from a Lightspark node to a Bitcoin
   * wallet. *
   */
  L1_WITHDRAW = "L1_WITHDRAW",
  /** Transactions on Bitcoin blockchain to fund a Lightspark node's wallet. **/
  L1_DEPOSIT = "L1_DEPOSIT",
  /**
   * Transactions on Bitcoin blockchain to open a channel on Lightning Network funded by the local
   * Lightspark node. *
   */
  CHANNEL_OPEN = "CHANNEL_OPEN",
  /**
   * Transactions on Bitcoin blockchain to close a channel on Lightning Network where the balances
   * are allocated back to local and remote nodes. *
   */
  CHANNEL_CLOSE = "CHANNEL_CLOSE",
  /** Transactions initiated from a Lightspark node on Lightning Network. **/
  PAYMENT = "PAYMENT",
  /** Payment requests from a Lightspark node on Lightning Network **/
  PAYMENT_REQUEST = "PAYMENT_REQUEST",
  /** Transactions that forwarded payments through Lightspark nodes on Lightning Network. **/
  ROUTE = "ROUTE",
}

export default TransactionType;
