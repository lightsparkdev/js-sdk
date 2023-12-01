// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

/**
 * This is an enum of the potential risk ratings related to a transaction made over the Lightning
 * Network. These risk ratings are returned from the CryptoSanctionScreeningProvider. *
 */
export enum RiskRating {
  /**
   * This is an enum value that represents values that could be added in the future.
   * Clients should support unknown values as more of them could be added without notice.
   */
  FUTURE_VALUE = "FUTURE_VALUE",

  HIGH_RISK = "HIGH_RISK",

  LOW_RISK = "LOW_RISK",

  UNKNOWN = "UNKNOWN",
}

export default RiskRating;
