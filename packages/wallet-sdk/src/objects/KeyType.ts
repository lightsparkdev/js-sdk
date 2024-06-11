// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

export enum KeyType {
  /**
   * This is an enum value that represents values that could be added in the future.
   * Clients should support unknown values as more of them could be added without notice.
   */
  FUTURE_VALUE = "FUTURE_VALUE",

  RSA_OAEP = "RSA_OAEP",

  ELLIPTIC_CURVE = "ELLIPTIC_CURVE",

  ED25519 = "ED25519",
}

export default KeyType;
