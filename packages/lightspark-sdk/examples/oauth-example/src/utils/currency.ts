import {
  CurrencyAmount,
  CurrencyUnit,
} from "@lightsparkdev/lightspark-sdk";

const currentLocale = Intl.NumberFormat().resolvedOptions().locale;
const defaultCurrencyCode = "USD";

type CurrencyLocales = keyof typeof localeToCurrencyCodes;
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
  isLessThan: (other: CurrencyMap) => boolean;
  isGreaterThan: (other: CurrencyMap) => boolean;
  isEqualTo: (other: CurrencyMap) => boolean;
  type: "CurrencyMap";
};
export type CurrencyAmountArg =
  | {
      /* technically the graphql schema has value as any as value but it returns a number in at least up to 18 or more
     digits, which is over 100 billion dollars in millisats, so we can safely assume it's a number */
      value?: number | null;
      /* assume satoshi if not provided */
      unit?: CurrencyUnit;
      __typename?: "CurrencyAmount";
    }
  | undefined
  | null;

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
  currentLocale as CurrencyLocales
);

// Will be returned in CurrencyAmount soon
export const btcPrice = 19500;

export function mapCurrencyAmount(currencyAmount: CurrencyAmount): CurrencyMap {
  const { value, unit } = {
    value: currencyAmount?.originalValue || 0,
    unit: currencyAmount?.originalUnit || CurrencyUnit.SATOSHI,
  };
  let sats = value;
  let msats = value * 1000;
  let btc = value / 1e8;
  let usd = round(btc * btcPrice, 2);

  if (unit === CurrencyUnit.BITCOIN) {
    sats = value * 1e8;
    msats = value * 1e11;
    btc = value;
    usd = round(btc * btcPrice, 2);
  } else if (unit === CurrencyUnit.MILLISATOSHI) {
    sats = value / 1000;
    msats = value;
    btc = value / 1e11;
    usd = round(btc * btcPrice, 2);
  } else if (unit === CurrencyUnit.USD) {
    usd = value;
    btc = value / btcPrice;
    sats = btc * 1e8;
    msats = sats * 1000;
  }

  const mapWithCurrencyUnits = {
    [CurrencyUnit.BITCOIN]: btc,
    [CurrencyUnit.SATOSHI]: sats,
    [CurrencyUnit.FUTURE_VALUE]: sats,
    [CurrencyUnit.MILLISATOSHI]: msats,
    [CurrencyUnit.USD]: usd,
    [CurrencyUnit.MICROBITCOIN]: 0,
    [CurrencyUnit.MILLIBITCOIN]: 0,
    [CurrencyUnit.NANOBITCOIN]: 0,
    formatted: {
      [CurrencyUnit.BITCOIN]: formatCurrencyStr({
        value: btc,
        unit: CurrencyUnit.BITCOIN,
      }),
      [CurrencyUnit.SATOSHI]: formatCurrencyStr({
        value: sats,
        unit: CurrencyUnit.SATOSHI,
      }),
      [CurrencyUnit.FUTURE_VALUE]: formatCurrencyStr({
        value: sats,
        unit: CurrencyUnit.SATOSHI,
      }),
      [CurrencyUnit.MILLISATOSHI]: formatCurrencyStr({
        value: msats,
        unit: CurrencyUnit.MILLISATOSHI,
      }),
      [CurrencyUnit.MICROBITCOIN]: "0",
      [CurrencyUnit.MILLIBITCOIN]: "0",
      [CurrencyUnit.NANOBITCOIN]: "0",
      [CurrencyUnit.USD]: formatCurrencyStr({
        value: usd,
        unit: CurrencyUnit.USD,
      }),
    },
  };

  return {
    ...mapWithCurrencyUnits,
    btc,
    sats,
    msats,
    isZero: msats === 0,
    isLessThan: (other: CurrencyMap) => msats < other.msats,
    isGreaterThan: (other: CurrencyMap) => msats > other.msats,
    isEqualTo: (other: CurrencyMap) => msats === other.msats,
    formatted: {
      ...mapWithCurrencyUnits.formatted,
      btc: mapWithCurrencyUnits.formatted[CurrencyUnit.BITCOIN],
      sats: mapWithCurrencyUnits.formatted[CurrencyUnit.SATOSHI],
      msats: mapWithCurrencyUnits.formatted[CurrencyUnit.MILLISATOSHI],
    },
    type: "CurrencyMap" as const,
  };
}

export const isCurrencyMap = (currencyMap: any): currencyMap is CurrencyMap =>
  currencyMap && currencyMap.type === "CurrencyMap";

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
  return "";
};

export function formatCurrencyStr(
  amount: CurrencyAmountArg,
  maxFractionDigits?: number,
  compact?: boolean,
  showBtcSymbol = false,
  options: Intl.NumberFormatOptions = {}
) {
  const num = typeof amount?.value === "number" ? amount.value : 0;
  const unit = amount?.unit || CurrencyUnit.SATOSHI;

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
    : unit === CurrencyUnit.BITCOIN
    ? ""
    : unit === CurrencyUnit.SATOSHI
    ? ""
    : "";

  switch (unit) {
    case CurrencyUnit.BITCOIN:
    case CurrencyUnit.MILLISATOSHI:
    case CurrencyUnit.SATOSHI:
    default:
      return `${symbol}${num.toLocaleString(currentLocale, {
        notation: compact ? ("compact" as const) : undefined,
        maximumFractionDigits: getDefaultMaxFractionDigits(3),
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

function round(num: number, decimalPlaces = 0) {
  var p = Math.pow(10, decimalPlaces);
  var n = num * p * (1 + Number.EPSILON);
  return Math.round(n) / p;
}
