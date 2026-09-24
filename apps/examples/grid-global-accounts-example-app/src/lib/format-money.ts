// Money formatting shared by the platform customers table and the customer
// wallet view, so a balance reads identically on both sides.
//
// Grid balances are a `CurrencyAmount`: `amount` in MINOR units plus a
// `currency` block (`{ code, name, symbol, decimals }`, any field optional).
// The number of minor-unit decimals comes from `currency.decimals` when the
// API provides it (USD/USDB = 2, BTC = 8, …); we fall back to 2 only when it's
// absent rather than assuming every currency is cents.

const DEFAULT_DECIMALS = 2;

/** Pull a three-letter (or ticker) code out of a Currency block. */
export function currencyCode(currency: unknown): string {
  if (currency && typeof currency === "object") {
    const c = currency as Record<string, unknown>;
    if (typeof c.code === "string" && c.code) return c.code;
  }
  if (typeof currency === "string") return currency;
  return "";
}

/**
 * Minor-unit decimal count from a Currency block (USD/USDB = 2, BTC = 8, …),
 * defaulting to 2 when absent. Shared so amount→minor conversions in the money
 * flows match how balances are formatted.
 */
export function currencyDecimals(currency: unknown): number {
  if (currency && typeof currency === "object") {
    const c = currency as Record<string, unknown>;
    if (typeof c.decimals === "number" && c.decimals >= 0) return c.decimals;
  }
  return DEFAULT_DECIMALS;
}

/**
 * Format a minor-unit amount + Currency block as a major-unit string with the
 * code appended, e.g. `1,234.56 USD`. The fraction-digit count follows
 * `currency.decimals` so non-cent currencies (e.g. BTC at 8) render correctly.
 */
export function formatMoney(amount: number, currency: unknown): string {
  const code = currencyCode(currency);
  const decimals = currencyDecimals(currency);
  const major = amount / 10 ** decimals;
  const formatted = major.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return code ? `${formatted} ${code}` : formatted;
}
