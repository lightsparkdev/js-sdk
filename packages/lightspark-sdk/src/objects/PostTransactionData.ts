// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";

/** This object represents post-transaction data that could be used to register payment for KYT. **/
interface PostTransactionData {
  /**
   * The utxo of the channel over which the payment went through in the format of
   * <transaction_hash>:<output_index>.
   **/
  utxo: string;

  /** The amount of funds transferred in the payment. **/
  amount: CurrencyAmount;
}

export const PostTransactionDataFromJson = (obj: any): PostTransactionData => {
  return {
    utxo: obj["post_transaction_data_utxo"],
    amount: CurrencyAmountFromJson(obj["post_transaction_data_amount"]),
  } as PostTransactionData;
};
export const PostTransactionDataToJson = (obj: PostTransactionData): any => {
  return {
    post_transaction_data_utxo: obj.utxo,
    post_transaction_data_amount: CurrencyAmountToJson(obj.amount),
  };
};

export const FRAGMENT = `
fragment PostTransactionDataFragment on PostTransactionData {
    __typename
    post_transaction_data_utxo: utxo
    post_transaction_data_amount: amount {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
}`;

export default PostTransactionData;
