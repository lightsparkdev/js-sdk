// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type DailyLiquidityForecast from "./DailyLiquidityForecast.js";
import {
  DailyLiquidityForecastFromJson,
  DailyLiquidityForecastToJson,
} from "./DailyLiquidityForecast.js";
import LightningPaymentDirection from "./LightningPaymentDirection.js";

interface LightsparkNodeToDailyLiquidityForecastsConnection {
  fromDate: string;

  toDate: string;

  direction: LightningPaymentDirection;

  /** The daily liquidity forecasts for the current page of this connection. **/
  entities: DailyLiquidityForecast[];
}

export const LightsparkNodeToDailyLiquidityForecastsConnectionFromJson = (
  obj: any,
): LightsparkNodeToDailyLiquidityForecastsConnection => {
  return {
    fromDate:
      obj["lightspark_node_to_daily_liquidity_forecasts_connection_from_date"],
    toDate:
      obj["lightspark_node_to_daily_liquidity_forecasts_connection_to_date"],
    direction:
      LightningPaymentDirection[
        obj["lightspark_node_to_daily_liquidity_forecasts_connection_direction"]
      ] ?? LightningPaymentDirection.FUTURE_VALUE,
    entities: obj[
      "lightspark_node_to_daily_liquidity_forecasts_connection_entities"
    ].map((e) => DailyLiquidityForecastFromJson(e)),
  } as LightsparkNodeToDailyLiquidityForecastsConnection;
};
export const LightsparkNodeToDailyLiquidityForecastsConnectionToJson = (
  obj: LightsparkNodeToDailyLiquidityForecastsConnection,
): any => {
  return {
    lightspark_node_to_daily_liquidity_forecasts_connection_from_date:
      obj.fromDate,
    lightspark_node_to_daily_liquidity_forecasts_connection_to_date: obj.toDate,
    lightspark_node_to_daily_liquidity_forecasts_connection_direction:
      obj.direction,
    lightspark_node_to_daily_liquidity_forecasts_connection_entities:
      obj.entities.map((e) => DailyLiquidityForecastToJson(e)),
  };
};

export const FRAGMENT = `
fragment LightsparkNodeToDailyLiquidityForecastsConnectionFragment on LightsparkNodeToDailyLiquidityForecastsConnection {
    __typename
    lightspark_node_to_daily_liquidity_forecasts_connection_from_date: from_date
    lightspark_node_to_daily_liquidity_forecasts_connection_to_date: to_date
    lightspark_node_to_daily_liquidity_forecasts_connection_direction: direction
    lightspark_node_to_daily_liquidity_forecasts_connection_entities: entities {
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
    }
}`;

export default LightsparkNodeToDailyLiquidityForecastsConnection;
