// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

/** This is an enum representing the status of a channel on the Lightning Network. **/
export enum ChannelStatus {
  /**
   * This is an enum value that represents values that could be added in the future.
   * Clients should support unknown values as more of them could be added without notice.
   */
  FUTURE_VALUE = "FUTURE_VALUE",
  /** The channel is online and ready to send and receive funds. **/
  OK = "OK",
  /**
   * The channel has been created, but the Bitcoin transaction that initiates it still needs to be
   * confirmed on the Bitcoin blockchain. *
   */
  PENDING = "PENDING",
  /** The channel is not available, likely because the peer is not online. **/
  OFFLINE = "OFFLINE",
  /**
   * The channel is behaving properly, but its remote balance is much higher than its local balance
   * so it is not balanced properly for sending funds out. *
   */
  UNBALANCED_FOR_SEND = "UNBALANCED_FOR_SEND",
  /**
   * The channel is behaving properly, but its remote balance is much lower than its local balance
   * so it is not balanced properly for receiving funds. *
   */
  UNBALANCED_FOR_RECEIVE = "UNBALANCED_FOR_RECEIVE",
  /**
   * The channel has been closed. Information about the channel is still available for historical
   * purposes but the channel cannot be used anymore. *
   */
  CLOSED = "CLOSED",
  /**
   * Something unexpected happened and we cannot determine the status of this channel. Please try
   * again later or contact the support. *
   */
  ERROR = "ERROR",
}

export default ChannelStatus;
