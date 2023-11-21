// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

/**
 * This is an enum of the potential permissions that a Lightspark user can have in regards to
 * account management. *
 */
export enum Permission {
  /**
   * This is an enum value that represents values that could be added in the future.
   * Clients should support unknown values as more of them could be added without notice.
   */
  FUTURE_VALUE = "FUTURE_VALUE",

  ALL = "ALL",

  MAINNET_VIEW = "MAINNET_VIEW",

  MAINNET_TRANSACT = "MAINNET_TRANSACT",

  MAINNET_MANAGE = "MAINNET_MANAGE",

  TESTNET_VIEW = "TESTNET_VIEW",

  TESTNET_TRANSACT = "TESTNET_TRANSACT",

  TESTNET_MANAGE = "TESTNET_MANAGE",

  REGTEST_VIEW = "REGTEST_VIEW",

  REGTEST_TRANSACT = "REGTEST_TRANSACT",

  REGTEST_MANAGE = "REGTEST_MANAGE",

  USER_VIEW = "USER_VIEW",

  USER_MANAGE = "USER_MANAGE",

  ACCOUNT_VIEW = "ACCOUNT_VIEW",

  ACCOUNT_MANAGE = "ACCOUNT_MANAGE",
}

export default Permission;
