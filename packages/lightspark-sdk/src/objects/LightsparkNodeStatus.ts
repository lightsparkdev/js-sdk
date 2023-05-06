// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

export enum LightsparkNodeStatus {
  /**
   * This is an enum value that represents values that could be added in the future.
   * Clients should support unknown values as more of them could be added without notice.
   */
  FUTURE_VALUE = "FUTURE_VALUE",

  CREATED = "CREATED",

  DEPLOYED = "DEPLOYED",

  STARTED = "STARTED",

  SYNCING = "SYNCING",

  READY = "READY",

  STOPPED = "STOPPED",

  TERMINATED = "TERMINATED",

  TERMINATING = "TERMINATING",

  WALLET_LOCKED = "WALLET_LOCKED",

  FAILED_TO_DEPLOY = "FAILED_TO_DEPLOY",
}

export default LightsparkNodeStatus;
