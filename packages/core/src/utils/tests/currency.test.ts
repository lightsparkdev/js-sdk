// add tests for convertCurrencyAmountValue function

import {
  convertCurrencyAmountValue,
  CurrencyUnit,
  formatCurrencyStr,
  localeToCurrencySymbol,
  mapCurrencyAmount,
  separateCurrencyStrParts,
} from "../currency.js";

describe("convertCurrencyAmountValue", () => {
  it("should return the same value if the currency is the same", () => {
    expect(
      convertCurrencyAmountValue(CurrencyUnit.USD, CurrencyUnit.USD, 10),
    ).toBe(10);
  });
  it("should convert from SAT to mSAT", () => {
    expect(
      convertCurrencyAmountValue(
        CurrencyUnit.SATOSHI,
        CurrencyUnit.MILLISATOSHI,
        100_000,
      ),
    ).toBe(100_000_000);
  });
  it("should convert from SAT to BTC", () => {
    expect(
      convertCurrencyAmountValue(
        CurrencyUnit.SATOSHI,
        CurrencyUnit.BITCOIN,
        100000000,
      ),
    ).toBe(1);
  });
  it("should convert from SAT to USD", () => {
    expect(
      convertCurrencyAmountValue(
        CurrencyUnit.SATOSHI,
        CurrencyUnit.USD,
        100_000,
        25_000_00,
      ),
    ).toBe(25_00);
  });
  it("should convert from USD to mSAT", () => {
    expect(
      convertCurrencyAmountValue(
        CurrencyUnit.USD,
        CurrencyUnit.MILLISATOSHI,
        25_00,
        25_000_00,
      ),
    ).toBe(100_000_000);
  });
  it("should convert from USD to SAT", () => {
    expect(
      convertCurrencyAmountValue(
        CurrencyUnit.USD,
        CurrencyUnit.SATOSHI,
        25_00,
        25_000_00,
      ),
    ).toBe(100_000);
  });
  it("should convert from USD to BTC", () => {
    expect(
      convertCurrencyAmountValue(
        CurrencyUnit.USD,
        CurrencyUnit.BITCOIN,
        25_000_00,
        25_000_00,
      ),
    ).toBe(1);
  });
  it("should convert from BTC to USD", () => {
    expect(
      convertCurrencyAmountValue(
        CurrencyUnit.BITCOIN,
        CurrencyUnit.USD,
        1,
        25_000_00,
      ),
    ).toBe(25_000_00);
  });
  it("should convert from BTC to mSAT", () => {
    expect(
      convertCurrencyAmountValue(
        CurrencyUnit.BITCOIN,
        CurrencyUnit.MILLISATOSHI,
        1,
      ),
    ).toBe(100_000_000_000);
  });
  it("should convert from BTC to SAT", () => {
    expect(
      convertCurrencyAmountValue(CurrencyUnit.BITCOIN, CurrencyUnit.SATOSHI, 1),
    ).toBe(100000000);
  });
  it("should convert from mSAT to BTC", () => {
    expect(
      convertCurrencyAmountValue(
        CurrencyUnit.MILLISATOSHI,
        CurrencyUnit.BITCOIN,
        100_000_000_000,
      ),
    ).toBe(1);
  });
  it("should convert from mSAT to USD", () => {
    expect(
      convertCurrencyAmountValue(
        CurrencyUnit.MILLISATOSHI,
        CurrencyUnit.USD,
        100_000_000,
        25_000_00,
      ),
    ).toBe(25_00);
  });
  it("should convert from mSAT to SAT", () => {
    expect(
      convertCurrencyAmountValue(
        CurrencyUnit.MILLISATOSHI,
        CurrencyUnit.SATOSHI,
        100_000_000,
      ),
    ).toBe(100_000);
  });

  it("should round properly", () => {
    expect(
      convertCurrencyAmountValue(
        CurrencyUnit.SATOSHI,
        CurrencyUnit.USD,
        23_952_251,
        25_124_19,
      ),
    ).toBe(6017_81); // 6017_80.90505169
  });
});

describe("mapCurrencyAmount", () => {
  it("should return the expected value for a CurrencyAmountInputObj with number value", () => {
    const currencyMap = mapCurrencyAmount(
      {
        value: 100_000_000,
        unit: CurrencyUnit.SATOSHI,
      },
      25_000_00,
    );
    expect(currencyMap.btc).toBe(1);
    expect(currencyMap.USD).toBe(25_000_00);
    expect(currencyMap.sats).toBe(100_000_000);
    expect(currencyMap.msats).toBe(100_000_000_000);
    expect(currencyMap.formatted.btc).toBe("1");
    expect(currencyMap.formatted.USD).toBe("$25,000.00");
    expect(currencyMap.formatted.sats).toBe("100,000,000");
    expect(currencyMap.formatted.msats).toBe("100,000,000,000");
    expect(currencyMap.isEqualTo(currencyMap)).toBe(true);

    const smallerCurrencyMap = mapCurrencyAmount(
      {
        value: 100_000,
        unit: CurrencyUnit.SATOSHI,
      },
      25_000_00,
    );

    expect(currencyMap.isEqualTo(smallerCurrencyMap)).toBe(false);
    expect(currencyMap.isGreaterThan(smallerCurrencyMap)).toBe(true);
    expect(currencyMap.isLessThan(smallerCurrencyMap)).toBe(false);
    expect(smallerCurrencyMap.isGreaterThan(currencyMap)).toBe(false);
    expect(smallerCurrencyMap.isLessThan(currencyMap)).toBe(true);
  });

  it("should return the expected value for a CurrencyAmountInputObj with string value", () => {
    const currencyMap = mapCurrencyAmount(
      {
        value: "100000000",
        unit: CurrencyUnit.SATOSHI,
      },
      25_000_00,
    );
    expect(currencyMap.btc).toBe(1);
    expect(currencyMap.USD).toBe(25_000_00);
    expect(currencyMap.sats).toBe(100_000_000);
    expect(currencyMap.msats).toBe(100_000_000_000);
    expect(currencyMap.formatted.btc).toBe("1");
    expect(currencyMap.formatted.USD).toBe("$25,000.00");
    expect(currencyMap.formatted.sats).toBe("100,000,000");
    expect(currencyMap.formatted.msats).toBe("100,000,000,000");
  });

  it("should return the expected value for a CurrencyAmountInputObj with null value", () => {
    const currencyMap = mapCurrencyAmount(
      {
        value: null,
        unit: CurrencyUnit.SATOSHI,
      },
      25_000_00,
    );
    expect(currencyMap.btc).toBe(0);
    expect(currencyMap.USD).toBe(0);
    expect(currencyMap.sats).toBe(0);
    expect(currencyMap.msats).toBe(0);
    expect(currencyMap.formatted.btc).toBe("0");
    expect(currencyMap.formatted.USD).toBe("$0.00");
    expect(currencyMap.formatted.sats).toBe("0");
    expect(currencyMap.formatted.msats).toBe("0");
  });

  it("should return the expected value for a CurrencyAmountObj", () => {
    const currencyMap = mapCurrencyAmount(
      {
        original_value: 147,
        original_unit: CurrencyUnit.SATOSHI,
      },
      25_000_00,
    );
    expect(currencyMap.btc).toBe(0.00000147);
    expect(currencyMap.USD).toBe(4); // 0.03675 should round to 4 cents
    expect(currencyMap.sats).toBe(147);
    expect(currencyMap.msats).toBe(147_000);
    expect(currencyMap.formatted.btc).toBe("0");
    expect(currencyMap.formatted.USD).toBe("$0.04");
    expect(currencyMap.formatted.sats).toBe("147");
    expect(currencyMap.formatted.msats).toBe("147,000");
  });

  it("should have a type error when extra fields are provided as CurrencyAmountArg", () => {
    mapCurrencyAmount(
      {
        original_value: 147,
        original_unit: CurrencyUnit.SATOSHI,
        /* @ts-expect-error `value` cannot be provided with `original_value` */
        value: 100_000_000,
      },
      25_000_00,
    );
  });

  it("should use the backend approximation for the corresponding unit only when provided via CurrencyAmountPreferenceObj", () => {
    const currencyMap = mapCurrencyAmount(
      {
        original_value: 147,
        original_unit: CurrencyUnit.SATOSHI,
        preferred_currency_unit: CurrencyUnit.USD,
        preferred_currency_value_approx: 1_234_56,
      },
      25_000_00,
    );
    expect(currencyMap.btc).toBe(0.00000147);
    expect(currencyMap.USD).toBe(1_234_56);
    expect(currencyMap.sats).toBe(147);
    expect(currencyMap.msats).toBe(147_000);
    expect(currencyMap.formatted.btc).toBe("0");
    expect(currencyMap.formatted.USD).toBe("$1,234.56");
    expect(currencyMap.formatted.sats).toBe("147");
    expect(currencyMap.formatted.msats).toBe("147,000");
  });

  it("should return the expected value for a SDKCurrencyAmountType and use backend approximation for the corresponding unit", () => {
    const currencyMap = mapCurrencyAmount(
      {
        originalValue: 147,
        originalUnit: CurrencyUnit.SATOSHI,
        preferredCurrencyUnit: CurrencyUnit.USD,
        preferredCurrencyValueApprox: 1_234_56,
        preferredCurrencyValueRounded: 1_234_56,
      },
      25_000_00,
    );
    expect(currencyMap.btc).toBe(0.00000147);
    expect(currencyMap.USD).toBe(1_234_56);
    expect(currencyMap.sats).toBe(147);
    expect(currencyMap.msats).toBe(147_000);
    expect(currencyMap.formatted.btc).toBe("0");
    expect(currencyMap.formatted.USD).toBe("$1,234.56");
    expect(currencyMap.formatted.sats).toBe("147");
    expect(currencyMap.formatted.msats).toBe("147,000");
  });
});

describe("localeToCurrencySymbol", () => {
  it("should return the expected currency symbol", () => {
    expect(localeToCurrencySymbol("en-US")).toBe("$");
    expect(localeToCurrencySymbol("en-GB")).toBe("£");
    expect(localeToCurrencySymbol("en-CA")).toBe("$");
    expect(localeToCurrencySymbol("en-AU")).toBe("$");
    expect(localeToCurrencySymbol("en-IN")).toBe("₹");
    expect(localeToCurrencySymbol("en-IE")).toBe("€");
    expect(localeToCurrencySymbol("en-DE")).toBe("€");
    expect(localeToCurrencySymbol("en-FR")).toBe("€");
    expect(localeToCurrencySymbol("en-IT")).toBe("€");
    expect(localeToCurrencySymbol("es-MX")).toBe("$");
    expect(localeToCurrencySymbol("es-CO")).toBe("$");
    expect(localeToCurrencySymbol("pt-BR")).toBe("R$");
    expect(localeToCurrencySymbol("es-AR")).toBe("$");
  });
});

describe("separateCurrencyStrParts", () => {
  const usdFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(5);
  expect(separateCurrencyStrParts(usdFormatted)).toEqual({
    amount: "5.00",
    symbol: "$",
  });

  const gbpFormatted = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(5);
  expect(separateCurrencyStrParts(gbpFormatted)).toEqual({
    amount: "5.00",
    symbol: "£",
  });

  const eurFormatted = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(5);
  expect(separateCurrencyStrParts(eurFormatted)).toEqual({
    amount: "5.00",
    symbol: "€",
  });

  const inrFormatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(5);
  expect(separateCurrencyStrParts(inrFormatted)).toEqual({
    amount: "5.00",
    symbol: "₹",
  });

  const brlFormatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(5);
  expect(separateCurrencyStrParts(brlFormatted)).toEqual({
    amount: "5,00",
    symbol: "R$",
  });

  const arsFormatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(5);
  expect(separateCurrencyStrParts(arsFormatted)).toEqual({
    amount: "5,00",
    symbol: "$",
  });

  const mxnFormatted = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(5);
  expect(separateCurrencyStrParts(mxnFormatted)).toEqual({
    amount: "5.00",
    symbol: "$",
  });
});

describe("formatCurrencyStr", () => {
  it("should return the expected currency string", () => {
    expect(
      formatCurrencyStr({
        value: 5000,
        unit: CurrencyUnit.USD,
      }),
    ).toBe("$50.00");
  });

  it("should return the expected currency string with precision 1", () => {
    expect(
      formatCurrencyStr(
        { value: 5000.245235323, unit: CurrencyUnit.Bitcoin },
        { precision: 1 },
      ),
    ).toBe("5,000.2");
  });

  it("should return the expected currency string with precision full", () => {
    expect(
      formatCurrencyStr(
        { value: 5000.245235323, unit: CurrencyUnit.Bitcoin },
        { precision: "full" },
      ),
    ).toBe("5,000.24523532");
  });

  it("should return the expected currency string with compact", () => {
    expect(
      formatCurrencyStr(
        { value: 5000.245235323, unit: CurrencyUnit.Bitcoin },
        { compact: true },
      ),
    ).toBe("5K");
  });

  it("should return the expected currency string with appendUnits", () => {
    expect(
      formatCurrencyStr(
        { value: 100000, unit: CurrencyUnit.Satoshi },
        { appendUnits: { plural: true, lowercase: true } },
      ),
    ).toBe("100,000 sats");
  });

  it("should return the expected currency string with appendUnits plural and lowercase", () => {
    expect(
      formatCurrencyStr(
        { value: 100000, unit: CurrencyUnit.Satoshi },
        { appendUnits: { plural: true, lowercase: true } },
      ),
    ).toBe("100,000 sats");
  });

  it("should return the expected currency string with appendUnits plural and lowercase with value < 2", () => {
    expect(
      formatCurrencyStr(
        { value: 1, unit: CurrencyUnit.Satoshi },
        { appendUnits: { plural: true, lowercase: true } },
      ),
    ).toBe("1 sat");
  });

  it("should return the expected currency string with appendUnits plural and lowercase with value < 2", () => {
    expect(
      formatCurrencyStr(
        { value: 100012, unit: CurrencyUnit.Mxn },
        { appendUnits: { plural: false } },
      ),
    ).toBe("$1,000.12 MXN");
  });
});

it("should not append XOF if it's already in the formatted string", () => {
  /* This test verifies the fix for PQA-394 where XOF was appearing twice.
   * If Intl.NumberFormat formats with currencyDisplay: 'code', it will include
   * XOF in the output, and we shouldn't append it again. */
  const formatted = formatCurrencyStr(
    { value: 221900, unit: CurrencyUnit.XOF },
    { appendUnits: { plural: false, lowercase: false } },
  );

  /* Count occurrences of 'XOF' or 'CFA' in the result */
  const xofCount = (formatted.match(/XOF/g) || []).length;
  const cfaCount = (formatted.match(/CFA/g) || []).length;

  /* Should have either XOF or CFA, but not both, and only once */
  expect(xofCount + cfaCount).toBeGreaterThan(0);
  expect(xofCount).toBeLessThanOrEqual(1);
  expect(cfaCount).toBeLessThanOrEqual(1);
});
