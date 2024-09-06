import { Currency } from "@uma-sdk/core";



export type CurrencyType = "USD" | "SAT";

type Currencies = Record<CurrencyType, Currency>;

const DECIMALS_PER_UNIT = { USD: 2, SAT: 0, BRL: 2, MXN: 2, PHP: 2, CAD: 2 }

const MSATS_PER_UNIT = {
  USD: 22883.56,
  SAT: 1_000.0,
  BRL: 4608.84776960979,
  MXN: 1325.80831017669,
  PHP: 405.404106597774,
  CAD: 16836.0372009,
};

export const SATS_CURRENCY = new Currency(
  "SAT",
  "Satoshis",
  "sat",
  MSATS_PER_UNIT["SAT"],
  1,
  100_000_000,
  DECIMALS_PER_UNIT["SAT"],
);

export const USD_CURRENCY = new Currency(
  "USD",
  "US Dollars",
  "$",
  MSATS_PER_UNIT["USD"],
  1,
  10_000_000,
  DECIMALS_PER_UNIT['USD']
);

export const CURRENCIES: Currencies = {
  "USD": USD_CURRENCY,
  "SAT": SATS_CURRENCY
};

const validCurrencyTypes: Set<CurrencyType> = new Set(["USD", "SAT"]);

// Type guard function to check if a string is a valid CurrencyType
export function isCurrencyType(value: string): value is CurrencyType {
  return validCurrencyTypes.has(value as CurrencyType);
}