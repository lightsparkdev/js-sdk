// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

/** This is an enum of the potential statuses that your Lightspark wallet can take.  **/
export enum WalletStatus {
  /**
   * This is an enum value that represents values that could be added in the future.
   * Clients should support unknown values as more of them could be added without notice.
   */
  FUTURE_VALUE = "FUTURE_VALUE",
  /**
   * The wallet has not been set up yet and is ready to be deployed. This is the default status
   * after the first login. *
   */
  NOT_SETUP = "NOT_SETUP",
  /** The wallet is currently being deployed in the Lightspark infrastructure. **/
  DEPLOYING = "DEPLOYING",
  /**
   * The wallet has been deployed in the Lightspark infrastructure and is ready to be initialized. *
   */
  DEPLOYED = "DEPLOYED",
  /** The wallet is currently being initialized. **/
  INITIALIZING = "INITIALIZING",
  /** The wallet is available and ready to be used. **/
  READY = "READY",
  /** The wallet is temporarily available, due to a transient issue or a scheduled maintenance. **/
  UNAVAILABLE = "UNAVAILABLE",
  /**
   * The wallet had an unrecoverable failure. This status is not expected to happend and will be
   * investigated by the Lightspark team. *
   */
  FAILED = "FAILED",
  /** The wallet is being terminated. **/
  TERMINATING = "TERMINATING",
  /**
   * The wallet has been terminated and is not available in the Lightspark infrastructure anymore.
   * It is not connected to the Lightning network and its funds can only be accessed using the
   * Funds Recovery flow. *
   */
  TERMINATED = "TERMINATED",
}

export default WalletStatus;
