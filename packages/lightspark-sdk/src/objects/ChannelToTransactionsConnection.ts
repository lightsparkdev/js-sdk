// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";

interface ChannelToTransactionsConnection {
  /**
   * The total count of objects in this connection, using the current filters. It is different
   * from the number of objects returned in the current page (in the `entities` field).
   **/
  count: number;

  /**
   * The average fee for the transactions that transited through this channel, according to the
   * filters and constraints of the connection.
   **/
  averageFee?: CurrencyAmount | undefined;

  /**
   * The total amount transacted for the transactions that transited through this channel,
   * according to the filters and constraints of the connection.
   **/
  totalAmountTransacted?: CurrencyAmount | undefined;

  /**
   * The total amount of fees for the transactions that transited through this channel, according
   * to the filters and constraints of the connection.
   **/
  totalFees?: CurrencyAmount | undefined;
}

export const ChannelToTransactionsConnectionFromJson = (
  obj: any,
): ChannelToTransactionsConnection => {
  return {
    count: obj["channel_to_transactions_connection_count"],
    averageFee: !!obj["channel_to_transactions_connection_average_fee"]
      ? CurrencyAmountFromJson(
          obj["channel_to_transactions_connection_average_fee"],
        )
      : undefined,
    totalAmountTransacted: !!obj[
      "channel_to_transactions_connection_total_amount_transacted"
    ]
      ? CurrencyAmountFromJson(
          obj["channel_to_transactions_connection_total_amount_transacted"],
        )
      : undefined,
    totalFees: !!obj["channel_to_transactions_connection_total_fees"]
      ? CurrencyAmountFromJson(
          obj["channel_to_transactions_connection_total_fees"],
        )
      : undefined,
  } as ChannelToTransactionsConnection;
};
export const ChannelToTransactionsConnectionToJson = (
  obj: ChannelToTransactionsConnection,
): any => {
  return {
    channel_to_transactions_connection_count: obj.count,
    channel_to_transactions_connection_average_fee: obj.averageFee
      ? CurrencyAmountToJson(obj.averageFee)
      : undefined,
    channel_to_transactions_connection_total_amount_transacted:
      obj.totalAmountTransacted
        ? CurrencyAmountToJson(obj.totalAmountTransacted)
        : undefined,
    channel_to_transactions_connection_total_fees: obj.totalFees
      ? CurrencyAmountToJson(obj.totalFees)
      : undefined,
  };
};

export const FRAGMENT = `
fragment ChannelToTransactionsConnectionFragment on ChannelToTransactionsConnection {
    __typename
    channel_to_transactions_connection_count: count
    channel_to_transactions_connection_average_fee: average_fee {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    channel_to_transactions_connection_total_amount_transacted: total_amount_transacted {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    channel_to_transactions_connection_total_fees: total_fees {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
}`;

export default ChannelToTransactionsConnection;
