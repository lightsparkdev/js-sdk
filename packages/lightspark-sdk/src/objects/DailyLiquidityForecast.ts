// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";
import LightningPaymentDirection from "./LightningPaymentDirection.js";

interface DailyLiquidityForecast {
  /** The date for which this forecast was generated. **/
  date: string;

  /** The direction for which this forecast was generated. **/
  direction: LightningPaymentDirection;

  /**
   * The value of the forecast. It represents the amount of msats that we think will be moved for
   * that specified direction, for that node, on that date.
   **/
  amount: CurrencyAmount;
}

export const DailyLiquidityForecastFromJson = (
  obj: any,
): DailyLiquidityForecast => {
  return {
    date: obj["daily_liquidity_forecast_date"],
    direction:
      LightningPaymentDirection[obj["daily_liquidity_forecast_direction"]] ??
      LightningPaymentDirection.FUTURE_VALUE,
    amount: CurrencyAmountFromJson(obj["daily_liquidity_forecast_amount"]),
  } as DailyLiquidityForecast;
};
export const DailyLiquidityForecastToJson = (
  obj: DailyLiquidityForecast,
): any => {
  return {
    daily_liquidity_forecast_date: obj.date,
    daily_liquidity_forecast_direction: obj.direction,
    daily_liquidity_forecast_amount: CurrencyAmountToJson(obj.amount),
  };
};

export const FRAGMENT = `
fragment DailyLiquidityForecastFragment on DailyLiquidityForecast {
    __typename
    daily_liquidity_forecast_date: date
    daily_liquidity_forecast_direction: direction
    daily_liquidity_forecast_amount: amount {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
}`;

export default DailyLiquidityForecast;
