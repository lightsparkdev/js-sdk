// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

export enum InvoiceType {
  /** A standard Bolt 11 invoice. **/
  STANDARD = "STANDARD",
  /** An AMP (Atomic Multi-path Payment) invoice. **/
  AMP = "AMP",
}

export default InvoiceType;
