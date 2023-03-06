// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

export enum CurrencyUnit {
  /** Bitcoin is the cryptocurrency native to the Bitcoin network. It is used as the native medium for value transfer for the Lightning Network. **/
  BITCOIN = "BITCOIN",
  /** 0.00000001 (10e-8) Bitcoin or one hundred millionth of a Bitcoin. This is the unit most commonly used in Lightning transactions. **/
  SATOSHI = "SATOSHI",
  /** 0.001 Satoshi, or 10e-11 Bitcoin. We recommend using the Satoshi unit instead when possible. **/
  MILLISATOSHI = "MILLISATOSHI",
  /** 0.000000001 (10e-9) Bitcoin or a billionth of a Bitcoin. We recommend using the Satoshi unit instead when possible. **/
  NANOBITCOIN = "NANOBITCOIN",
  /** 0.000001 (10e-6) Bitcoin or a millionth of a Bitcoin. We recommend using the Satoshi unit instead when possible. **/
  MICROBITCOIN = "MICROBITCOIN",
  /** 0.001 (10e-3) Bitcoin or a thousandth of a Bitcoin. We recommend using the Satoshi unit instead when possible. **/
  MILLIBITCOIN = "MILLIBITCOIN",
  /** United States Dollar. **/
  USD = "USD",
}

export default CurrencyUnit;
