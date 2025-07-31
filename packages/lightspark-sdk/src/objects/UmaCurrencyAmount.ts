// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface UmaCurrencyAmount {
  value: number;

  currencyId: string;
}

export const UmaCurrencyAmountFromJson = (obj: any): UmaCurrencyAmount => {
  return {
    value: obj["uma_currency_amount_value"],
    currencyId: obj["uma_currency_amount_currency"].id,
  } as UmaCurrencyAmount;
};
export const UmaCurrencyAmountToJson = (obj: UmaCurrencyAmount): any => {
  return {
    uma_currency_amount_value: obj.value,
    uma_currency_amount_currency: { id: obj.currencyId },
  };
};

export const FRAGMENT = `
fragment UmaCurrencyAmountFragment on UmaCurrencyAmount {
    __typename
    uma_currency_amount_value: value
    uma_currency_amount_currency: currency {
        id
    }
}`;

export default UmaCurrencyAmount;
