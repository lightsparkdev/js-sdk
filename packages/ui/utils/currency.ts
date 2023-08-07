import { CurrencyUnit } from "@lightsparkdev/gql/generated/graphql";
import type { CurrencyAmount as SDKCurrencyAmountType } from "@lightsparkdev/wallet-sdk";
import { isNumber } from "lodash-es";
import { getCurrentLocale } from "./getCurrentLocale";
import { round } from "./numbers";

export const defaultCurrencyCode = "USD";

type CurrencyLocales = keyof typeof localeToCurrencyCodes;
export type CurrencyMap = {
  sats: number;
  msats: number;
  btc: number;
  [CurrencyUnit.Bitcoin]: number;
  [CurrencyUnit.Satoshi]: number;
  [CurrencyUnit.Millisatoshi]: number;
  [CurrencyUnit.Microbitcoin]: number;
  [CurrencyUnit.Millibitcoin]: number;
  [CurrencyUnit.Nanobitcoin]: number;
  [CurrencyUnit.Usd]: number;
  formatted: {
    sats: string;
    msats: string;
    btc: string;
    [CurrencyUnit.Bitcoin]: string;
    [CurrencyUnit.Satoshi]: string;
    [CurrencyUnit.Millisatoshi]: string;
    [CurrencyUnit.Millibitcoin]: string;
    [CurrencyUnit.Microbitcoin]: string;
    [CurrencyUnit.Nanobitcoin]: string;
    [CurrencyUnit.Usd]: string;
  };
  isZero: boolean;
  isLessThan: (other: CurrencyMap | CurrencyAmountObj | number) => boolean;
  isGreaterThan: (other: CurrencyMap | CurrencyAmountObj | number) => boolean;
  isEqualTo: (other: CurrencyMap | CurrencyAmountObj | number) => boolean;
  type: "CurrencyMap";
};

export type CurrencyAmountObj = {
  /* Technically the generated graphql schema has value as `any` but it's always a number.
     We are intentionally widening the type here to allow for more forgiving input: */
  value?: number | string | null;
  /* assume satoshi if not provided */
  unit?: CurrencyUnit;
  __typename?: "CurrencyAmount";
};

export type CurrencyAmountArg =
  | CurrencyAmountObj
  | SDKCurrencyAmountType
  | undefined
  | null;

export function isCurrencyAmountObj(arg: unknown): arg is CurrencyAmountObj {
  return (
    typeof arg === "object" && arg !== null && "value" in arg && "unit" in arg
  );
}

export function isSDKCurrencyAmountType(
  arg: unknown
): arg is SDKCurrencyAmountType {
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

/* From https://github.com/tadeegan/locale-currency. For now only USD conversion from
   BTC is supported by sparkcore, strip additional currency codes from the bundle: */
const localeToCurrencyCodes = {
  // AD: "EUR",
  // AE: "AED",
  // AF: "AFN",
  // AG: "XCD",
  // AI: "XCD",
  // AL: "ALL",
  // AM: "AMD",
  // AO: "AOA",
  // AR: "ARS",
  AS: "USD",
  // AT: "EUR",
  // AU: "AUD",
  // AW: "AWG",
  // AX: "EUR",
  // AZ: "AZN",
  // BA: "BAM",
  // BB: "BBD",
  // BD: "BDT",
  // BE: "EUR",
  // BF: "XOF",
  // BG: "BGN",
  // BH: "BHD",
  // BI: "BIF",
  // BJ: "XOF",
  // BL: "EUR",
  // BM: "BMD",
  // BN: "BND",
  // BO: "BOB",
  BQ: "USD",
  // BR: "BRL",
  // BS: "BSD",
  // BT: "BTN",
  // BV: "NOK",
  // BW: "BWP",
  // BY: "BYN",
  // BZ: "BZD",
  // CA: "CAD",
  // CC: "AUD",
  // CD: "CDF",
  // CF: "XAF",
  // CG: "XAF",
  // CH: "CHF",
  // CI: "XOF",
  // CK: "NZD",
  // CL: "CLP",
  // CM: "XAF",
  // CN: "CNY",
  // CO: "COP",
  // CR: "CRC",
  // CU: "CUP",
  // CV: "CVE",
  // CW: "ANG",
  // CX: "AUD",
  // CY: "EUR",
  // CZ: "CZK",
  // DE: "EUR",
  // DJ: "DJF",
  // DK: "DKK",
  // DM: "XCD",
  // DO: "DOP",
  // DZ: "DZD",
  EC: "USD",
  // EE: "EUR",
  // EG: "EGP",
  // EH: "MAD",
  // ER: "ERN",
  // ES: "EUR",
  // ET: "ETB",
  // FI: "EUR",
  // FJ: "FJD",
  // FK: "FKP",
  FM: "USD",
  // FO: "DKK",
  // FR: "EUR",
  // GA: "XAF",
  // GB: "GBP",
  // GD: "XCD",
  // GE: "GEL",
  // GF: "EUR",
  // GG: "GBP",
  // GH: "GHS",
  // GI: "GIP",
  // GL: "DKK",
  // GM: "GMD",
  // GN: "GNF",
  // GP: "EUR",
  // GQ: "XAF",
  // GR: "EUR",
  // GS: "GBP",
  // GT: "GTQ",
  GU: "USD",
  // GW: "XOF",
  // GY: "GYD",
  // HK: "HKD",
  // HM: "AUD",
  // HN: "HNL",
  // HR: "HRK",
  // HT: "HTG",
  // HU: "HUF",
  // ID: "IDR",
  // IE: "EUR",
  // IL: "ILS",
  // IM: "GBP",
  // IN: "INR",
  IO: "USD",
  // IQ: "IQD",
  // IR: "IRR",
  // IS: "ISK",
  // IT: "EUR",
  // JE: "GBP",
  // JM: "JMD",
  // JO: "JOD",
  // JP: "JPY",
  // KE: "KES",
  // KG: "KGS",
  // KH: "KHR",
  // KI: "AUD",
  // KM: "KMF",
  // KN: "XCD",
  // KP: "KPW",
  // KR: "KRW",
  // KW: "KWD",
  // KY: "KYD",
  // KZ: "KZT",
  // LA: "LAK",
  // LB: "LBP",
  // LC: "XCD",
  // LI: "CHF",
  // LK: "LKR",
  // LR: "LRD",
  // LS: "LSL",
  // LT: "EUR",
  // LU: "EUR",
  // LV: "EUR",
  // LY: "LYD",
  // MA: "MAD",
  // MC: "EUR",
  // MD: "MDL",
  // ME: "EUR",
  // MF: "EUR",
  // MG: "MGA",
  MH: "USD",
  // MK: "MKD",
  // ML: "XOF",
  // MM: "MMK",
  // MN: "MNT",
  // MO: "MOP",
  MP: "USD",
  // MQ: "EUR",
  // MR: "MRO",
  // MS: "XCD",
  // MT: "EUR",
  // MU: "MUR",
  // MV: "MVR",
  // MW: "MWK",
  // MX: "MXN",
  // MY: "MYR",
  // MZ: "MZN",
  // NA: "NAD",
  // NC: "XPF",
  // NE: "XOF",
  // NF: "AUD",
  // NG: "NGN",
  // NI: "NIO",
  // NL: "EUR",
  // NO: "NOK",
  // NP: "NPR",
  // NR: "AUD",
  // NU: "NZD",
  // NZ: "NZD",
  // OM: "OMR",
  // PA: "PAB",
  // PE: "PEN",
  // PF: "XPF",
  // PG: "PGK",
  // PH: "PHP",
  // PK: "PKR",
  // PL: "PLN",
  // PM: "EUR",
  // PN: "NZD",
  PR: "USD",
  // PS: "ILS",
  // PT: "EUR",
  PW: "USD",
  // PY: "PYG",
  // QA: "QAR",
  // RE: "EUR",
  // RO: "RON",
  // RS: "RSD",
  // RU: "RUB",
  // RW: "RWF",
  // SA: "SAR",
  // SB: "SBD",
  // SC: "SCR",
  // SD: "SDG",
  // SE: "SEK",
  // SG: "SGD",
  // SH: "SHP",
  // SI: "EUR",
  // SJ: "NOK",
  // SK: "EUR",
  // SL: "SLL",
  // SM: "EUR",
  // SN: "XOF",
  // SO: "SOS",
  // SR: "SRD",
  // ST: "STD",
  // SV: "SVC",
  // SX: "ANG",
  // SY: "SYP",
  // SZ: "SZL",
  TC: "USD",
  // TD: "XAF",
  // TF: "EUR",
  // TG: "XOF",
  // TH: "THB",
  // TJ: "TJS",
  // TK: "NZD",
  TL: "USD",
  // TM: "TMT",
  // TN: "TND",
  // TO: "TOP",
  // TR: "TRY",
  // TT: "TTD",
  // TV: "AUD",
  // TW: "TWD",
  // TZ: "TZS",
  // UA: "UAH",
  // UG: "UGX",
  UM: "USD",
  US: "USD",
  // UY: "UYU",
  // UZ: "UZS",
  // VA: "EUR",
  // VC: "XCD",
  // VE: "VEF",
  VG: "USD",
  VI: "USD",
  // VN: "VND",
  // VU: "VUV",
  // WF: "XPF",
  // WS: "WST",
  // YE: "YER",
  // YT: "EUR",
  // ZA: "ZAR",
  // ZM: "ZMW",
  // ZW: "ZWL",
};

function getCountryCode(localeString: string) {
  let components = localeString.split("_");
  if (components.length === 2) {
    return components.pop() as string;
  }
  components = localeString.split("-");
  if (components.length === 2) {
    return components.pop() as string;
  }
  return localeString;
}

function localeToCurrencyCode(locale: string): string {
  const countryCode = getCountryCode(locale).toUpperCase() as CurrencyLocales;
  if (countryCode in localeToCurrencyCodes) {
    return localeToCurrencyCodes[countryCode];
  }
  return defaultCurrencyCode;
}

export const currentLocaleCurrencyCode = localeToCurrencyCode(
  getCurrentLocale() as CurrencyLocales
);

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
  } else if (isSDKCurrencyAmountType(currencyAmountArg)) {
    value = currencyAmountArg.originalValue;
    unit = currencyAmountArg.originalUnit;
  }

  return {
    value: asNumber(value),
    unit: unit || CurrencyUnit.Satoshi,
  };
}

export function mapCurrencyAmount(
  currencyAmountArg: CurrencyAmountArg,
  centsPerBtc: number = 0
): CurrencyMap {
  const { value, unit } = getCurrencyAmount(currencyAmountArg);

  let sats = value;
  let msats = value * 1000;
  let btc = value / 1e8;
  let usd = round(btc * centsPerBtc, 2);

  if (unit === CurrencyUnit.Bitcoin) {
    sats = value * 1e8;
    msats = value * 1e11;
    btc = value;
    usd = round(btc * centsPerBtc, 2);
  } else if (unit === CurrencyUnit.Millisatoshi) {
    sats = value / 1000;
    msats = value;
    btc = value / 1e11;
    usd = round(btc * centsPerBtc, 2);
  } else if (unit === CurrencyUnit.Usd) {
    usd = value;
    btc = value / centsPerBtc;
    sats = btc * 1e8;
    msats = sats * 1000;
  }

  const mapWithCurrencyUnits = {
    [CurrencyUnit.Bitcoin]: btc,
    [CurrencyUnit.Satoshi]: sats,
    [CurrencyUnit.Millisatoshi]: msats,
    [CurrencyUnit.Usd]: usd,
    [CurrencyUnit.Microbitcoin]: 0,
    [CurrencyUnit.Millibitcoin]: 0,
    [CurrencyUnit.Nanobitcoin]: 0,
    formatted: {
      [CurrencyUnit.Bitcoin]: formatCurrencyStr({
        value: btc,
        unit: CurrencyUnit.Bitcoin,
      }),
      [CurrencyUnit.Satoshi]: formatCurrencyStr({
        value: sats,
        unit: CurrencyUnit.Satoshi,
      }),
      [CurrencyUnit.Millisatoshi]: formatCurrencyStr({
        value: msats,
        unit: CurrencyUnit.Millisatoshi,
      }),
      [CurrencyUnit.Microbitcoin]: "0",
      [CurrencyUnit.Millibitcoin]: "0",
      [CurrencyUnit.Nanobitcoin]: "0",
      [CurrencyUnit.Usd]: formatCurrencyStr({
        value: usd,
        unit: CurrencyUnit.Usd,
      }),
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
      btc: mapWithCurrencyUnits.formatted[CurrencyUnit.Bitcoin],
      sats: mapWithCurrencyUnits.formatted[CurrencyUnit.Satoshi],
      msats: mapWithCurrencyUnits.formatted[CurrencyUnit.Millisatoshi],
    },
    type: "CurrencyMap" as const,
  };
}

export const isCurrencyMap = (
  currencyMap: unknown
): currencyMap is CurrencyMap =>
  typeof currencyMap === "object" &&
  currencyMap !== null &&
  "type" in currencyMap &&
  typeof currencyMap.type === "string" &&
  currencyMap.type === "CurrencyMap";

export const abbrCurrencyUnit = (unit: CurrencyUnit) => {
  switch (unit) {
    case CurrencyUnit.Bitcoin:
      return "BTC";
    case CurrencyUnit.Satoshi:
      return "SAT";
    case CurrencyUnit.Millisatoshi:
      return "MSAT";
    case CurrencyUnit.Usd:
      return "USD";
  }
  return "Unsupported CurrencyUnit";
};

export function formatCurrencyStr(
  amount: CurrencyAmountArg,
  maxFractionDigits?: number,
  compact?: boolean,
  showBtcSymbol = false,
  options: Intl.NumberFormatOptions = {}
) {
  const currencyAmount = getCurrencyAmount(amount);
  let { value: num } = currencyAmount;
  const { unit } = currencyAmount;

  /* Currencies should always be represented in the smallest unit, e.g. cents for USD: */
  if (unit === CurrencyUnit.Usd) {
    num = num / 100;
  }

  function getDefaultMaxFractionDigits(defaultDigits: number) {
    return typeof maxFractionDigits === "undefined"
      ? compact
        ? 1
        : defaultDigits
      : maxFractionDigits;
  }

  // Symbol handled by toLocaleString for USD. These rely on the LightsparkIcons font
  const symbol = !showBtcSymbol
    ? ""
    : unit === CurrencyUnit.Bitcoin
    ? ""
    : unit === CurrencyUnit.Satoshi
    ? ""
    : "";

  const currentLocale = getCurrentLocale();

  switch (unit) {
    case CurrencyUnit.Bitcoin:
      return `${symbol}${num.toLocaleString(currentLocale, {
        notation: compact ? ("compact" as const) : undefined,
        maximumFractionDigits: getDefaultMaxFractionDigits(4),
        ...options,
      })}`;
    case CurrencyUnit.Millisatoshi:
    case CurrencyUnit.Satoshi:
    default:
      return `${symbol}${num.toLocaleString(currentLocale, {
        notation: compact ? ("compact" as const) : undefined,
        maximumFractionDigits: getDefaultMaxFractionDigits(0),
        ...options,
      })}`;
    case CurrencyUnit.Usd:
      return num.toLocaleString(currentLocale, {
        style: "currency",
        currency: defaultCurrencyCode,
        notation: compact ? ("compact" as const) : undefined,
        maximumFractionDigits: getDefaultMaxFractionDigits(2),
        ...options,
      });
  }
}
