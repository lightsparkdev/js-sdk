import { describe, expect, it } from "vitest";

import { currencyCode, formatMoney } from "../format-money";

describe("formatMoney", () => {
  it("formats USD minor units (2 decimals) with the code", () => {
    expect(formatMoney(123456, { code: "USD", decimals: 2 })).toBe(
      "1,234.56 USD",
    );
  });

  it("honors a non-cent decimals count (USDB at 6)", () => {
    expect(formatMoney(5_000_000, { code: "USDB", decimals: 6 })).toBe(
      "5.000000 USDB",
    );
  });

  it("renders 3 USDB (3,000,000 minor, 6 decimals) as 3, not 30,000", () => {
    const out = formatMoney(3_000_000, { code: "USDB", decimals: 6 });
    expect(out).toBe("3.000000 USDB");
    expect(out).not.toContain("30,000");
  });

  it("falls back to 2 decimals when the currency omits decimals", () => {
    expect(formatMoney(100, { code: "USD" })).toBe("1.00 USD");
  });

  it("accepts a bare currency-code string", () => {
    expect(formatMoney(100, "USD")).toBe("1.00 USD");
  });

  it("omits the code when none is present", () => {
    expect(formatMoney(100, {})).toBe("1.00");
  });
});

describe("currencyCode", () => {
  it("reads code from a Currency object", () => {
    expect(currencyCode({ code: "USDB", decimals: 6 })).toBe("USDB");
  });

  it("accepts a bare string and tolerates missing data", () => {
    expect(currencyCode("BTC")).toBe("BTC");
    expect(currencyCode({})).toBe("");
    expect(currencyCode(null)).toBe("");
  });
});
