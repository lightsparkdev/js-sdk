// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import CurrencyUnit from "./CurrencyUnit.js";

/** Represents the value and unit for an amount of currency. **/
type CurrencyAmount = {
  /** The numeric value for this CurrencyAmount. **/
  value: number;

  /** The unit of currency for this CurrencyAmount. **/
  unit: CurrencyUnit;
};

export const CurrencyAmountFromJson = (obj: any): CurrencyAmount => {
  return {
    value: obj["currency_amount_value"],
    unit: CurrencyUnit[obj["currency_amount_unit"]],
  } as CurrencyAmount;
};

export const FRAGMENT = `
fragment CurrencyAmountFragment on CurrencyAmount {
    __typename
    currency_amount_value: value
    currency_amount_unit: unit
}`;

export default CurrencyAmount;
