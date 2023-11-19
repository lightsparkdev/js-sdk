// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import LightsparkException from "../LightsparkException.js";
import { getCurrentLocale } from "./locale.js";
import { localeToCurrencyCode } from "./localeToCurrencyCodes.js";
import { isNumber, round } from "./numbers.js";

export const defaultCurrencyCode = "USD";

/**
 * This enum identifies the unit of currency associated with a CurrencyAmount.
 * *
 */
export enum CurrencyUnit {
  /**
   * This is an enum value that represents values that could be added in the
   * future. Clients should support unknown values as more of them could be
   * added without notice.
   */
  FUTURE_VALUE = "FUTURE_VALUE",
  /**
   * Bitcoin is the cryptocurrency native to the Bitcoin network.
   * It is used as the native medium for value transfer for the Lightning
   * Network. *
   */
  BITCOIN = "BITCOIN",
  /**
   * 0.00000001 (10e-8) Bitcoin or one hundred millionth of a Bitcoin.
   * This is the unit most commonly used in Lightning transactions.
   * *
   */
  SATOSHI = "SATOSHI",
  /**
   * 0.001 Satoshi, or 10e-11 Bitcoin. We recommend using the Satoshi unit
   * instead when possible. *
   */
  MILLISATOSHI = "MILLISATOSHI",
  /** United States Dollar. **/
  USD = "USD",
  /**
   * 0.000000001 (10e-9) Bitcoin or a billionth of a Bitcoin.
   * We recommend using the Satoshi unit instead when possible.
   * *
   */
  NANOBITCOIN = "NANOBITCOIN",
  /**
   * 0.000001 (10e-6) Bitcoin or a millionth of a Bitcoin.
   * We recommend using the Satoshi unit instead when possible.
   * *
   */
  MICROBITCOIN = "MICROBITCOIN",
  /**
   * 0.001 (10e-3) Bitcoin or a thousandth of a Bitcoin.
   * We recommend using the Satoshi unit instead when possible.
   * *
   */
  MILLIBITCOIN = "MILLIBITCOIN",
}

/** This object represents the value and unit for an amount of currency. **/
export type CurrencyAmountType = {
  /** The original numeric value for this CurrencyAmount. **/
  originalValue: number;
  /** The original unit of currency for this CurrencyAmount. **/
  originalUnit: CurrencyUnit;
  /** The unit of user's preferred currency. **/
  preferredCurrencyUnit: CurrencyUnit;
  /**
   * The rounded numeric value for this CurrencyAmount in the very base level
   * of user's preferred currency. For example, for USD, the value will be in
   * cents.
   **/
  preferredCurrencyValueRounded: number;
  /**
   * The approximate float value for this CurrencyAmount in the very base level
   * of user's preferred currency. For example, for USD, the value will be in
   * cents.
   **/
  preferredCurrencyValueApprox: number;
};

const CONVERSION_MAP = {
  [CurrencyUnit.BITCOIN]: {
    [CurrencyUnit.BITCOIN]: (v: number) => v,
    [CurrencyUnit.MICROBITCOIN]: (v: number) => v * 1_000_000,
    [CurrencyUnit.MILLIBITCOIN]: (v: number) => v * 1000,
    [CurrencyUnit.MILLISATOSHI]: (v: number) => v * 100_000_000_000,
    [CurrencyUnit.NANOBITCOIN]: (v: number) => v * 1_000_000_000,
    [CurrencyUnit.SATOSHI]: (v: number) => v * 100_000_000,
    [CurrencyUnit.USD]: (v: number, centsPerBtc = 1) =>
      /* Round without decimals since we're returning cents: */
      round(v * centsPerBtc, 2),
  },
  [CurrencyUnit.MICROBITCOIN]: {
    [CurrencyUnit.BITCOIN]: (v: number) => v / 1_000_000,
    [CurrencyUnit.MICROBITCOIN]: (v: number) => v,
    [CurrencyUnit.MILLIBITCOIN]: (v: number) => v / 1000,
    [CurrencyUnit.MILLISATOSHI]: (v: number) => v * 100_000,
    [CurrencyUnit.NANOBITCOIN]: (v: number) => v * 1000,
    [CurrencyUnit.SATOSHI]: (v: number) => v * 100,
    [CurrencyUnit.USD]: (v: number, centsPerBtc = 1) =>
      /* Round without decimals since we're returning cents: */
      round((v / 1_000_000) * centsPerBtc),
  },
  [CurrencyUnit.MILLIBITCOIN]: {
    [CurrencyUnit.BITCOIN]: (v: number) => v / 1_000,
    [CurrencyUnit.MICROBITCOIN]: (v: number) => v * 1000,
    [CurrencyUnit.MILLIBITCOIN]: (v: number) => v,
    [CurrencyUnit.MILLISATOSHI]: (v: number) => v * 100_000_000,
    [CurrencyUnit.NANOBITCOIN]: (v: number) => v * 1_000_000,
    [CurrencyUnit.SATOSHI]: (v: number) => v * 100_000,
    [CurrencyUnit.USD]: (v: number, centsPerBtc = 1) =>
      /* Round without decimals since we're returning cents: */
      round((v / 1_000) * centsPerBtc),
  },
  [CurrencyUnit.MILLISATOSHI]: {
    [CurrencyUnit.BITCOIN]: (v: number) => v / 100_000_000_000,
    [CurrencyUnit.MICROBITCOIN]: (v: number) => v / 100_000,
    [CurrencyUnit.MILLIBITCOIN]: (v: number) => v / 100_000_000,
    [CurrencyUnit.MILLISATOSHI]: (v: number) => v,
    [CurrencyUnit.NANOBITCOIN]: (v: number) => v / 100,
    [CurrencyUnit.SATOSHI]: (v: number) => v / 1000,
    [CurrencyUnit.USD]: (v: number, centsPerBtc = 1) =>
      /* Round without decimals since we're returning cents: */
      round((v / 100_000_000_000) * centsPerBtc),
  },
  [CurrencyUnit.NANOBITCOIN]: {
    [CurrencyUnit.BITCOIN]: (v: number) => v / 1_000_000_000,
    [CurrencyUnit.MICROBITCOIN]: (v: number) => v / 1000,
    [CurrencyUnit.MILLIBITCOIN]: (v: number) => v / 1_000_000,
    [CurrencyUnit.MILLISATOSHI]: (v: number) => v * 100,
    [CurrencyUnit.NANOBITCOIN]: (v: number) => v,
    [CurrencyUnit.SATOSHI]: (v: number) => v / 10,
    [CurrencyUnit.USD]: (v: number, centsPerBtc = 1) =>
      /* Round without decimals since we're returning cents: */
      round((v / 1_000_000_000) * centsPerBtc),
  },
  [CurrencyUnit.SATOSHI]: {
    [CurrencyUnit.BITCOIN]: (v: number) => v / 100_000_000,
    [CurrencyUnit.MICROBITCOIN]: (v: number) => v / 100,
    [CurrencyUnit.MILLIBITCOIN]: (v: number) => v / 100_000,
    [CurrencyUnit.MILLISATOSHI]: (v: number) => v * 1000,
    [CurrencyUnit.NANOBITCOIN]: (v: number) => v * 10,
    [CurrencyUnit.SATOSHI]: (v: number) => v,
    [CurrencyUnit.USD]: (v: number, centsPerBtc = 1) =>
      /* Round without decimals since we're returning cents: */
      round((v / 100_000_000) * centsPerBtc),
  },
  [CurrencyUnit.USD]: {
    [CurrencyUnit.BITCOIN]: (v: number, centsPerBtc = 1) => v / centsPerBtc,
    [CurrencyUnit.MICROBITCOIN]: (v: number, centsPerBtc = 1) =>
      (v / centsPerBtc) * 1_000_000,
    [CurrencyUnit.MILLIBITCOIN]: (v: number, centsPerBtc = 1) =>
      (v / centsPerBtc) * 1_000,
    [CurrencyUnit.MILLISATOSHI]: (v: number, centsPerBtc = 1) =>
      (v / centsPerBtc) * 100_000_000_000,
    [CurrencyUnit.NANOBITCOIN]: (v: number, centsPerBtc = 1) =>
      (v / centsPerBtc) * 1_000_000_000,
    [CurrencyUnit.SATOSHI]: (v: number, centsPerBtc = 1) =>
      (v / centsPerBtc) * 100_000_000,
    [CurrencyUnit.USD]: (v: number) => v,
  },
};

export function convertCurrencyAmountValue(
  fromUnit: CurrencyUnit,
  toUnit: CurrencyUnit,
  amount: number,
  centsPerBtc = 1,
): number {
  if (
    fromUnit === CurrencyUnit.FUTURE_VALUE ||
    toUnit === CurrencyUnit.FUTURE_VALUE
  ) {
    throw new LightsparkException("CurrencyError", `Unsupported CurrencyUnit.`);
  }

  if (fromUnit === toUnit) {
    return amount;
  }

  const conversionFn = CONVERSION_MAP[fromUnit][toUnit];
  if (!conversionFn) {
    throw new LightsparkException(
      "CurrencyError",
      `Cannot convert from ${fromUnit} to ${toUnit}`,
    );
  }

  return conversionFn(amount, centsPerBtc);
}

export const convertCurrencyAmount = (
  from: CurrencyAmountType,
  toUnit: CurrencyUnit,
): CurrencyAmountType => {
  const value = convertCurrencyAmountValue(
    from.originalUnit,
    toUnit,
    from.originalValue,
  );
  return {
    ...from,
    preferredCurrencyUnit: toUnit,
    preferredCurrencyValueApprox: value,
    preferredCurrencyValueRounded: value,
  };
};

export type CurrencyMap = {
  sats: number;
  msats: number;
  btc: number;
  [CurrencyUnit.BITCOIN]: number;
  [CurrencyUnit.SATOSHI]: number;
  [CurrencyUnit.MILLISATOSHI]: number;
  [CurrencyUnit.MICROBITCOIN]: number;
  [CurrencyUnit.MILLIBITCOIN]: number;
  [CurrencyUnit.NANOBITCOIN]: number;
  [CurrencyUnit.USD]: number;
  [CurrencyUnit.FUTURE_VALUE]: number;
  formatted: {
    sats: string;
    msats: string;
    btc: string;
    [CurrencyUnit.BITCOIN]: string;
    [CurrencyUnit.SATOSHI]: string;
    [CurrencyUnit.MILLISATOSHI]: string;
    [CurrencyUnit.MILLIBITCOIN]: string;
    [CurrencyUnit.MICROBITCOIN]: string;
    [CurrencyUnit.NANOBITCOIN]: string;
    [CurrencyUnit.USD]: string;
    [CurrencyUnit.FUTURE_VALUE]: string;
  };
  isZero: boolean;
  isLessThan: (other: CurrencyMap | CurrencyAmountObj | number) => boolean;
  isGreaterThan: (other: CurrencyMap | CurrencyAmountObj | number) => boolean;
  isEqualTo: (other: CurrencyMap | CurrencyAmountObj | number) => boolean;
  type: "CurrencyMap";
};

export type CurrencyAmountObj = {
  /*
   * Technically the generated graphql schema has value as `any` but it's
   * always a number.
   * We are intentionally widening the type here to allow for more forgiving
   * input:
   */
  value?: number | string | null;
  /* assume satoshi if not provided */
  unit?: CurrencyUnit;
  __typename?: "CurrencyAmount";
};

export type CurrencyAmountArg =
  | CurrencyAmountObj
  | CurrencyAmountType
  | undefined
  | null;

export function isCurrencyAmountObj(arg: unknown): arg is CurrencyAmountObj {
  return (
    typeof arg === "object" && arg !== null && "value" in arg && "unit" in arg
  );
}

export function isCurrencyAmount(arg: unknown): arg is CurrencyAmountType {
  return (
    typeof arg === "object" &&
    arg !== null &&
    "originalValue" in arg &&
    "originalUnit" in arg &&
    "preferredCurrencyUnit" in arg &&
    "preferredCurrencyValueRounded" in arg &&
    "preferredCurrencyValueApprox" in arg
  );
}

function asNumber(value: string | number | null | undefined) {
  if (typeof value === "string") {
    return Number(value);
  }
  return value || 0;
}

function getCurrencyAmount(currencyAmountArg: CurrencyAmountArg) {
  let value = 0;
  let unit = undefined;

  if (isCurrencyAmountObj(currencyAmountArg)) {
    value = asNumber(currencyAmountArg.value);
    unit = currencyAmountArg.unit;
  } else if (isCurrencyAmount(currencyAmountArg)) {
    value = currencyAmountArg.originalValue;
    unit = currencyAmountArg.originalUnit;
  }

  return {
    value: asNumber(value),
    unit: unit || CurrencyUnit.SATOSHI,
  };
}

export function mapCurrencyAmount(
  currencyAmountArg: CurrencyAmountArg,
  centsPerBtc = 1,
): CurrencyMap {
  const { value, unit } = getCurrencyAmount(currencyAmountArg);

  const convert = convertCurrencyAmountValue;
  const sats = convert(unit, CurrencyUnit.SATOSHI, value, centsPerBtc);
  const btc = convert(unit, CurrencyUnit.BITCOIN, value, centsPerBtc);
  const msats = convert(unit, CurrencyUnit.MILLISATOSHI, value, centsPerBtc);
  const usd = convert(unit, CurrencyUnit.USD, value, centsPerBtc);
  const mibtc = convert(unit, CurrencyUnit.MICROBITCOIN, value, centsPerBtc);
  const mlbtc = convert(unit, CurrencyUnit.MILLIBITCOIN, value, centsPerBtc);
  const nbtc = convert(unit, CurrencyUnit.NANOBITCOIN, value, centsPerBtc);

  const mapWithCurrencyUnits = {
    [CurrencyUnit.BITCOIN]: btc,
    [CurrencyUnit.SATOSHI]: sats,
    [CurrencyUnit.MILLISATOSHI]: msats,
    [CurrencyUnit.USD]: usd,
    [CurrencyUnit.MICROBITCOIN]: mibtc,
    [CurrencyUnit.MILLIBITCOIN]: mlbtc,
    [CurrencyUnit.NANOBITCOIN]: nbtc,
    [CurrencyUnit.FUTURE_VALUE]: NaN,
    formatted: {
      [CurrencyUnit.BITCOIN]: formatCurrencyStr({
        value: btc,
        unit: CurrencyUnit.BITCOIN,
      }),
      [CurrencyUnit.SATOSHI]: formatCurrencyStr({
        value: sats,
        unit: CurrencyUnit.SATOSHI,
      }),
      [CurrencyUnit.MILLISATOSHI]: formatCurrencyStr({
        value: msats,
        unit: CurrencyUnit.MILLISATOSHI,
      }),
      [CurrencyUnit.MICROBITCOIN]: formatCurrencyStr({
        value: mibtc,
        unit: CurrencyUnit.MICROBITCOIN,
      }),
      [CurrencyUnit.MILLIBITCOIN]: formatCurrencyStr({
        value: mlbtc,
        unit: CurrencyUnit.MILLIBITCOIN,
      }),
      [CurrencyUnit.NANOBITCOIN]: formatCurrencyStr({
        value: nbtc,
        unit: CurrencyUnit.NANOBITCOIN,
      }),
      [CurrencyUnit.USD]: formatCurrencyStr({
        value: usd,
        unit: CurrencyUnit.USD,
      }),
      [CurrencyUnit.FUTURE_VALUE]: "-",
    },
  };

  return {
    ...mapWithCurrencyUnits,
    btc,
    sats,
    msats,
    isZero: msats === 0,
    isLessThan: (other: CurrencyMap | CurrencyAmountObj | number) => {
      if (isNumber(other)) {
        return msats < other;
      }
      if (isCurrencyAmountObj(other)) {
        other = mapCurrencyAmount(other);
      }
      return msats < other.msats;
    },
    isGreaterThan: (other: CurrencyMap | CurrencyAmountObj | number) => {
      if (isNumber(other)) {
        return msats > other;
      }
      if (isCurrencyAmountObj(other)) {
        other = mapCurrencyAmount(other);
      }
      return msats > other.msats;
    },
    isEqualTo: (other: CurrencyMap | CurrencyAmountObj | number) => {
      if (isNumber(other)) {
        return msats === other;
      }
      if (isCurrencyAmountObj(other)) {
        other = mapCurrencyAmount(other);
      }
      return msats === other.msats;
    },
    formatted: {
      ...mapWithCurrencyUnits.formatted,
      btc: mapWithCurrencyUnits.formatted[CurrencyUnit.BITCOIN],
      sats: mapWithCurrencyUnits.formatted[CurrencyUnit.SATOSHI],
      msats: mapWithCurrencyUnits.formatted[CurrencyUnit.MILLISATOSHI],
    },
    type: "CurrencyMap" as const,
  };
}

export const isCurrencyMap = (
  currencyMap: unknown,
): currencyMap is CurrencyMap =>
  typeof currencyMap === "object" &&
  currencyMap !== null &&
  "type" in currencyMap &&
  typeof currencyMap.type === "string" &&
  currencyMap.type === "CurrencyMap";

export const abbrCurrencyUnit = (unit: CurrencyUnit) => {
  switch (unit) {
    case CurrencyUnit.BITCOIN:
      return "BTC";
    case CurrencyUnit.SATOSHI:
      return "SAT";
    case CurrencyUnit.MILLISATOSHI:
      return "MSAT";
    case CurrencyUnit.USD:
      return "USD";
  }
  return "Unsupported CurrencyUnit";
};

export function formatCurrencyStr(
  amount: CurrencyAmountArg,
  maxFractionDigits?: number,
  compact?: boolean,
  showBtcSymbol = false,
  options: Intl.NumberFormatOptions = {},
) {
  const currencyAmount = getCurrencyAmount(amount);
  let { value: num } = currencyAmount;
  const { unit } = currencyAmount;

  /**
   * Currencies should always be represented in the smallest unit, e.g.
   * cents for USD:
   */
  if (unit === CurrencyUnit.USD) {
    num = num / 100;
  }

  function getDefaultMaxFractionDigits(defaultDigits: number) {
    return typeof maxFractionDigits === "undefined"
      ? compact
        ? 1
        : defaultDigits
      : maxFractionDigits;
  }

  // Symbol handled by toLocaleString for USD.
  // These rely on the LightsparkIcons font
  const symbol = !showBtcSymbol
    ? ""
    : unit === CurrencyUnit.BITCOIN
    ? ""
    : unit === CurrencyUnit.SATOSHI
    ? ""
    : "";

  const currentLocale = getCurrentLocale();

  switch (unit) {
    case CurrencyUnit.BITCOIN:
      return `${symbol}${num.toLocaleString(currentLocale, {
        notation: compact ? ("compact" as const) : undefined,
        maximumFractionDigits: getDefaultMaxFractionDigits(4),
        ...options,
      })}`;
    case CurrencyUnit.MILLISATOSHI:
    case CurrencyUnit.SATOSHI:
    case CurrencyUnit.MICROBITCOIN:
    case CurrencyUnit.MILLIBITCOIN:
    case CurrencyUnit.NANOBITCOIN:
    default:
      return `${symbol}${num.toLocaleString(currentLocale, {
        notation: compact ? ("compact" as const) : undefined,
        maximumFractionDigits: getDefaultMaxFractionDigits(0),
        ...options,
      })}`;
    case CurrencyUnit.USD:
      return num.toLocaleString(currentLocale, {
        style: "currency",
        currency: defaultCurrencyCode,
        notation: compact ? ("compact" as const) : undefined,
        maximumFractionDigits: getDefaultMaxFractionDigits(2),
        ...options,
      });
  }
}

export function separateCurrencyStrParts(currencyStr: string) {
  // split the currency string into the symbol and the amount
  const symbol = currencyStr.replace(/[0-9\s\u00a0.,]/g, "");
  const amount = currencyStr.replace(/[^\d.,-]/g, "");
  return { symbol, amount };
}

export function localeToCurrencySymbol(locale: string) {
  const currencyCode = localeToCurrencyCode(locale);
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    useGrouping: false, // to avoid thousands separators
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(0);

  // Remove numeric and non-breaking space characters to extract the currency
  // symbol
  const { symbol } = separateCurrencyStrParts(formatted);
  return symbol;
}
