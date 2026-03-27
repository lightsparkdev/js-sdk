/**
 * Builds a country-code → SVG URL map from a Vite `import.meta.glob` result.
 *
 * Usage in an app:
 * ```ts
 * import { buildCountryFlagSvgUrls } from "@lightsparkdev/ui/src/components/CountryFlag/countryFlagSvgUrls";
 * const flagModules = import.meta.glob(
 *   "../../node_modules/@lightsparkdev/ui/src/static/images/country-flags-round/*.svg",
 *   { eager: true, query: "?url" },
 * );
 * export const countryCodeToFlagSvgUrls = buildCountryFlagSvgUrls(flagModules);
 * ```
 */
export function buildCountryFlagSvgUrls(
  flagModules: Record<string, unknown>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(flagModules).map(([path, module]) => {
      const countryCode = path.split("/").pop()?.split(".")[0];
      return [countryCode ?? "", (module as { default: string }).default];
    }),
  );
}

/**
 * Maps currency codes to their primary country code for flag display.
 */
export const CURRENCY_TO_COUNTRY: Record<string, string> = {
  // Americas
  USD: "us",
  MXN: "mx",
  BRL: "br",
  CAD: "ca",
  COP: "co",
  ARS: "ar",
  // Europe
  GBP: "gb",
  DKK: "dk",
  EUR: "eu",
  // Middle East
  AED: "ae",
  // Asia
  INR: "in",
  PHP: "ph",
  IDR: "id",
  MYR: "my",
  SGD: "sg",
  THB: "th",
  VND: "vn",
  CNY: "cn",
  HKD: "hk",
  // Africa
  BWP: "bw",
  KES: "ke",
  MWK: "mw",
  NGN: "ng",
  RWF: "rw",
  ZAR: "za",
  TZS: "tz",
  UGX: "ug",
  ZMW: "zm",
  GHS: "gh",
  CDF: "cd",
  XOF: "sn",
  // Oceania
  AUD: "au",
};
