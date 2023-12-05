// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

/** This is an enum of the potential modes that your Bitcoin withdrawal can take. **/
export enum WithdrawalMode {
  /**
   * This is an enum value that represents values that could be added in the future.
   * Clients should support unknown values as more of them could be added without notice.
   */
  FUTURE_VALUE = "FUTURE_VALUE",

  WALLET_ONLY = "WALLET_ONLY",

  WALLET_THEN_CHANNELS = "WALLET_THEN_CHANNELS",
}

export default WithdrawalMode;
