// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import CurrencyUnit from "./CurrencyUnit.js";

interface CurrencyAmountInput {
  value: number;

  unit: CurrencyUnit;
}

export const CurrencyAmountInputFromJson = (obj: any): CurrencyAmountInput => {
  return {
    value: obj["currency_amount_input_value"],
    unit:
      CurrencyUnit[obj["currency_amount_input_unit"]] ??
      CurrencyUnit.FUTURE_VALUE,
  } as CurrencyAmountInput;
};
export const CurrencyAmountInputToJson = (obj: CurrencyAmountInput): any => {
  return {
    currency_amount_input_value: obj.value,
    currency_amount_input_unit: obj.unit,
  };
};

export default CurrencyAmountInput;
