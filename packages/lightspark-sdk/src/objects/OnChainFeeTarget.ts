// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

export enum OnChainFeeTarget {
  /**
   * This is an enum value that represents values that could be added in the future.
   * Clients should support unknown values as more of them could be added without notice.
   */
  FUTURE_VALUE = "FUTURE_VALUE",
  /** Transaction expected to be confirmed within 2 blocks. **/
  HIGH = "HIGH",
  /** Transaction expected to be confirmed within 6 blocks. **/
  MEDIUM = "MEDIUM",
  /** Transaction expected to be confirmed within 18 blocks. **/
  LOW = "LOW",
  /** Transaction expected to be confirmed within 50 blocks. **/
  BACKGROUND = "BACKGROUND",
}

export default OnChainFeeTarget;
