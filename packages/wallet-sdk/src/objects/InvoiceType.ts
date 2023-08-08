// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

/** This is an enum for potential invoice types. **/
export enum InvoiceType {
  /**
   * This is an enum value that represents values that could be added in the future.
   * Clients should support unknown values as more of them could be added without notice.
   */
  FUTURE_VALUE = "FUTURE_VALUE",
  /** A standard Bolt 11 invoice. **/
  STANDARD = "STANDARD",
  /** An AMP (Atomic Multi-path Payment) invoice. **/
  AMP = "AMP",
}

export default InvoiceType;
