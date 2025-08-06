// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type UmaCurrency from "./UmaCurrency.js";
import { UmaCurrencyFromJson, UmaCurrencyToJson } from "./UmaCurrency.js";

interface UmaCurrencyAmount {
  value: number;

  currency: UmaCurrency;
}

export const UmaCurrencyAmountFromJson = (obj: any): UmaCurrencyAmount => {
  return {
    value: obj["uma_currency_amount_value"],
    currency: UmaCurrencyFromJson(obj["uma_currency_amount_currency"]),
  } as UmaCurrencyAmount;
};
export const UmaCurrencyAmountToJson = (obj: UmaCurrencyAmount): any => {
  return {
    uma_currency_amount_value: obj.value,
    uma_currency_amount_currency: UmaCurrencyToJson(obj.currency),
  };
};

export const FRAGMENT = `
fragment UmaCurrencyAmountFragment on UmaCurrencyAmount {
    __typename
    uma_currency_amount_value: value
    uma_currency_amount_currency: currency {
        code
    }
}`;

export default UmaCurrencyAmount;
