// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import LightsparkException from "../LightsparkException.js";
import { round } from "./numbers.js";

export const defaultCurrencyCode = "USD";

/** Represents the value and unit for an amount of currency. **/
type CurrencyAmount = {
  /** The original numeric value for this CurrencyAmount. **/
  originalValue: number;

  /** The original unit of currency for this CurrencyAmount. **/
  originalUnit: CurrencyUnit;

  /** The unit of user's preferred currency. **/
  preferredCurrencyUnit: CurrencyUnit;

  /**
   * The rounded numeric value for this CurrencyAmount in the very base level of user's preferred
   * currency. For example, for USD, the value will be in cents.
   **/
  preferredCurrencyValueRounded: number;

  /**
   * The approximate float value for this CurrencyAmount in the very base level of user's preferred
   * currency. For example, for USD, the value will be in cents.
   **/
  preferredCurrencyValueApprox: number;
};

enum CurrencyUnit {
  /**
   * This is an enum value that represents values that could be added in the future.
   * Clients should support unknown values as more of them could be added without notice.
   */
  FUTURE_VALUE = "FUTURE_VALUE",
  /** Bitcoin is the cryptocurrency native to the Bitcoin network. It is used as the native medium for value transfer for the Lightning Network. **/
  BITCOIN = "BITCOIN",
  /** 0.00000001 (10e-8) Bitcoin or one hundred millionth of a Bitcoin. This is the unit most commonly used in Lightning transactions. **/
  SATOSHI = "SATOSHI",
  /** 0.001 Satoshi, or 10e-11 Bitcoin. We recommend using the Satoshi unit instead when possible. **/
  MILLISATOSHI = "MILLISATOSHI",
  /** United States Dollar. **/
  USD = "USD",
  /** 0.000000001 (10e-9) Bitcoin or a billionth of a Bitcoin. We recommend using the Satoshi unit instead when possible. **/
  NANOBITCOIN = "NANOBITCOIN",
  /** 0.000001 (10e-6) Bitcoin or a millionth of a Bitcoin. We recommend using the Satoshi unit instead when possible. **/
  MICROBITCOIN = "MICROBITCOIN",
  /** 0.001 (10e-3) Bitcoin or a thousandth of a Bitcoin. We recommend using the Satoshi unit instead when possible. **/
  MILLIBITCOIN = "MILLIBITCOIN",
}

const CONVERSION_MAP = {
  [CurrencyUnit.BITCOIN]: {
    [CurrencyUnit.BITCOIN]: (v: number) => v,
    [CurrencyUnit.MICROBITCOIN]: (v: number) => v * 1_000_000,
    [CurrencyUnit.MILLIBITCOIN]: (v: number) => v * 1000,
    [CurrencyUnit.MILLISATOSHI]: (v: number) => v * 100_000_000_000,
    [CurrencyUnit.NANOBITCOIN]: (v: number) => v * 1_000_000_000,
    [CurrencyUnit.SATOSHI]: (v: number) => v * 100_000_000,
  },
  [CurrencyUnit.MICROBITCOIN]: {
    [CurrencyUnit.BITCOIN]: (v: number) => round(v / 1_000_000),
    [CurrencyUnit.MICROBITCOIN]: (v: number) => v,
    [CurrencyUnit.MILLIBITCOIN]: (v: number) => round(v / 1000),
    [CurrencyUnit.MILLISATOSHI]: (v: number) => v * 100_000,
    [CurrencyUnit.NANOBITCOIN]: (v: number) => v * 1000,
    [CurrencyUnit.SATOSHI]: (v: number) => v * 100,
  },
  [CurrencyUnit.MILLIBITCOIN]: {
    [CurrencyUnit.BITCOIN]: (v: number) => round(v / 1_000),
    [CurrencyUnit.MICROBITCOIN]: (v: number) => v * 1000,
    [CurrencyUnit.MILLIBITCOIN]: (v: number) => v,
    [CurrencyUnit.MILLISATOSHI]: (v: number) => v * 100_000_000,
    [CurrencyUnit.NANOBITCOIN]: (v: number) => v * 1_000_000,
    [CurrencyUnit.SATOSHI]: (v: number) => v * 100_000,
  },
  [CurrencyUnit.MILLISATOSHI]: {
    [CurrencyUnit.BITCOIN]: (v: number) => round(v / 100_000_000_000),
    [CurrencyUnit.MICROBITCOIN]: (v: number) => round(v / 100_000),
    [CurrencyUnit.MILLIBITCOIN]: (v: number) => round(v / 100_000_000),
    [CurrencyUnit.MILLISATOSHI]: (v: number) => v,
    [CurrencyUnit.NANOBITCOIN]: (v: number) => round(v / 100),
    [CurrencyUnit.SATOSHI]: (v: number) => round(v / 1000),
  },
  [CurrencyUnit.NANOBITCOIN]: {
    [CurrencyUnit.BITCOIN]: (v: number) => round(v / 1_000_000_000),
    [CurrencyUnit.MICROBITCOIN]: (v: number) => round(v / 1000),
    [CurrencyUnit.MILLIBITCOIN]: (v: number) => round(v / 1_000_000),
    [CurrencyUnit.MILLISATOSHI]: (v: number) => v * 100,
    [CurrencyUnit.NANOBITCOIN]: (v: number) => v,
    [CurrencyUnit.SATOSHI]: (v: number) => round(v / 10),
  },
  [CurrencyUnit.SATOSHI]: {
    [CurrencyUnit.BITCOIN]: (v: number) => round(v / 100_000_000),
    [CurrencyUnit.MICROBITCOIN]: (v: number) => round(v / 100),
    [CurrencyUnit.MILLIBITCOIN]: (v: number) => round(v / 100_000),
    [CurrencyUnit.MILLISATOSHI]: (v: number) => v * 1000,
    [CurrencyUnit.NANOBITCOIN]: (v: number) => v * 10,
    [CurrencyUnit.SATOSHI]: (v: number) => v,
  },
};

export const convertCurrencyAmount = (
  from: CurrencyAmount,
  toUnit: CurrencyUnit,
): CurrencyAmount => {
  if (
    from.originalUnit === CurrencyUnit.FUTURE_VALUE ||
    from.originalUnit === CurrencyUnit.USD ||
    toUnit === CurrencyUnit.FUTURE_VALUE ||
    toUnit === CurrencyUnit.USD
  ) {
    throw new LightsparkException("CurrencyError", `Unsupported CurrencyUnit.`);
  }

  const conversionFn = CONVERSION_MAP[from.originalUnit][toUnit];
  if (!conversionFn) {
    throw new LightsparkException(
      "CurrencyError",
      `Cannot convert from ${from.originalUnit} to ${toUnit}`,
    );
  }
  return {
    ...from,
    preferredCurrencyUnit: toUnit,
    preferredCurrencyValueApprox: conversionFn(from.originalValue),
    preferredCurrencyValueRounded: conversionFn(from.originalValue),
  };
};
