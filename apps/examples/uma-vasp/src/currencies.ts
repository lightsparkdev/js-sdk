import { Currency } from "@uma-sdk/core";

const Currencies = {
  USD : "USD",
  BRL : "BRL",
  PHP : "PHP",
  MXN : "MXN",
  CAD : "CAD",
  SAT : "SAT"
} as const

export type CurrencyType = typeof Currencies[keyof typeof Currencies];

const DECIMALS_PER_UNIT: Record<CurrencyType, number> = { USD: 2, SAT: 0, BRL: 2, MXN: 2, PHP: 2, CAD: 2 }

const MSATS_PER_UNIT: Record<CurrencyType, number> = {
  USD : 22883.56,
  SAT: 1_000.0,
  BRL: 4608.84776960979,
  MXN: 1325.80831017669,
  PHP: 405.404106597774,
  CAD: 16836.0372009,
};

export const SATS_CURRENCY = new Currency(
  Currencies.SAT,
  "Satoshis",
  "sat",
  MSATS_PER_UNIT[Currencies.SAT],
  1,
  100_000_000,
  DECIMALS_PER_UNIT[Currencies.SAT],
);

const USD_CURRENCY = new Currency(
  Currencies.USD,
  "US Dollars",
  "$",
  MSATS_PER_UNIT[Currencies.USD],
  1,
  10_000_000,
  DECIMALS_PER_UNIT[Currencies.USD]
);

const BRL_CURRENCY = new Currency(
  Currencies.BRL,
  "Brazilian Real",
  "R$",
  MSATS_PER_UNIT[Currencies.BRL],
  1,
  10_000_000,
  DECIMALS_PER_UNIT[Currencies.BRL],
);

const MXN_CURRENCY = new Currency(
  Currencies.MXN,
  "Mexican Peso",
  "MX$",
  MSATS_PER_UNIT[Currencies.MXN],
  1,
  10_000_000,
  DECIMALS_PER_UNIT[Currencies.MXN],
);

const PHP_CURRENCY = new Currency(
  Currencies.PHP,
  "Philippine Peso",
  "₱",
  MSATS_PER_UNIT[Currencies.PHP],
  1,
  10_000_000,
  DECIMALS_PER_UNIT[Currencies.PHP],
);

const CAD_CURRENCY = new Currency(
  Currencies.CAD,
  "Canadian Dollar",
  "CA$",
  MSATS_PER_UNIT[Currencies.CAD],
  1,
  10_000_000,
  DECIMALS_PER_UNIT[Currencies.CAD],
)

export const CURRENCIES = {
  USD: USD_CURRENCY,
  SAT: SATS_CURRENCY,
  CAD: CAD_CURRENCY,
  BRL: BRL_CURRENCY,
  PHP: PHP_CURRENCY,
  MXN: MXN_CURRENCY
};

const validCurrencyTypes: Set<CurrencyType> = new Set([Currencies.USD, Currencies.SAT]);

// Type guard function to check if a string is a valid CurrencyType
export function isCurrencyType(value: string): value is CurrencyType {
  return validCurrencyTypes.has(value as CurrencyType);
}