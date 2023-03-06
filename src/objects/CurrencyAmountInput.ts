// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import CurrencyUnit from "./CurrencyUnit.js";

type CurrencyAmountInput = {
  value: number;

  unit: CurrencyUnit;
};

export const CurrencyAmountInputFromJson = (obj: any): CurrencyAmountInput => {
  return {
    value: obj["currency_amount_input_value"],
    unit: CurrencyUnit[obj["currency_amount_input_unit"]],
  } as CurrencyAmountInput;
};

export default CurrencyAmountInput;
