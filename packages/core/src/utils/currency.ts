// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import LightsparkException from "../LightsparkException.js";
import { getCurrentLocale } from "./locale.js";
import { localeToCurrencyCode } from "./localeToCurrencyCodes.js";
import { isNumber, round } from "./numbers.js";

export const defaultCurrencyCode = "USD";

/* This const identifies the unit of currency associated with a CurrencyAmount as created by the SDK
 * writer and used in JS SDKs. The schema version uses camel case for the keys so we convert
 * arguments of that type to this format for use in the functions below. */
export const CurrencyUnit = {
  FUTURE_VALUE: "FUTURE_VALUE",
  BITCOIN: "BITCOIN",
  SATOSHI: "SATOSHI",
  MILLISATOSHI: "MILLISATOSHI",
  NANOBITCOIN: "NANOBITCOIN",
  MICROBITCOIN: "MICROBITCOIN",
  MILLIBITCOIN: "MILLIBITCOIN",
  USD: "USD",
  MXN: "MXN",

  Bitcoin: "BITCOIN",
  Microbitcoin: "MICROBITCOIN",
  Millibitcoin: "MILLIBITCOIN",
  Millisatoshi: "MILLISATOSHI",
  Nanobitcoin: "NANOBITCOIN",
  Satoshi: "SATOSHI",
  Usd: "USD",
  Mxn: "MXN",
} as const;

export type CurrencyUnitType = (typeof CurrencyUnit)[keyof typeof CurrencyUnit];

export type SDKCurrencyAmountType = {
  originalValue: number;
  originalUnit: CurrencyUnitType;
  preferredCurrencyUnit: CurrencyUnitType;
  preferredCurrencyValueRounded: number;
  preferredCurrencyValueApprox: number;
};

const standardUnitConversionObj = {
  [CurrencyUnit.BITCOIN]: (v: number, unitsPerBtc = 1) => v / unitsPerBtc,
  [CurrencyUnit.MICROBITCOIN]: (v: number, unitsPerBtc = 1) =>
    (v / unitsPerBtc) * 1_000_000,
  [CurrencyUnit.MILLIBITCOIN]: (v: number, unitsPerBtc = 1) =>
    (v / unitsPerBtc) * 1_000,
  [CurrencyUnit.MILLISATOSHI]: (v: number, unitsPerBtc = 1) =>
    (v / unitsPerBtc) * 100_000_000_000,
  [CurrencyUnit.NANOBITCOIN]: (v: number, unitsPerBtc = 1) =>
    (v / unitsPerBtc) * 1_000_000_000,
  [CurrencyUnit.SATOSHI]: (v: number, unitsPerBtc = 1) =>
    (v / unitsPerBtc) * 100_000_000,
  /* Converting between two different fiat types is not currently supported */
  [CurrencyUnit.USD]: (v: number) => v,
  [CurrencyUnit.MXN]: (v: number) => v,
};

/* Round without decimals since we're returning cents: */
const toBitcoinConversion = (v: number, unitsPerBtc = 1) =>
  round(v * unitsPerBtc);
const toMicrobitcoinConversion = (v: number, unitsPerBtc = 1) =>
  round((v / 1_000_000) * unitsPerBtc);
const toMillibitcoinConversion = (v: number, unitsPerBtc = 1) =>
  round((v / 1_000) * unitsPerBtc);
const toMillisatoshiConversion = (v: number, unitsPerBtc = 1) =>
  round((v / 100_000_000_000) * unitsPerBtc);
const toNanobitcoinConversion = (v: number, unitsPerBtc = 1) =>
  round((v / 1_000_000_000) * unitsPerBtc);
const toSatoshiConversion = (v: number, unitsPerBtc = 1) =>
  round((v / 100_000_000) * unitsPerBtc);

const CONVERSION_MAP = {
  [CurrencyUnit.BITCOIN]: {
    [CurrencyUnit.BITCOIN]: (v: number) => v,
    [CurrencyUnit.MICROBITCOIN]: (v: number) => v * 1_000_000,
    [CurrencyUnit.MILLIBITCOIN]: (v: number) => v * 1000,
    [CurrencyUnit.MILLISATOSHI]: (v: number) => v * 100_000_000_000,
    [CurrencyUnit.NANOBITCOIN]: (v: number) => v * 1_000_000_000,
    [CurrencyUnit.SATOSHI]: (v: number) => v * 100_000_000,
    [CurrencyUnit.USD]: toBitcoinConversion,
    [CurrencyUnit.MXN]: toBitcoinConversion,
  },
  [CurrencyUnit.MICROBITCOIN]: {
    [CurrencyUnit.BITCOIN]: (v: number) => v / 1_000_000,
    [CurrencyUnit.MICROBITCOIN]: (v: number) => v,
    [CurrencyUnit.MILLIBITCOIN]: (v: number) => v / 1000,
    [CurrencyUnit.MILLISATOSHI]: (v: number) => v * 100_000,
    [CurrencyUnit.NANOBITCOIN]: (v: number) => v * 1000,
    [CurrencyUnit.SATOSHI]: (v: number) => v * 100,
    [CurrencyUnit.USD]: toMicrobitcoinConversion,
    [CurrencyUnit.MXN]: toMicrobitcoinConversion,
  },
  [CurrencyUnit.MILLIBITCOIN]: {
    [CurrencyUnit.BITCOIN]: (v: number) => v / 1_000,
    [CurrencyUnit.MICROBITCOIN]: (v: number) => v * 1000,
    [CurrencyUnit.MILLIBITCOIN]: (v: number) => v,
    [CurrencyUnit.MILLISATOSHI]: (v: number) => v * 100_000_000,
    [CurrencyUnit.NANOBITCOIN]: (v: number) => v * 1_000_000,
    [CurrencyUnit.SATOSHI]: (v: number) => v * 100_000,
    [CurrencyUnit.USD]: toMillibitcoinConversion,
    [CurrencyUnit.MXN]: toMillibitcoinConversion,
  },
  [CurrencyUnit.MILLISATOSHI]: {
    [CurrencyUnit.BITCOIN]: (v: number) => v / 100_000_000_000,
    [CurrencyUnit.MICROBITCOIN]: (v: number) => v / 100_000,
    [CurrencyUnit.MILLIBITCOIN]: (v: number) => v / 100_000_000,
    [CurrencyUnit.MILLISATOSHI]: (v: number) => v,
    [CurrencyUnit.NANOBITCOIN]: (v: number) => v / 100,
    [CurrencyUnit.SATOSHI]: (v: number) => v / 1000,
    [CurrencyUnit.USD]: toMillisatoshiConversion,
    [CurrencyUnit.MXN]: toMillisatoshiConversion,
  },
  [CurrencyUnit.NANOBITCOIN]: {
    [CurrencyUnit.BITCOIN]: (v: number) => v / 1_000_000_000,
    [CurrencyUnit.MICROBITCOIN]: (v: number) => v / 1000,
    [CurrencyUnit.MILLIBITCOIN]: (v: number) => v / 1_000_000,
    [CurrencyUnit.MILLISATOSHI]: (v: number) => v * 100,
    [CurrencyUnit.NANOBITCOIN]: (v: number) => v,
    [CurrencyUnit.SATOSHI]: (v: number) => v / 10,
    [CurrencyUnit.USD]: toNanobitcoinConversion,
    [CurrencyUnit.MXN]: toNanobitcoinConversion,
  },
  [CurrencyUnit.SATOSHI]: {
    [CurrencyUnit.BITCOIN]: (v: number) => v / 100_000_000,
    [CurrencyUnit.MICROBITCOIN]: (v: number) => v / 100,
    [CurrencyUnit.MILLIBITCOIN]: (v: number) => v / 100_000,
    [CurrencyUnit.MILLISATOSHI]: (v: number) => v * 1000,
    [CurrencyUnit.NANOBITCOIN]: (v: number) => v * 10,
    [CurrencyUnit.SATOSHI]: (v: number) => v,
    [CurrencyUnit.USD]: toSatoshiConversion,
    [CurrencyUnit.MXN]: toSatoshiConversion,
  },
  [CurrencyUnit.USD]: standardUnitConversionObj,
  [CurrencyUnit.MXN]: standardUnitConversionObj,
};

export function convertCurrencyAmountValue(
  fromUnit: CurrencyUnitType,
  toUnit: CurrencyUnitType,
  amount: number,
  /* Currency values are expected to always be provided in whole numbers of their smallest unit
     e.g. $50.11 would be 5011. unitsPerBtc is the approximate value of one BTC in smallest
     units to provide value estimates where needed where a backend value is not available, eg
     previewing the approximate value of an amount to send. */
  unitsPerBtc = 1,
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

  return conversionFn(amount, unitsPerBtc);
}

export const convertCurrencyAmount = (
  from: SDKCurrencyAmountType,
  toUnit: CurrencyUnitType,
): SDKCurrencyAmountType => {
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
  [CurrencyUnit.MXN]: number;
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
    [CurrencyUnit.MXN]: string;
    [CurrencyUnit.FUTURE_VALUE]: string;
  };
  isZero: boolean;
  isLessThan: (other: CurrencyMap | CurrencyAmountObj | number) => boolean;
  isGreaterThan: (other: CurrencyMap | CurrencyAmountObj | number) => boolean;
  isEqualTo: (other: CurrencyMap | CurrencyAmountObj | number) => boolean;
  type: "CurrencyMap";
};

export type DeprecatedCurrencyAmountObj = {
  /* Technically the generated graphql schema has value as `any` but it's always a number.
   * We are intentionally widening the type here to allow for more forgiving input: */
  value?: number | string | null;
  /* assume satoshi if not provided */
  unit?: CurrencyUnitType;
  __typename?: "CurrencyAmount" | undefined;
};

export type CurrencyAmountObj = {
  /* Technically the generated graphql schema has value as `any` but it's always a number.
   * We are intentionally widening the type here to allow for more forgiving input: */
  original_value?: number | string | null;
  /* assume satoshi if not provided */
  original_unit?: CurrencyUnitType;
  __typename?: "CurrencyAmount" | undefined;
};

export type CurrencyAmountPreferenceObj = {
  /* Technically the generated graphql schema has value as `any` but it's always a number.
   * We are intentionally widening the type here to allow for more forgiving input: */
  preferred_currency_unit?: CurrencyUnitType;
  /* assume satoshi if not provided */
  preferred_currency_value_rounded?: number | string | null;
  __typename?: "CurrencyAmount" | undefined;
};

export type CurrencyAmountArg =
  | DeprecatedCurrencyAmountObj
  | CurrencyAmountObj
  | CurrencyAmountPreferenceObj
  | SDKCurrencyAmountType
  | undefined
  | null;

export function isDeprecatedCurrencyAmountObj(
  arg: unknown,
): arg is DeprecatedCurrencyAmountObj {
  return (
    typeof arg === "object" && arg !== null && "value" in arg && "unit" in arg
  );
}

export function isCurrencyAmountObj(arg: unknown): arg is CurrencyAmountObj {
  return (
    typeof arg === "object" &&
    arg !== null &&
    "original_value" in arg &&
    "original_unit" in arg
  );
}

export function isCurrencyAmountPreferenceObj(
  arg: unknown,
): arg is CurrencyAmountPreferenceObj {
  return (
    typeof arg === "object" &&
    arg !== null &&
    "preferred_currency_unit" in arg &&
    "preferred_currency_value_rounded" in arg
  );
}

export function isSDKCurrencyAmount(
  arg: unknown,
): arg is SDKCurrencyAmountType {
  return (
    typeof arg === "object" &&
    arg !== null &&
    /* We can expect all SDK CurrencyAmount types to always have these exact properties: */
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

  if (isSDKCurrencyAmount(currencyAmountArg)) {
    value = currencyAmountArg.originalValue;
    unit = currencyAmountArg.originalUnit;
  } else if (isCurrencyAmountPreferenceObj(currencyAmountArg)) {
    value = asNumber(currencyAmountArg.preferred_currency_value_rounded);
    unit = currencyAmountArg.preferred_currency_unit;
  } else if (isCurrencyAmountObj(currencyAmountArg)) {
    value = asNumber(currencyAmountArg.original_value);
    unit = currencyAmountArg.original_unit;
  } else if (isDeprecatedCurrencyAmountObj(currencyAmountArg)) {
    value = asNumber(currencyAmountArg.value);
    unit = currencyAmountArg.unit;
  }

  return {
    value: asNumber(value),
    unit: unit || CurrencyUnit.SATOSHI,
  };
}

export function mapCurrencyAmount(
  currencyAmountArg: CurrencyAmountArg,
  unitsPerBtc = 1,
): CurrencyMap {
  const { value, unit } = getCurrencyAmount(currencyAmountArg);

  const convert = convertCurrencyAmountValue;
  const sats = convert(unit, CurrencyUnit.SATOSHI, value, unitsPerBtc);
  const btc = convert(unit, CurrencyUnit.BITCOIN, value, unitsPerBtc);
  const msats = convert(unit, CurrencyUnit.MILLISATOSHI, value, unitsPerBtc);
  const usd = convert(unit, CurrencyUnit.USD, value, unitsPerBtc);
  const mxn = convert(unit, CurrencyUnit.MXN, value, unitsPerBtc);
  const mibtc = convert(unit, CurrencyUnit.MICROBITCOIN, value, unitsPerBtc);
  const mlbtc = convert(unit, CurrencyUnit.MILLIBITCOIN, value, unitsPerBtc);
  const nbtc = convert(unit, CurrencyUnit.NANOBITCOIN, value, unitsPerBtc);

  const mapWithCurrencyUnits = {
    [CurrencyUnit.BITCOIN]: btc,
    [CurrencyUnit.SATOSHI]: sats,
    [CurrencyUnit.MILLISATOSHI]: msats,
    [CurrencyUnit.USD]: usd,
    [CurrencyUnit.MXN]: mxn,
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
      [CurrencyUnit.MXN]: formatCurrencyStr({
        value: mxn,
        unit: CurrencyUnit.MXN,
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

export const abbrCurrencyUnit = (unit: CurrencyUnitType) => {
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

const defaultOptions = {
  /* undefined indicates to use default precision for unit defined below */
  precision: undefined,
  compact: false,
  showBtcSymbol: false,
};

type FormatCurrencyStrOptions = {
  /* undefined indicates to use default precision for unit defined below */
  precision?: number | "full" | undefined;
  compact?: boolean | undefined;
  showBtcSymbol?: boolean | undefined;
};

export function formatCurrencyStr(
  amount: CurrencyAmountArg,
  options?: FormatCurrencyStrOptions,
) {
  const { precision, compact, showBtcSymbol } = {
    ...defaultOptions,
    ...options,
  };

  const currencyAmount = getCurrencyAmount(amount);
  let { value: num } = currencyAmount;
  const { unit } = currencyAmount;

  /* Currencies should always be represented in the smallest unit, e.g. cents for USD: */
  if (unit === CurrencyUnit.USD) {
    num = num / 100;
  }

  function getDefaultMaxFractionDigits(
    defaultDigits: number,
    fullPrecisionDigits: number,
  ) {
    let digits = defaultDigits;
    if (precision === "full") {
      digits = fullPrecisionDigits;
    } else if (typeof precision === "number") {
      digits = precision;
    } else if (compact) {
      digits = 1;
    }
    return digits;
  }

  /* Symbol handled by toLocaleString for USD. These rely on the LightsparkIcons font: */
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
      /* In most cases product prefers 4 precision digtis for BTC. In a few places
         full precision (8 digits) are preferred, e.g. for a transaction details page: */
      return `${symbol}${num.toLocaleString(currentLocale, {
        notation: compact ? ("compact" as const) : undefined,
        maximumFractionDigits: getDefaultMaxFractionDigits(4, 8),
      })}`;
    case CurrencyUnit.SATOSHI:
      /* In most cases product prefers hiding sub sat precision (msats). In a few
         places full precision (3 digits) are preferred, e.g. for Lightning fees
         paid on a transaction details page: */
      return `${symbol}${num.toLocaleString(currentLocale, {
        notation: compact ? ("compact" as const) : undefined,
        maximumFractionDigits: getDefaultMaxFractionDigits(0, 3),
      })}`;
    case CurrencyUnit.MILLISATOSHI:
    case CurrencyUnit.MICROBITCOIN:
    case CurrencyUnit.MILLIBITCOIN:
    case CurrencyUnit.NANOBITCOIN:
    default:
      return `${symbol}${num.toLocaleString(currentLocale, {
        notation: compact ? ("compact" as const) : undefined,
        maximumFractionDigits: getDefaultMaxFractionDigits(0, 0),
      })}`;
    case CurrencyUnit.USD:
      return num.toLocaleString(currentLocale, {
        style: "currency",
        currency: defaultCurrencyCode,
        notation: compact ? ("compact" as const) : undefined,
        maximumFractionDigits: getDefaultMaxFractionDigits(2, 2),
      });
  }
}

export function separateCurrencyStrParts(currencyStr: string) {
  /* split the currency string into the symbol and the amount */
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

  /* Remove numeric and non-breaking space characters to extract the currency symbol */
  const { symbol } = separateCurrencyStrParts(formatted);
  return symbol;
}
