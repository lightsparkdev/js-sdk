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
  PHP: "PHP",

  Bitcoin: "BITCOIN",
  Microbitcoin: "MICROBITCOIN",
  Millibitcoin: "MILLIBITCOIN",
  Millisatoshi: "MILLISATOSHI",
  Nanobitcoin: "NANOBITCOIN",
  Satoshi: "SATOSHI",
  Usd: "USD",
  Mxn: "MXN",
  Php: "PHP",
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
  [CurrencyUnit.PHP]: (v: number) => v,
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
    [CurrencyUnit.PHP]: toBitcoinConversion,
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
    [CurrencyUnit.PHP]: toMicrobitcoinConversion,
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
    [CurrencyUnit.PHP]: toMillibitcoinConversion,
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
    [CurrencyUnit.PHP]: toMillisatoshiConversion,
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
    [CurrencyUnit.PHP]: toNanobitcoinConversion,
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
    [CurrencyUnit.PHP]: toSatoshiConversion,
  },
  [CurrencyUnit.USD]: standardUnitConversionObj,
  [CurrencyUnit.MXN]: standardUnitConversionObj,
  [CurrencyUnit.PHP]: standardUnitConversionObj,
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
) {
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
  [CurrencyUnit.PHP]: number;
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
    [CurrencyUnit.PHP]: string;
    [CurrencyUnit.FUTURE_VALUE]: string;
  };
  isZero: boolean;
  isLessThan: (other: CurrencyMap | CurrencyAmountObj | number) => boolean;
  isGreaterThan: (other: CurrencyMap | CurrencyAmountObj | number) => boolean;
  isEqualTo: (other: CurrencyMap | CurrencyAmountObj | number) => boolean;
  type: "CurrencyMap";
};

/* GQL CurrencyAmountInputs have this shape as well as client side CurrencyAmount objects.
 * Technically value is always a number for GQL inputs. This is enforced by mutation input
 * types. For client side utils we can have slightly more forgiving input and coerce with
 * asNumber. */
export type CurrencyAmountInputObj = {
  value: number | string | null;
  unit: CurrencyUnitType;
};

/* Persisted CurrencyAmount objects may have this shape if queried from GQL in this format
   but the fields are deprecated and original_unit and original_value should be used instead: */
export type DeprecatedCurrencyAmountObj = {
  /* Technically the generated graphql schema has value as `any` but it's always a number: */
  value?: number;
  /* assume satoshi if not provided */
  unit?: CurrencyUnitType;
  __typename?: "CurrencyAmount";
};

export type CurrencyAmountObj = {
  /* Technically the generated graphql schema has value as `any` but it's always a number: */
  original_value?: number;
  /* assume satoshi if not provided */
  original_unit?: CurrencyUnitType;
  __typename?: "CurrencyAmount";
};

export type CurrencyAmountPreferenceObj = {
  /* unit and value, along with original unit and value are all required for
   * CurrencyAmountPreferenceObj - the preferred value is used for the corresponding unit
   * but the original unit/value are also needed to ensure accurate conversion to other units */
  original_value: number;
  original_unit: CurrencyUnitType;
  preferred_currency_unit: CurrencyUnitType;
  /* Technically the generated graphql schema has value as `any` but it's always a number: */
  preferred_currency_value_approx: number;
  __typename?: "CurrencyAmount";
};

export type CurrencyAmountArg =
  | CurrencyAmountInputObj
  | DeprecatedCurrencyAmountObj
  | CurrencyAmountObj
  | CurrencyAmountPreferenceObj
  | SDKCurrencyAmountType
  | undefined
  | null;

export function isCurrencyAmountInputObj(
  arg: unknown,
): arg is CurrencyAmountInputObj {
  return (
    typeof arg === "object" &&
    arg !== null &&
    "value" in arg &&
    (typeof arg.value === "number" ||
      typeof arg.value === "string" ||
      arg.value === null) &&
    "unit" in arg &&
    typeof arg.unit === "string"
  );
}

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
    "original_unit" in arg &&
    typeof arg.original_unit === "string" &&
    "original_value" in arg &&
    typeof arg.original_value === "number" &&
    "preferred_currency_unit" in arg &&
    typeof arg.preferred_currency_unit === "string" &&
    "preferred_currency_value_approx" in arg &&
    typeof arg.preferred_currency_value_approx === "number"
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

export function getCurrencyAmount(currencyAmountArg: CurrencyAmountArg) {
  let value = 0;
  let unit = undefined;

  if (isSDKCurrencyAmount(currencyAmountArg)) {
    value = currencyAmountArg.originalValue;
    unit = currencyAmountArg.originalUnit;
  } else if (isCurrencyAmountObj(currencyAmountArg)) {
    value = asNumber(currencyAmountArg.original_value);
    unit = currencyAmountArg.original_unit;
  } else if (
    isCurrencyAmountInputObj(currencyAmountArg) ||
    isDeprecatedCurrencyAmountObj(currencyAmountArg)
  ) {
    value = asNumber(currencyAmountArg.value);
    unit = currencyAmountArg.unit;
  }

  return {
    value: asNumber(value),
    unit: unit || CurrencyUnit.SATOSHI,
  };
}

function convertCurrencyAmountValues(
  fromUnit: CurrencyUnitType,
  amount: number,
  unitsPerBtc = 1,
  conversionOverride?: { unit: CurrencyUnitType; convertedValue: number },
) {
  const convert = convertCurrencyAmountValue;
  const namesToUnits = {
    sats: CurrencyUnit.SATOSHI,
    btc: CurrencyUnit.BITCOIN,
    msats: CurrencyUnit.MILLISATOSHI,
    usd: CurrencyUnit.USD,
    mxn: CurrencyUnit.MXN,
    php: CurrencyUnit.PHP,
    mibtc: CurrencyUnit.MICROBITCOIN,
    mlbtc: CurrencyUnit.MILLIBITCOIN,
    nbtc: CurrencyUnit.NANOBITCOIN,
  };
  return Object.entries(namesToUnits).reduce(
    (acc, [name, unit]) => {
      if (conversionOverride && unit === conversionOverride.unit) {
        acc[name as keyof typeof namesToUnits] =
          conversionOverride.convertedValue;
      } else {
        acc[name as keyof typeof namesToUnits] = convert(
          fromUnit,
          unit,
          amount,
          unitsPerBtc,
        );
      }
      return acc;
    },
    {} as Record<keyof typeof namesToUnits, number>,
  );
}

function getPreferredConversionOverride(currencyAmountArg: CurrencyAmountArg) {
  if (isCurrencyAmountPreferenceObj(currencyAmountArg)) {
    return {
      unit: currencyAmountArg.preferred_currency_unit,
      convertedValue: currencyAmountArg.preferred_currency_value_approx,
    };
  } else if (isSDKCurrencyAmount(currencyAmountArg)) {
    return {
      unit: currencyAmountArg.preferredCurrencyUnit,
      convertedValue: currencyAmountArg.preferredCurrencyValueApprox,
    };
  }
  return undefined;
}

export function mapCurrencyAmount(
  currencyAmountArg: CurrencyAmountArg,
  unitsPerBtc = 1,
): CurrencyMap {
  const { value, unit } = getCurrencyAmount(currencyAmountArg);

  /* Prefer approximation from backend for corresponding unit if specified on currencyAmountArg.
   * This will always be at most for one single unit type since there's only one
   * preferred_currency_unit on CurrencyAmount types: */
  const conversionOverride = getPreferredConversionOverride(currencyAmountArg);

  const { sats, msats, btc, usd, mxn, php, mibtc, mlbtc, nbtc } =
    convertCurrencyAmountValues(unit, value, unitsPerBtc, conversionOverride);

  const mapWithCurrencyUnits = {
    [CurrencyUnit.BITCOIN]: btc,
    [CurrencyUnit.SATOSHI]: sats,
    [CurrencyUnit.MILLISATOSHI]: msats,
    [CurrencyUnit.USD]: usd,
    [CurrencyUnit.MXN]: mxn,
    [CurrencyUnit.PHP]: php,
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
      [CurrencyUnit.PHP]: formatCurrencyStr({
        value: php,
        unit: CurrencyUnit.PHP,
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
    case CurrencyUnit.MILLIBITCOIN:
      return "mBTC";
    case CurrencyUnit.MICROBITCOIN:
      return "μBTC";
    case CurrencyUnit.USD:
      return "USD";
    case CurrencyUnit.MXN:
      return "MXN";
    case CurrencyUnit.PHP:
      return "PHP";
  }
  return "Unsupported CurrencyUnit";
};

const defaultOptions = {
  /* undefined indicates to use default precision for unit defined below */
  precision: undefined,
  compact: false,
  showBtcSymbol: false,
  append: undefined,
};

export type AppendUnitsOptions = {
  plural?: boolean | undefined;
  lowercase?: boolean | undefined;
};

type FormatCurrencyStrOptions = {
  /* undefined indicates to use default precision for unit defined below */
  precision?: number | "full" | undefined;
  compact?: boolean | undefined;
  showBtcSymbol?: boolean | undefined;
  appendUnits?: AppendUnitsOptions | undefined;
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

  const centCurrencies = [CurrencyUnit.USD, CurrencyUnit.MXN] as string[];
  /* centCurrencies are always provided in the smallest unit, e.g. cents for USD. These should be
   * divided by 100 for proper display format: */
  if (centCurrencies.includes(unit)) {
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

  let formattedStr = "";
  switch (unit) {
    case CurrencyUnit.MXN:
    case CurrencyUnit.USD:
    case CurrencyUnit.PHP:
      formattedStr = num.toLocaleString(currentLocale, {
        style: "currency",
        currency: unit,
        currencyDisplay: "narrowSymbol",
        notation: compact ? ("compact" as const) : undefined,
        maximumFractionDigits: getDefaultMaxFractionDigits(2, 2),
      });
      break;
    case CurrencyUnit.BITCOIN:
      /* In most cases product prefers 4 precision digtis for BTC. In a few places
         full precision (8 digits) are preferred, e.g. for a transaction details page: */
      formattedStr = `${symbol}${num.toLocaleString(currentLocale, {
        notation: compact ? ("compact" as const) : undefined,
        maximumFractionDigits: getDefaultMaxFractionDigits(4, 8),
      })}`;
      break;
    case CurrencyUnit.SATOSHI:
      /* In most cases product prefers hiding sub sat precision (msats). In a few
         places full precision (3 digits) are preferred, e.g. for Lightning fees
         paid on a transaction details page: */
      formattedStr = `${symbol}${num.toLocaleString(currentLocale, {
        notation: compact ? ("compact" as const) : undefined,
        maximumFractionDigits: getDefaultMaxFractionDigits(0, 3),
      })}`;
      break;
    case CurrencyUnit.MILLISATOSHI:
    case CurrencyUnit.MICROBITCOIN:
    case CurrencyUnit.MILLIBITCOIN:
    case CurrencyUnit.NANOBITCOIN:
    default:
      formattedStr = `${symbol}${num.toLocaleString(currentLocale, {
        notation: compact ? ("compact" as const) : undefined,
        maximumFractionDigits: getDefaultMaxFractionDigits(0, 0),
      })}`;
  }

  if (options?.appendUnits) {
    const unitStr = abbrCurrencyUnit(unit);
    const unitSuffix = options.appendUnits.plural && num > 1 ? "s" : "";
    const unitStrWithSuffix = `${unitStr}${unitSuffix}`;
    formattedStr += ` ${
      options.appendUnits.lowercase
        ? unitStrWithSuffix.toLowerCase()
        : unitStrWithSuffix
    }`;
  }

  return formattedStr;
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
