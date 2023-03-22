// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import CurrencyUnit from "./CurrencyUnit.js";

/** Represents the value and unit for an amount of currency. **/
type CurrencyAmount = {
  /**
   * The numeric value for this CurrencyAmount.
   *
   * @deprecated Use original_value or preferred_value instead.
   **/
  value: number;

  /**
   * The unit of currency for this CurrencyAmount.
   *
   * @deprecated Use original_unit or preferred_unit instead.
   **/
  unit: CurrencyUnit;

  /** The original numeric value for this CurrencyAmount. **/
  originalValue: number;

  /** The original unit of currency for this CurrencyAmount. **/
  originalUnit: CurrencyUnit;

  /** The unit of user's preferred currency for this CurrencyAmount. **/
  preferredCurrencyUnit: CurrencyUnit;

  /** The rounded numeric value for this CurrencyAmount in user's preferred currency. **/
  preferredCurrencyValueRounded: number;

  /** The approximate float value for this CurrencyAmount in user's preferred currency. **/
  preferredCurrencyValueApprox: number;
};

export const CurrencyAmountFromJson = (obj: any): CurrencyAmount => {
  return {
    value: obj["currency_amount_value"],
    unit:
      CurrencyUnit[obj["currency_amount_unit"]] ?? CurrencyUnit.FUTURE_VALUE,
    originalValue: obj["currency_amount_original_value"],
    originalUnit:
      CurrencyUnit[obj["currency_amount_original_unit"]] ??
      CurrencyUnit.FUTURE_VALUE,
    preferredCurrencyUnit:
      CurrencyUnit[obj["currency_amount_preferred_currency_unit"]] ??
      CurrencyUnit.FUTURE_VALUE,
    preferredCurrencyValueRounded:
      obj["currency_amount_preferred_currency_value_rounded"],
    preferredCurrencyValueApprox:
      obj["currency_amount_preferred_currency_value_approx"],
  } as CurrencyAmount;
};

export const FRAGMENT = `
fragment CurrencyAmountFragment on CurrencyAmount {
    __typename
    currency_amount_value: value
    currency_amount_unit: unit
    currency_amount_original_value: original_value
    currency_amount_original_unit: original_unit
    currency_amount_preferred_currency_unit: preferred_currency_unit
    currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
    currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
}`;

export default CurrencyAmount;
