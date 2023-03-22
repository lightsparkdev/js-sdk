// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import LightsparkException from "../LightsparkException.js";
import CurrencyAmount from "../objects/CurrencyAmount.js";
import CurrencyUnit from "../objects/CurrencyUnit.js";

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
    [CurrencyUnit.BITCOIN]: (v: number) => Math.round(v / 1_000_000),
    [CurrencyUnit.MICROBITCOIN]: (v: number) => v,
    [CurrencyUnit.MILLIBITCOIN]: (v: number) => Math.round(v / 1000),
    [CurrencyUnit.MILLISATOSHI]: (v: number) => v * 100_000,
    [CurrencyUnit.NANOBITCOIN]: (v: number) => v * 1000,
    [CurrencyUnit.SATOSHI]: (v: number) => v * 100,
  },
  [CurrencyUnit.MILLIBITCOIN]: {
    [CurrencyUnit.BITCOIN]: (v: number) => Math.round(v / 1_000),
    [CurrencyUnit.MICROBITCOIN]: (v: number) => v * 1000,
    [CurrencyUnit.MILLIBITCOIN]: (v: number) => v,
    [CurrencyUnit.MILLISATOSHI]: (v: number) => v * 100_000_000,
    [CurrencyUnit.NANOBITCOIN]: (v: number) => v * 1_000_000,
    [CurrencyUnit.SATOSHI]: (v: number) => v * 100_000,
  },
  [CurrencyUnit.MILLISATOSHI]: {
    [CurrencyUnit.BITCOIN]: (v: number) => Math.round(v / 100_000_000_000),
    [CurrencyUnit.MICROBITCOIN]: (v: number) => Math.round(v / 100_000),
    [CurrencyUnit.MILLIBITCOIN]: (v: number) => Math.round(v / 100_000_000),
    [CurrencyUnit.MILLISATOSHI]: (v: number) => v,
    [CurrencyUnit.NANOBITCOIN]: (v: number) => Math.round(v / 100),
    [CurrencyUnit.SATOSHI]: (v: number) => Math.round(v / 1000),
  },
  [CurrencyUnit.NANOBITCOIN]: {
    [CurrencyUnit.BITCOIN]: (v: number) => Math.round(v / 1_000_000_000),
    [CurrencyUnit.MICROBITCOIN]: (v: number) => Math.round(v / 1000),
    [CurrencyUnit.MILLIBITCOIN]: (v: number) => Math.round(v / 1_000_000),
    [CurrencyUnit.MILLISATOSHI]: (v: number) => v * 100,
    [CurrencyUnit.NANOBITCOIN]: (v: number) => v,
    [CurrencyUnit.SATOSHI]: (v: number) => Math.round(v / 10),
  },
  [CurrencyUnit.SATOSHI]: {
    [CurrencyUnit.BITCOIN]: (v: number) => Math.round(v / 100_000_000),
    [CurrencyUnit.MICROBITCOIN]: (v: number) => Math.round(v / 100),
    [CurrencyUnit.MILLIBITCOIN]: (v: number) => Math.round(v / 100_000),
    [CurrencyUnit.MILLISATOSHI]: (v: number) => v * 1000,
    [CurrencyUnit.NANOBITCOIN]: (v: number) => v * 10,
    [CurrencyUnit.SATOSHI]: (v: number) => v,
  },
};

export const convertCurrencyAmount = (
  from: CurrencyAmount,
  toUnit: CurrencyUnit
): CurrencyAmount => {
  const conversionFn = CONVERSION_MAP[from.unit][toUnit];
  if (!conversionFn) {
    throw new LightsparkException(
      "CurrencyError",
      `Cannot convert from ${from.unit} to ${toUnit}`
    );
  }
  return {
    ...from,
    unit: toUnit,
    value: conversionFn(from.value),
  };
};
