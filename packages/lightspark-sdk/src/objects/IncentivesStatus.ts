// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

/** Describes the status of the incentives for this invitation. **/
export enum IncentivesStatus {
  /**
   * This is an enum value that represents values that could be added in the future.
   * Clients should support unknown values as more of them could be added without notice.
   */
  FUTURE_VALUE = "FUTURE_VALUE",
  /**
   * The invitation is eligible for incentives in its current state. When it is claimed, we will
   * reassess. *
   */
  PENDING = "PENDING",
  /** The incentives have been validated. **/
  VALIDATED = "VALIDATED",
  /**
   * This invitation is not eligible for incentives. A more detailed reason can be found in the
   * `incentives_ineligibility_reason` field. *
   */
  INELIGIBLE = "INELIGIBLE",
}

export default IncentivesStatus;
