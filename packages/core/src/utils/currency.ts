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
  EUR: "EUR",
  GBP: "GBP",
  INR: "INR",
  BRL: "BRL",
  CAD: "CAD",
  DKK: "DKK",
  HKD: "HKD",
  IDR: "IDR",
  MYR: "MYR",
  SGD: "SGD",
  THB: "THB",
  VND: "VND",
  NGN: "NGN",
  ZAR: "ZAR",
  KES: "KES",
  TZS: "TZS",
  UGX: "UGX",
  BWP: "BWP",
  XOF: "XOF",
  XAF: "XAF",
  MWK: "MWK",
  RWF: "RWF",
  ZMW: "ZMW",
  AED: "AED",
  BDT: "BDT",
  COP: "COP",
  EGP: "EGP",
  GHS: "GHS",
  GTQ: "GTQ",
  HTG: "HTG",
  JMD: "JMD",
  PKR: "PKR",
  ARS: "ARS",
  USDT: "USDT",
  USDC: "USDC",
  USDB: "USDB",

  Bitcoin: "BITCOIN",
  Microbitcoin: "MICROBITCOIN",
  Millibitcoin: "MILLIBITCOIN",
  Millisatoshi: "MILLISATOSHI",
  Nanobitcoin: "NANOBITCOIN",
  Satoshi: "SATOSHI",
  Usd: "USD",
  Mxn: "MXN",
  Php: "PHP",
  Gbp: "GBP",
  Inr: "INR",
  Brl: "BRL",
  Aed: "AED",
  Bdt: "BDT",
  Cop: "COP",
  Egp: "EGP",
  Ghs: "GHS",
  Gtq: "GTQ",
  Htg: "HTG",
  Jmd: "JMD",
  Pkr: "PKR",
  Ars: "ARS",
  Usdt: "USDT",
  Usdc: "USDC",
  Usdb: "USDB",
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
  [CurrencyUnit.EUR]: (v: number) => v,
  [CurrencyUnit.GBP]: (v: number) => v,
  [CurrencyUnit.INR]: (v: number) => v,
  [CurrencyUnit.BRL]: (v: number) => v,
  [CurrencyUnit.CAD]: (v: number) => v,
  [CurrencyUnit.DKK]: (v: number) => v,
  [CurrencyUnit.HKD]: (v: number) => v,
  [CurrencyUnit.IDR]: (v: number) => v,
  [CurrencyUnit.MYR]: (v: number) => v,
  [CurrencyUnit.SGD]: (v: number) => v,
  [CurrencyUnit.THB]: (v: number) => v,
  [CurrencyUnit.VND]: (v: number) => v,
  [CurrencyUnit.NGN]: (v: number) => v,
  [CurrencyUnit.ZAR]: (v: number) => v,
  [CurrencyUnit.KES]: (v: number) => v,
  [CurrencyUnit.TZS]: (v: number) => v,
  [CurrencyUnit.UGX]: (v: number) => v,
  [CurrencyUnit.BWP]: (v: number) => v,
  [CurrencyUnit.XOF]: (v: number) => v,
  [CurrencyUnit.XAF]: (v: number) => v,
  [CurrencyUnit.MWK]: (v: number) => v,
  [CurrencyUnit.RWF]: (v: number) => v,
  [CurrencyUnit.ZMW]: (v: number) => v,
  [CurrencyUnit.AED]: (v: number) => v,
  [CurrencyUnit.BDT]: (v: number) => v,
  [CurrencyUnit.COP]: (v: number) => v,
  [CurrencyUnit.EGP]: (v: number) => v,
  [CurrencyUnit.GHS]: (v: number) => v,
  [CurrencyUnit.GTQ]: (v: number) => v,
  [CurrencyUnit.HTG]: (v: number) => v,
  [CurrencyUnit.JMD]: (v: number) => v,
  [CurrencyUnit.PKR]: (v: number) => v,
  [CurrencyUnit.ARS]: (v: number) => v,
  [CurrencyUnit.USDT]: (v: number) => v,
  [CurrencyUnit.USDC]: (v: number) => v,
  [CurrencyUnit.USDB]: (v: number) => v,
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
    [CurrencyUnit.EUR]: toBitcoinConversion,
    [CurrencyUnit.GBP]: toBitcoinConversion,
    [CurrencyUnit.INR]: toBitcoinConversion,
    [CurrencyUnit.BRL]: toBitcoinConversion,
    [CurrencyUnit.CAD]: toBitcoinConversion,
    [CurrencyUnit.DKK]: toBitcoinConversion,
    [CurrencyUnit.HKD]: toBitcoinConversion,
    [CurrencyUnit.IDR]: toBitcoinConversion,
    [CurrencyUnit.MYR]: toBitcoinConversion,
    [CurrencyUnit.SGD]: toBitcoinConversion,
    [CurrencyUnit.THB]: toBitcoinConversion,
    [CurrencyUnit.VND]: toBitcoinConversion,
    [CurrencyUnit.NGN]: toBitcoinConversion,
    [CurrencyUnit.ZAR]: toBitcoinConversion,
    [CurrencyUnit.KES]: toBitcoinConversion,
    [CurrencyUnit.TZS]: toBitcoinConversion,
    [CurrencyUnit.UGX]: toBitcoinConversion,
    [CurrencyUnit.BWP]: toBitcoinConversion,
    [CurrencyUnit.XOF]: toBitcoinConversion,
    [CurrencyUnit.XAF]: toBitcoinConversion,
    [CurrencyUnit.MWK]: toBitcoinConversion,
    [CurrencyUnit.RWF]: toBitcoinConversion,
    [CurrencyUnit.ZMW]: toBitcoinConversion,
    [CurrencyUnit.AED]: toBitcoinConversion,
    [CurrencyUnit.BDT]: toBitcoinConversion,
    [CurrencyUnit.COP]: toBitcoinConversion,
    [CurrencyUnit.EGP]: toBitcoinConversion,
    [CurrencyUnit.GHS]: toBitcoinConversion,
    [CurrencyUnit.GTQ]: toBitcoinConversion,
    [CurrencyUnit.HTG]: toBitcoinConversion,
    [CurrencyUnit.JMD]: toBitcoinConversion,
    [CurrencyUnit.PKR]: toBitcoinConversion,
    [CurrencyUnit.ARS]: toBitcoinConversion,
    [CurrencyUnit.USDT]: toBitcoinConversion,
    [CurrencyUnit.USDC]: toBitcoinConversion,
    [CurrencyUnit.USDB]: toBitcoinConversion,
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
    [CurrencyUnit.EUR]: toMicrobitcoinConversion,
    [CurrencyUnit.GBP]: toMicrobitcoinConversion,
    [CurrencyUnit.INR]: toMicrobitcoinConversion,
    [CurrencyUnit.BRL]: toMicrobitcoinConversion,
    [CurrencyUnit.CAD]: toMicrobitcoinConversion,
    [CurrencyUnit.DKK]: toMicrobitcoinConversion,
    [CurrencyUnit.HKD]: toMicrobitcoinConversion,
    [CurrencyUnit.IDR]: toMicrobitcoinConversion,
    [CurrencyUnit.MYR]: toMicrobitcoinConversion,
    [CurrencyUnit.SGD]: toMicrobitcoinConversion,
    [CurrencyUnit.THB]: toMicrobitcoinConversion,
    [CurrencyUnit.VND]: toMicrobitcoinConversion,
    [CurrencyUnit.NGN]: toMicrobitcoinConversion,
    [CurrencyUnit.ZAR]: toMicrobitcoinConversion,
    [CurrencyUnit.KES]: toMicrobitcoinConversion,
    [CurrencyUnit.TZS]: toMicrobitcoinConversion,
    [CurrencyUnit.UGX]: toMicrobitcoinConversion,
    [CurrencyUnit.BWP]: toMicrobitcoinConversion,
    [CurrencyUnit.XOF]: toMicrobitcoinConversion,
    [CurrencyUnit.XAF]: toMicrobitcoinConversion,
    [CurrencyUnit.MWK]: toMicrobitcoinConversion,
    [CurrencyUnit.RWF]: toMicrobitcoinConversion,
    [CurrencyUnit.ZMW]: toMicrobitcoinConversion,
    [CurrencyUnit.AED]: toMicrobitcoinConversion,
    [CurrencyUnit.BDT]: toMicrobitcoinConversion,
    [CurrencyUnit.COP]: toMicrobitcoinConversion,
    [CurrencyUnit.EGP]: toMicrobitcoinConversion,
    [CurrencyUnit.GHS]: toMicrobitcoinConversion,
    [CurrencyUnit.GTQ]: toMicrobitcoinConversion,
    [CurrencyUnit.HTG]: toMicrobitcoinConversion,
    [CurrencyUnit.JMD]: toMicrobitcoinConversion,
    [CurrencyUnit.PKR]: toMicrobitcoinConversion,
    [CurrencyUnit.ARS]: toMicrobitcoinConversion,
    [CurrencyUnit.USDT]: toMicrobitcoinConversion,
    [CurrencyUnit.USDC]: toMicrobitcoinConversion,
    [CurrencyUnit.USDB]: toMicrobitcoinConversion,
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
    [CurrencyUnit.EUR]: toMillibitcoinConversion,
    [CurrencyUnit.GBP]: toMillibitcoinConversion,
    [CurrencyUnit.INR]: toMillibitcoinConversion,
    [CurrencyUnit.BRL]: toMillibitcoinConversion,
    [CurrencyUnit.CAD]: toMillibitcoinConversion,
    [CurrencyUnit.DKK]: toMillibitcoinConversion,
    [CurrencyUnit.HKD]: toMillibitcoinConversion,
    [CurrencyUnit.IDR]: toMillibitcoinConversion,
    [CurrencyUnit.MYR]: toMillibitcoinConversion,
    [CurrencyUnit.SGD]: toMillibitcoinConversion,
    [CurrencyUnit.THB]: toMillibitcoinConversion,
    [CurrencyUnit.VND]: toMillibitcoinConversion,
    [CurrencyUnit.NGN]: toMillibitcoinConversion,
    [CurrencyUnit.ZAR]: toMillibitcoinConversion,
    [CurrencyUnit.KES]: toMillibitcoinConversion,
    [CurrencyUnit.TZS]: toMillibitcoinConversion,
    [CurrencyUnit.UGX]: toMillibitcoinConversion,
    [CurrencyUnit.BWP]: toMillibitcoinConversion,
    [CurrencyUnit.XOF]: toMillibitcoinConversion,
    [CurrencyUnit.XAF]: toMillibitcoinConversion,
    [CurrencyUnit.MWK]: toMillibitcoinConversion,
    [CurrencyUnit.RWF]: toMillibitcoinConversion,
    [CurrencyUnit.ZMW]: toMillibitcoinConversion,
    [CurrencyUnit.AED]: toMillibitcoinConversion,
    [CurrencyUnit.BDT]: toMillibitcoinConversion,
    [CurrencyUnit.COP]: toMillibitcoinConversion,
    [CurrencyUnit.EGP]: toMillibitcoinConversion,
    [CurrencyUnit.GHS]: toMillibitcoinConversion,
    [CurrencyUnit.GTQ]: toMillibitcoinConversion,
    [CurrencyUnit.HTG]: toMillibitcoinConversion,
    [CurrencyUnit.JMD]: toMillibitcoinConversion,
    [CurrencyUnit.PKR]: toMillibitcoinConversion,
    [CurrencyUnit.ARS]: toMillibitcoinConversion,
    [CurrencyUnit.USDT]: toMillibitcoinConversion,
    [CurrencyUnit.USDC]: toMillibitcoinConversion,
    [CurrencyUnit.USDB]: toMillibitcoinConversion,
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
    [CurrencyUnit.EUR]: toMillisatoshiConversion,
    [CurrencyUnit.GBP]: toMillisatoshiConversion,
    [CurrencyUnit.INR]: toMillisatoshiConversion,
    [CurrencyUnit.BRL]: toMillisatoshiConversion,
    [CurrencyUnit.CAD]: toMillisatoshiConversion,
    [CurrencyUnit.DKK]: toMillisatoshiConversion,
    [CurrencyUnit.HKD]: toMillisatoshiConversion,
    [CurrencyUnit.IDR]: toMillisatoshiConversion,
    [CurrencyUnit.MYR]: toMillisatoshiConversion,
    [CurrencyUnit.SGD]: toMillisatoshiConversion,
    [CurrencyUnit.THB]: toMillisatoshiConversion,
    [CurrencyUnit.VND]: toMillisatoshiConversion,
    [CurrencyUnit.NGN]: toMillisatoshiConversion,
    [CurrencyUnit.ZAR]: toMillisatoshiConversion,
    [CurrencyUnit.KES]: toMillisatoshiConversion,
    [CurrencyUnit.TZS]: toMillisatoshiConversion,
    [CurrencyUnit.UGX]: toMillisatoshiConversion,
    [CurrencyUnit.BWP]: toMillisatoshiConversion,
    [CurrencyUnit.XOF]: toMillisatoshiConversion,
    [CurrencyUnit.XAF]: toMillisatoshiConversion,
    [CurrencyUnit.MWK]: toMillisatoshiConversion,
    [CurrencyUnit.RWF]: toMillisatoshiConversion,
    [CurrencyUnit.ZMW]: toMillisatoshiConversion,
    [CurrencyUnit.AED]: toMillisatoshiConversion,
    [CurrencyUnit.BDT]: toMillisatoshiConversion,
    [CurrencyUnit.COP]: toMillisatoshiConversion,
    [CurrencyUnit.EGP]: toMillisatoshiConversion,
    [CurrencyUnit.GHS]: toMillisatoshiConversion,
    [CurrencyUnit.GTQ]: toMillisatoshiConversion,
    [CurrencyUnit.HTG]: toMillisatoshiConversion,
    [CurrencyUnit.JMD]: toMillisatoshiConversion,
    [CurrencyUnit.PKR]: toMillisatoshiConversion,
    [CurrencyUnit.ARS]: toMillisatoshiConversion,
    [CurrencyUnit.USDT]: toMillisatoshiConversion,
    [CurrencyUnit.USDC]: toMillisatoshiConversion,
    [CurrencyUnit.USDB]: toMillisatoshiConversion,
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
    [CurrencyUnit.EUR]: toNanobitcoinConversion,
    [CurrencyUnit.GBP]: toNanobitcoinConversion,
    [CurrencyUnit.INR]: toNanobitcoinConversion,
    [CurrencyUnit.BRL]: toNanobitcoinConversion,
    [CurrencyUnit.CAD]: toNanobitcoinConversion,
    [CurrencyUnit.DKK]: toNanobitcoinConversion,
    [CurrencyUnit.HKD]: toNanobitcoinConversion,
    [CurrencyUnit.IDR]: toNanobitcoinConversion,
    [CurrencyUnit.MYR]: toNanobitcoinConversion,
    [CurrencyUnit.SGD]: toNanobitcoinConversion,
    [CurrencyUnit.THB]: toNanobitcoinConversion,
    [CurrencyUnit.VND]: toNanobitcoinConversion,
    [CurrencyUnit.NGN]: toNanobitcoinConversion,
    [CurrencyUnit.ZAR]: toNanobitcoinConversion,
    [CurrencyUnit.KES]: toNanobitcoinConversion,
    [CurrencyUnit.TZS]: toNanobitcoinConversion,
    [CurrencyUnit.UGX]: toNanobitcoinConversion,
    [CurrencyUnit.BWP]: toNanobitcoinConversion,
    [CurrencyUnit.XOF]: toNanobitcoinConversion,
    [CurrencyUnit.XAF]: toNanobitcoinConversion,
    [CurrencyUnit.MWK]: toNanobitcoinConversion,
    [CurrencyUnit.RWF]: toNanobitcoinConversion,
    [CurrencyUnit.ZMW]: toNanobitcoinConversion,
    [CurrencyUnit.AED]: toNanobitcoinConversion,
    [CurrencyUnit.BDT]: toNanobitcoinConversion,
    [CurrencyUnit.COP]: toNanobitcoinConversion,
    [CurrencyUnit.EGP]: toNanobitcoinConversion,
    [CurrencyUnit.GHS]: toNanobitcoinConversion,
    [CurrencyUnit.GTQ]: toNanobitcoinConversion,
    [CurrencyUnit.HTG]: toNanobitcoinConversion,
    [CurrencyUnit.JMD]: toNanobitcoinConversion,
    [CurrencyUnit.PKR]: toNanobitcoinConversion,
    [CurrencyUnit.ARS]: toNanobitcoinConversion,
    [CurrencyUnit.USDT]: toNanobitcoinConversion,
    [CurrencyUnit.USDC]: toNanobitcoinConversion,
    [CurrencyUnit.USDB]: toNanobitcoinConversion,
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
    [CurrencyUnit.EUR]: toSatoshiConversion,
    [CurrencyUnit.GBP]: toSatoshiConversion,
    [CurrencyUnit.INR]: toSatoshiConversion,
    [CurrencyUnit.BRL]: toSatoshiConversion,
    [CurrencyUnit.CAD]: toSatoshiConversion,
    [CurrencyUnit.DKK]: toSatoshiConversion,
    [CurrencyUnit.HKD]: toSatoshiConversion,
    [CurrencyUnit.IDR]: toSatoshiConversion,
    [CurrencyUnit.MYR]: toSatoshiConversion,
    [CurrencyUnit.SGD]: toSatoshiConversion,
    [CurrencyUnit.THB]: toSatoshiConversion,
    [CurrencyUnit.VND]: toSatoshiConversion,
    [CurrencyUnit.NGN]: toSatoshiConversion,
    [CurrencyUnit.ZAR]: toSatoshiConversion,
    [CurrencyUnit.KES]: toSatoshiConversion,
    [CurrencyUnit.TZS]: toSatoshiConversion,
    [CurrencyUnit.UGX]: toSatoshiConversion,
    [CurrencyUnit.BWP]: toSatoshiConversion,
    [CurrencyUnit.XOF]: toSatoshiConversion,
    [CurrencyUnit.XAF]: toSatoshiConversion,
    [CurrencyUnit.MWK]: toSatoshiConversion,
    [CurrencyUnit.RWF]: toSatoshiConversion,
    [CurrencyUnit.ZMW]: toSatoshiConversion,
    [CurrencyUnit.AED]: toSatoshiConversion,
    [CurrencyUnit.BDT]: toSatoshiConversion,
    [CurrencyUnit.COP]: toSatoshiConversion,
    [CurrencyUnit.EGP]: toSatoshiConversion,
    [CurrencyUnit.GHS]: toSatoshiConversion,
    [CurrencyUnit.GTQ]: toSatoshiConversion,
    [CurrencyUnit.HTG]: toSatoshiConversion,
    [CurrencyUnit.JMD]: toSatoshiConversion,
    [CurrencyUnit.PKR]: toSatoshiConversion,
    [CurrencyUnit.ARS]: toSatoshiConversion,
    [CurrencyUnit.USDT]: toSatoshiConversion,
    [CurrencyUnit.USDC]: toSatoshiConversion,
    [CurrencyUnit.USDB]: toSatoshiConversion,
  },
  [CurrencyUnit.USD]: standardUnitConversionObj,
  [CurrencyUnit.MXN]: standardUnitConversionObj,
  [CurrencyUnit.PHP]: standardUnitConversionObj,
  [CurrencyUnit.EUR]: standardUnitConversionObj,
  [CurrencyUnit.GBP]: standardUnitConversionObj,
  [CurrencyUnit.INR]: standardUnitConversionObj,
  [CurrencyUnit.BRL]: standardUnitConversionObj,
  [CurrencyUnit.CAD]: standardUnitConversionObj,
  [CurrencyUnit.DKK]: standardUnitConversionObj,
  [CurrencyUnit.HKD]: standardUnitConversionObj,
  [CurrencyUnit.IDR]: standardUnitConversionObj,
  [CurrencyUnit.MYR]: standardUnitConversionObj,
  [CurrencyUnit.SGD]: standardUnitConversionObj,
  [CurrencyUnit.THB]: standardUnitConversionObj,
  [CurrencyUnit.VND]: standardUnitConversionObj,
  [CurrencyUnit.NGN]: standardUnitConversionObj,
  [CurrencyUnit.ZAR]: standardUnitConversionObj,
  [CurrencyUnit.KES]: standardUnitConversionObj,
  [CurrencyUnit.TZS]: standardUnitConversionObj,
  [CurrencyUnit.UGX]: standardUnitConversionObj,
  [CurrencyUnit.BWP]: standardUnitConversionObj,
  [CurrencyUnit.XOF]: standardUnitConversionObj,
  [CurrencyUnit.XAF]: standardUnitConversionObj,
  [CurrencyUnit.MWK]: standardUnitConversionObj,
  [CurrencyUnit.RWF]: standardUnitConversionObj,
  [CurrencyUnit.ZMW]: standardUnitConversionObj,
  [CurrencyUnit.AED]: standardUnitConversionObj,
  [CurrencyUnit.BDT]: standardUnitConversionObj,
  [CurrencyUnit.COP]: standardUnitConversionObj,
  [CurrencyUnit.EGP]: standardUnitConversionObj,
  [CurrencyUnit.GHS]: standardUnitConversionObj,
  [CurrencyUnit.GTQ]: standardUnitConversionObj,
  [CurrencyUnit.HTG]: standardUnitConversionObj,
  [CurrencyUnit.JMD]: standardUnitConversionObj,
  [CurrencyUnit.PKR]: standardUnitConversionObj,
  [CurrencyUnit.ARS]: standardUnitConversionObj,
  [CurrencyUnit.USDT]: standardUnitConversionObj,
  [CurrencyUnit.USDC]: standardUnitConversionObj,
  [CurrencyUnit.USDB]: standardUnitConversionObj,
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
  [CurrencyUnit.EUR]: number;
  [CurrencyUnit.GBP]: number;
  [CurrencyUnit.INR]: number;
  [CurrencyUnit.BRL]: number;
  [CurrencyUnit.CAD]: number;
  [CurrencyUnit.DKK]: number;
  [CurrencyUnit.HKD]: number;
  [CurrencyUnit.IDR]: number;
  [CurrencyUnit.MYR]: number;
  [CurrencyUnit.SGD]: number;
  [CurrencyUnit.THB]: number;
  [CurrencyUnit.VND]: number;
  [CurrencyUnit.NGN]: number;
  [CurrencyUnit.ZAR]: number;
  [CurrencyUnit.KES]: number;
  [CurrencyUnit.TZS]: number;
  [CurrencyUnit.UGX]: number;
  [CurrencyUnit.BWP]: number;
  [CurrencyUnit.XOF]: number;
  [CurrencyUnit.XAF]: number;
  [CurrencyUnit.MWK]: number;
  [CurrencyUnit.RWF]: number;
  [CurrencyUnit.ZMW]: number;
  [CurrencyUnit.AED]: number;
  [CurrencyUnit.BDT]: number;
  [CurrencyUnit.COP]: number;
  [CurrencyUnit.EGP]: number;
  [CurrencyUnit.GHS]: number;
  [CurrencyUnit.GTQ]: number;
  [CurrencyUnit.HTG]: number;
  [CurrencyUnit.JMD]: number;
  [CurrencyUnit.PKR]: number;
  [CurrencyUnit.ARS]: number;
  [CurrencyUnit.USDT]: number;
  [CurrencyUnit.USDC]: number;
  [CurrencyUnit.USDB]: number;
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
    [CurrencyUnit.EUR]: string;
    [CurrencyUnit.GBP]: string;
    [CurrencyUnit.INR]: string;
    [CurrencyUnit.BRL]: string;
    [CurrencyUnit.CAD]: string;
    [CurrencyUnit.DKK]: string;
    [CurrencyUnit.HKD]: string;
    [CurrencyUnit.IDR]: string;
    [CurrencyUnit.MYR]: string;
    [CurrencyUnit.SGD]: string;
    [CurrencyUnit.THB]: string;
    [CurrencyUnit.VND]: string;
    [CurrencyUnit.NGN]: string;
    [CurrencyUnit.ZAR]: string;
    [CurrencyUnit.KES]: string;
    [CurrencyUnit.TZS]: string;
    [CurrencyUnit.UGX]: string;
    [CurrencyUnit.BWP]: string;
    [CurrencyUnit.XOF]: string;
    [CurrencyUnit.XAF]: string;
    [CurrencyUnit.MWK]: string;
    [CurrencyUnit.RWF]: string;
    [CurrencyUnit.ZMW]: string;
    [CurrencyUnit.AED]: string;
    [CurrencyUnit.BDT]: string;
    [CurrencyUnit.COP]: string;
    [CurrencyUnit.EGP]: string;
    [CurrencyUnit.GHS]: string;
    [CurrencyUnit.GTQ]: string;
    [CurrencyUnit.HTG]: string;
    [CurrencyUnit.JMD]: string;
    [CurrencyUnit.PKR]: string;
    [CurrencyUnit.ARS]: string;
    [CurrencyUnit.USDT]: string;
    [CurrencyUnit.USDC]: string;
    [CurrencyUnit.USDB]: string;
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

/**
 * UMA has flexible currency types which contain details needed to render amounts.
 */
export type UmaCurrency = {
  code: string;
  symbol: string;
  decimals: number;
  name: string;
};

export type UmaCurrencyAmount = {
  value: number;
  currency: UmaCurrency;
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

export function isUmaCurrencyAmount(arg: unknown): arg is UmaCurrencyAmount {
  return (
    typeof arg === "object" &&
    arg !== null &&
    "value" in arg &&
    typeof arg.value === "number" &&
    "currency" in arg &&
    typeof (arg as UmaCurrencyAmount).currency === "object" &&
    typeof (arg as UmaCurrencyAmount).currency.code === "string" &&
    typeof (arg as UmaCurrencyAmount).currency.symbol === "string" &&
    typeof (arg as UmaCurrencyAmount).currency.name === "string" &&
    typeof (arg as UmaCurrencyAmount).currency.decimals === "number"
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
    eur: CurrencyUnit.EUR,
    gbp: CurrencyUnit.GBP,
    inr: CurrencyUnit.INR,
    brl: CurrencyUnit.BRL,
    cad: CurrencyUnit.CAD,
    dkk: CurrencyUnit.DKK,
    hkd: CurrencyUnit.HKD,
    idr: CurrencyUnit.IDR,
    myr: CurrencyUnit.MYR,
    sgd: CurrencyUnit.SGD,
    thb: CurrencyUnit.THB,
    vnd: CurrencyUnit.VND,
    ngn: CurrencyUnit.NGN,
    zar: CurrencyUnit.ZAR,
    kes: CurrencyUnit.KES,
    tzs: CurrencyUnit.TZS,
    ugx: CurrencyUnit.UGX,
    bwp: CurrencyUnit.BWP,
    xof: CurrencyUnit.XOF,
    xaf: CurrencyUnit.XAF,
    mwk: CurrencyUnit.MWK,
    rwf: CurrencyUnit.RWF,
    zmw: CurrencyUnit.ZMW,
    aed: CurrencyUnit.AED,
    bdt: CurrencyUnit.BDT,
    cop: CurrencyUnit.COP,
    egp: CurrencyUnit.EGP,
    ghs: CurrencyUnit.GHS,
    gtq: CurrencyUnit.GTQ,
    htg: CurrencyUnit.HTG,
    jmd: CurrencyUnit.JMD,
    pkr: CurrencyUnit.PKR,
    ars: CurrencyUnit.ARS,
    mibtc: CurrencyUnit.MICROBITCOIN,
    mlbtc: CurrencyUnit.MILLIBITCOIN,
    nbtc: CurrencyUnit.NANOBITCOIN,
    usdt: CurrencyUnit.USDT,
    usdc: CurrencyUnit.USDC,
    usdb: CurrencyUnit.USDB,
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

  const {
    sats,
    msats,
    btc,
    usd,
    mxn,
    php,
    mibtc,
    mlbtc,
    nbtc,
    eur,
    gbp,
    inr,
    brl,
    cad,
    dkk,
    hkd,
    idr,
    myr,
    sgd,
    thb,
    vnd,
    ngn,
    zar,
    kes,
    tzs,
    ugx,
    bwp,
    xof,
    xaf,
    mwk,
    rwf,
    zmw,
    aed,
    bdt,
    cop,
    egp,
    ghs,
    gtq,
    htg,
    jmd,
    pkr,
    ars,
    usdt,
    usdc,
    usdb,
  } = convertCurrencyAmountValues(unit, value, unitsPerBtc, conversionOverride);

  const mapWithCurrencyUnits = {
    [CurrencyUnit.BITCOIN]: btc,
    [CurrencyUnit.SATOSHI]: sats,
    [CurrencyUnit.MILLISATOSHI]: msats,
    [CurrencyUnit.USD]: usd,
    [CurrencyUnit.MXN]: mxn,
    [CurrencyUnit.PHP]: php,
    [CurrencyUnit.EUR]: eur,
    [CurrencyUnit.GBP]: gbp,
    [CurrencyUnit.INR]: inr,
    [CurrencyUnit.BRL]: brl,
    [CurrencyUnit.CAD]: cad,
    [CurrencyUnit.DKK]: dkk,
    [CurrencyUnit.HKD]: hkd,
    [CurrencyUnit.IDR]: idr,
    [CurrencyUnit.MYR]: myr,
    [CurrencyUnit.SGD]: sgd,
    [CurrencyUnit.THB]: thb,
    [CurrencyUnit.VND]: vnd,
    [CurrencyUnit.NGN]: ngn,
    [CurrencyUnit.ZAR]: zar,
    [CurrencyUnit.KES]: kes,
    [CurrencyUnit.TZS]: tzs,
    [CurrencyUnit.UGX]: ugx,
    [CurrencyUnit.BWP]: bwp,
    [CurrencyUnit.XOF]: xof,
    [CurrencyUnit.XAF]: xaf,
    [CurrencyUnit.MWK]: mwk,
    [CurrencyUnit.RWF]: rwf,
    [CurrencyUnit.ZMW]: zmw,
    [CurrencyUnit.AED]: aed,
    [CurrencyUnit.BDT]: bdt,
    [CurrencyUnit.COP]: cop,
    [CurrencyUnit.EGP]: egp,
    [CurrencyUnit.GHS]: ghs,
    [CurrencyUnit.GTQ]: gtq,
    [CurrencyUnit.HTG]: htg,
    [CurrencyUnit.JMD]: jmd,
    [CurrencyUnit.PKR]: pkr,
    [CurrencyUnit.ARS]: ars,
    [CurrencyUnit.MICROBITCOIN]: mibtc,
    [CurrencyUnit.MILLIBITCOIN]: mlbtc,
    [CurrencyUnit.NANOBITCOIN]: nbtc,
    [CurrencyUnit.USDT]: usdt,
    [CurrencyUnit.USDC]: usdc,
    [CurrencyUnit.USDB]: usdb,
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
      [CurrencyUnit.EUR]: formatCurrencyStr({
        value: eur,
        unit: CurrencyUnit.EUR,
      }),
      [CurrencyUnit.GBP]: formatCurrencyStr({
        value: gbp,
        unit: CurrencyUnit.GBP,
      }),
      [CurrencyUnit.INR]: formatCurrencyStr({
        value: inr,
        unit: CurrencyUnit.INR,
      }),
      [CurrencyUnit.BRL]: formatCurrencyStr({
        value: brl,
        unit: CurrencyUnit.BRL,
      }),
      [CurrencyUnit.CAD]: formatCurrencyStr({
        value: cad,
        unit: CurrencyUnit.CAD,
      }),
      [CurrencyUnit.DKK]: formatCurrencyStr({
        value: dkk,
        unit: CurrencyUnit.DKK,
      }),
      [CurrencyUnit.HKD]: formatCurrencyStr({
        value: hkd,
        unit: CurrencyUnit.HKD,
      }),
      [CurrencyUnit.IDR]: formatCurrencyStr({
        value: idr,
        unit: CurrencyUnit.IDR,
      }),
      [CurrencyUnit.MYR]: formatCurrencyStr({
        value: myr,
        unit: CurrencyUnit.MYR,
      }),
      [CurrencyUnit.SGD]: formatCurrencyStr({
        value: sgd,
        unit: CurrencyUnit.SGD,
      }),
      [CurrencyUnit.THB]: formatCurrencyStr({
        value: thb,
        unit: CurrencyUnit.THB,
      }),
      [CurrencyUnit.VND]: formatCurrencyStr({
        value: vnd,
        unit: CurrencyUnit.VND,
      }),
      [CurrencyUnit.NGN]: formatCurrencyStr({
        value: ngn,
        unit: CurrencyUnit.NGN,
      }),
      [CurrencyUnit.ZAR]: formatCurrencyStr({
        value: zar,
        unit: CurrencyUnit.ZAR,
      }),
      [CurrencyUnit.KES]: formatCurrencyStr({
        value: kes,
        unit: CurrencyUnit.KES,
      }),
      [CurrencyUnit.TZS]: formatCurrencyStr({
        value: tzs,
        unit: CurrencyUnit.TZS,
      }),
      [CurrencyUnit.UGX]: formatCurrencyStr({
        value: ugx,
        unit: CurrencyUnit.UGX,
      }),
      [CurrencyUnit.BWP]: formatCurrencyStr({
        value: bwp,
        unit: CurrencyUnit.BWP,
      }),
      [CurrencyUnit.XOF]: formatCurrencyStr({
        value: xof,
        unit: CurrencyUnit.XOF,
      }),
      [CurrencyUnit.XAF]: formatCurrencyStr({
        value: xaf,
        unit: CurrencyUnit.XAF,
      }),
      [CurrencyUnit.MWK]: formatCurrencyStr({
        value: mwk,
        unit: CurrencyUnit.MWK,
      }),
      [CurrencyUnit.RWF]: formatCurrencyStr({
        value: rwf,
        unit: CurrencyUnit.RWF,
      }),
      [CurrencyUnit.ZMW]: formatCurrencyStr({
        value: zmw,
        unit: CurrencyUnit.ZMW,
      }),
      [CurrencyUnit.AED]: formatCurrencyStr({
        value: aed,
        unit: CurrencyUnit.AED,
      }),
      [CurrencyUnit.BDT]: formatCurrencyStr({
        value: bdt,
        unit: CurrencyUnit.BDT,
      }),
      [CurrencyUnit.COP]: formatCurrencyStr({
        value: cop,
        unit: CurrencyUnit.COP,
      }),
      [CurrencyUnit.EGP]: formatCurrencyStr({
        value: egp,
        unit: CurrencyUnit.EGP,
      }),
      [CurrencyUnit.GHS]: formatCurrencyStr({
        value: ghs,
        unit: CurrencyUnit.GHS,
      }),
      [CurrencyUnit.GTQ]: formatCurrencyStr({
        value: gtq,
        unit: CurrencyUnit.GTQ,
      }),
      [CurrencyUnit.HTG]: formatCurrencyStr({
        value: htg,
        unit: CurrencyUnit.HTG,
      }),
      [CurrencyUnit.JMD]: formatCurrencyStr({
        value: jmd,
        unit: CurrencyUnit.JMD,
      }),
      [CurrencyUnit.PKR]: formatCurrencyStr({
        value: pkr,
        unit: CurrencyUnit.PKR,
      }),
      [CurrencyUnit.ARS]: formatCurrencyStr({
        value: ars,
        unit: CurrencyUnit.ARS,
      }),
      [CurrencyUnit.USDT]: formatCurrencyStr({
        value: usdt,
        unit: CurrencyUnit.USDT,
      }),
      [CurrencyUnit.USDC]: formatCurrencyStr({
        value: usdc,
        unit: CurrencyUnit.USDC,
      }),
      [CurrencyUnit.USDB]: formatCurrencyStr({
        value: usdb,
        unit: CurrencyUnit.USDB,
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
    case CurrencyUnit.EUR:
      return "EUR";
    case CurrencyUnit.GBP:
      return "GBP";
    case CurrencyUnit.INR:
      return "INR";
    case CurrencyUnit.USDT:
      return "USDT";
    case CurrencyUnit.USDC:
      return "USDC";
    case CurrencyUnit.USDB:
      return "USDB";
    case CurrencyUnit.BRL:
      return "BRL";
    case CurrencyUnit.CAD:
      return "CAD";
    case CurrencyUnit.DKK:
      return "DKK";
    case CurrencyUnit.HKD:
      return "HKD";
    case CurrencyUnit.IDR:
      return "IDR";
    case CurrencyUnit.MYR:
      return "MYR";
    case CurrencyUnit.SGD:
      return "SGD";
    case CurrencyUnit.THB:
      return "THB";
    case CurrencyUnit.VND:
      return "VND";
    case CurrencyUnit.NGN:
      return "NGN";
    case CurrencyUnit.ZAR:
      return "ZAR";
    case CurrencyUnit.KES:
      return "KES";
    case CurrencyUnit.TZS:
      return "TZS";
    case CurrencyUnit.UGX:
      return "UGX";
    case CurrencyUnit.BWP:
      return "BWP";
    case CurrencyUnit.XOF:
      return "XOF";
    case CurrencyUnit.XAF:
      return "XAF";
    case CurrencyUnit.MWK:
      return "MWK";
    case CurrencyUnit.RWF:
      return "RWF";
    case CurrencyUnit.ZMW:
      return "ZMW";
    case CurrencyUnit.AED:
      return "AED";
    case CurrencyUnit.BDT:
      return "BDT";
    case CurrencyUnit.COP:
      return "COP";
    case CurrencyUnit.EGP:
      return "EGP";
    case CurrencyUnit.GHS:
      return "GHS";
    case CurrencyUnit.GTQ:
      return "GTQ";
    case CurrencyUnit.HTG:
      return "HTG";
    case CurrencyUnit.JMD:
      return "JMD";
    case CurrencyUnit.PKR:
      return "PKR";
    case CurrencyUnit.ARS:
      return "ARS";
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
  /* Default behavior for built in toLocaleString is to not show the unit when it's
     the default unit in the locale (when using default currencyDisplay). We'll do the same. */
  showForCurrentLocaleUnit?: boolean | undefined;
};

type FormatCurrencyStrOptions = {
  /* undefined indicates to use default precision for unit defined below */
  precision?: number | "full" | undefined;
  compact?: boolean | undefined;
  showBtcSymbol?: boolean | undefined;
  appendUnits?: AppendUnitsOptions | undefined;
};

export function formatCurrencyStr(
  amount: CurrencyAmountArg | UmaCurrencyAmount,
  options?: FormatCurrencyStrOptions,
) {
  const { precision, compact, showBtcSymbol } = {
    ...defaultOptions,
    ...options,
  };

  let num: number;
  let unit: string;
  if (isUmaCurrencyAmount(amount)) {
    num = amount.value;
    unit = amount.currency.code;
    if (amount.currency.decimals > 0) {
      num = amount.value / Math.pow(10, amount.currency.decimals);
    }
  } else {
    const currencyAmount = getCurrencyAmount(amount);
    num = currencyAmount.value;
    unit = currencyAmount.unit;
    const centCurrencies = [
      CurrencyUnit.USD,
      CurrencyUnit.MXN,
      CurrencyUnit.PHP,
      CurrencyUnit.EUR,
      CurrencyUnit.GBP,
      CurrencyUnit.INR,
      CurrencyUnit.BRL,
      CurrencyUnit.NGN,
      CurrencyUnit.ZAR,
      CurrencyUnit.KES,
      CurrencyUnit.BWP,
      /* Yellowcard 2-decimal African currencies (stored in smallest units): */
      CurrencyUnit.MWK,
      CurrencyUnit.ZMW,
      /* Tazapay currencies with 2 decimal places (stored in smallest units): */
      CurrencyUnit.IDR,
      CurrencyUnit.THB,
      CurrencyUnit.MYR,
      CurrencyUnit.CAD,
      CurrencyUnit.DKK,
      CurrencyUnit.AED,
      CurrencyUnit.BDT,
      CurrencyUnit.COP,
      CurrencyUnit.EGP,
      CurrencyUnit.GHS,
      CurrencyUnit.GTQ,
      CurrencyUnit.HTG,
      CurrencyUnit.JMD,
      CurrencyUnit.PKR,
      CurrencyUnit.ARS,
      CurrencyUnit.HKD,
      CurrencyUnit.SGD,
    ] as string[];
    /* centCurrencies are always provided in the smallest unit, e.g. cents for USD. These should be
     * divided by 100 for proper display format: */
    if (centCurrencies.includes(unit)) {
      num = num / 100;
    }
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
    : unit === CurrencyUnit.SATOSHI ||
      unit === abbrCurrencyUnit(CurrencyUnit.SATOSHI)
    ? ""
    : "";

  const currentLocale = getCurrentLocale();

  function isFormattableFiatCurrencyCode(currencyCode: string) {
    try {
      new Intl.NumberFormat(currentLocale, {
        style: "currency",
        currency: currencyCode,
      });
      return true;
    } catch {
      return false;
    }
  }

  let formattedStr = "";
  let forceAppendUnits = false;
  switch (unit) {
    case CurrencyUnit.BITCOIN:
      /* In most cases product prefers 4 precision digtis for BTC. In a few places
         full precision (8 digits) are preferred, e.g. for a transaction details page: */
      formattedStr = `${symbol}${num.toLocaleString(currentLocale, {
        notation: compact ? ("compact" as const) : undefined,
        maximumFractionDigits: getDefaultMaxFractionDigits(4, 8),
      })}`;
      break;
    case CurrencyUnit.SATOSHI:
    case abbrCurrencyUnit(CurrencyUnit.SATOSHI):
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
      formattedStr = `${symbol}${num.toLocaleString(currentLocale, {
        notation: compact ? ("compact" as const) : undefined,
        maximumFractionDigits: getDefaultMaxFractionDigits(0, 0),
      })}`;
      break;
    default:
      if (isFormattableFiatCurrencyCode(unit)) {
        formattedStr = num.toLocaleString(currentLocale, {
          style: "currency",
          currency: unit,
          currencyDisplay: "narrowSymbol",
          notation: compact ? ("compact" as const) : undefined,
          maximumFractionDigits: getDefaultMaxFractionDigits(2, 2),
        });
      } else {
        formattedStr = `${num}`;
        forceAppendUnits = true;
      }
      break;
  }

  if (options?.appendUnits || forceAppendUnits) {
    const localeCurrencyCode = localeToCurrencyCode(currentLocale);
    if (
      unit === localeCurrencyCode &&
      options?.appendUnits &&
      !options.appendUnits.showForCurrentLocaleUnit
    ) {
      return formattedStr;
    }

    const unitStr = isUmaCurrencyAmount(amount)
      ? amount.currency.code
      : abbrCurrencyUnit(unit as CurrencyUnitType);

    // Skip appending if the formatted string already contains the currency code
    // This happens for currencies like XOF where Intl.NumberFormat uses the code as the symbol
    if (formattedStr.includes(unitStr)) {
      return formattedStr;
    }

    const unitSuffix = options?.appendUnits?.plural && num > 1 ? "s" : "";
    const unitStrWithSuffix = `${unitStr}${unitSuffix}`;
    formattedStr += ` ${
      options?.appendUnits?.lowercase
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

/**
 * Formats an amount from the smallest currency unit to a display string
 * @param amount - The amount in the smallest currency unit (No decimals)
 * @param currency - The currency object with code and decimals
 * @returns Formatted string like "12.50 USD" or empty string if invalid
 */
export function formatInviteAmount(
  amount: number | null | undefined,
  currency: UmaCurrency | null | undefined,
): string {
  if (!amount || !currency) {
    return "";
  }

  const displayAmount = (amount / Math.pow(10, currency.decimals)).toFixed(
    currency.decimals,
  );

  return `${displayAmount} ${currency.code}`;
}
