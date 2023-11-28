// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

/** Describes the reason for an invitation to not be eligible for incentives. **/
export enum IncentivesIneligibilityReason {
  /**
   * This is an enum value that represents values that could be added in the future.
   * Clients should support unknown values as more of them could be added without notice.
   */
  FUTURE_VALUE = "FUTURE_VALUE",
  /**
   * This invitation is not eligible for incentives because it has been created outside of the
   * incentives flow. *
   */
  DISABLED = "DISABLED",
  /** This invitation is not eligible for incentives because the sender is not eligible. **/
  SENDER_NOT_ELIGIBLE = "SENDER_NOT_ELIGIBLE",
  /** This invitation is not eligible for incentives because the receiver is not eligible. **/
  RECEIVER_NOT_ELIGIBLE = "RECEIVER_NOT_ELIGIBLE",
  /**
   * This invitation is not eligible for incentives because the sending VASP is not part of the
   * incentives program. *
   */
  SENDING_VASP_NOT_ELIGIBLE = "SENDING_VASP_NOT_ELIGIBLE",
  /**
   * This invitation is not eligible for incentives because the receiving VASP is not part of the
   * incentives program. *
   */
  RECEIVING_VASP_NOT_ELIGIBLE = "RECEIVING_VASP_NOT_ELIGIBLE",
  /**
   * This invitation is not eligible for incentives because the sender and receiver are in the same
   * region. *
   */
  NOT_CROSS_BORDER = "NOT_CROSS_BORDER",
}

export default IncentivesIneligibilityReason;
