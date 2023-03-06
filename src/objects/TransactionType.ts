// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

export enum TransactionType {
  /** Transactions initiated from a Lightspark node on Lightning Network. **/
  OUTGOING_PAYMENT = "OUTGOING_PAYMENT",
  /** Transactions received by a Lightspark node on Lightning Network. **/
  INCOMING_PAYMENT = "INCOMING_PAYMENT",
  /** Transactions that forwarded payments through Lightspark nodes on Lightning Network. **/
  ROUTED = "ROUTED",
  /** Transactions on the Bitcoin blockchain to withdraw funds from a Lightspark node to a Bitcoin wallet. **/
  L1_WITHDRAW = "L1_WITHDRAW",
  /** Transactions on Bitcoin blockchain to fund a Lightspark node's wallet. **/
  L1_DEPOSIT = "L1_DEPOSIT",
  /** Transactions on Bitcoin blockchain to open a channel on Lightning Network funded by the local Lightspark node. **/
  CHANNEL_OPEN = "CHANNEL_OPEN",
  /** Transactions on Bitcoin blockchain to close a channel on Lightning Network where the balances are allocated back to local and remote nodes. **/
  CHANNEL_CLOSE = "CHANNEL_CLOSE",
  /** Transactions initiated from a Lightspark node on Lightning Network. **/
  PAYMENT = "PAYMENT",
  /** Payment requests from a Lightspark node on Lightning Network **/
  PAYMENT_REQUEST = "PAYMENT_REQUEST",
  /** Transactions that forwarded payments through Lightspark nodes on Lightning Network. **/
  ROUTE = "ROUTE",
}

export default TransactionType;
