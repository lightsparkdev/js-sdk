// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

export enum SignablePayloadStatus {
  /**
   * This is an enum value that represents values that could be added in the future.
   * Clients should support unknown values as more of them could be added without notice.
   */
  FUTURE_VALUE = "FUTURE_VALUE",

  CREATED = "CREATED",

  SIGNED = "SIGNED",

  VALIDATION_FAILED = "VALIDATION_FAILED",

  INVALID_SIGNATURE = "INVALID_SIGNATURE",
}

export default SignablePayloadStatus;
