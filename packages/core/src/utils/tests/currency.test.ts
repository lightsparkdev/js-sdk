// add tests for convertCurrencyAmountValue function

import {
  convertCurrencyAmountValue,
  CurrencyUnit,
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
  it("should return the expected value for a CurrencyAmountObj", () => {
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
