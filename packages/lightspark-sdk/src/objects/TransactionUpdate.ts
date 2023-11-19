// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type CurrencyAmount from "./CurrencyAmount.js";
import { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import TransactionStatus from "./TransactionStatus.js";

type TransactionUpdate = {
  /**
   * The unique identifier of this entity across all Lightspark systems.
   * Should be treated as an opaque string.
   **/
  id: string;

  /** The date and time when this transaction was initiated. **/
  createdAt: string;

  /** The date and time when the entity was last updated. **/
  updatedAt: string;

  /** The current status of this transaction. **/
  status: TransactionStatus;

  /** The amount of money involved in this transaction. **/
  amount: CurrencyAmount;

  /** The typename of the object **/
  typename: string;

  /** The date and time when this transaction was completed or failed. **/
  resolvedAt?: string;

  /**
   * The hash of this transaction, so it can be uniquely identified on the
   * Lightning Network. *
   */
  transactionHash?: string;
};

export const TransactionUpdateFromJson = (obj: any): TransactionUpdate => {
  return {
    id: obj["id"],
    createdAt: obj["created_at"],
    updatedAt: obj["updated_at"],
    status: TransactionStatus[obj["status"]] ?? TransactionStatus.FUTURE_VALUE,
    amount: CurrencyAmountFromJson(obj["amount"]),
    typename: obj["__typename"] ?? "TransactionUpdate",
    resolvedAt: obj["resolved_at"],
    transactionHash: obj["transaction_hash"],
  };
};

export const FRAGMENT = `
fragment TransactionUpdateFragment on Transaction {
    __typename
    id
    created_at
    updated_at
    status
    resolved_at
    amount {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    transaction_hash
}`;

export default TransactionUpdate;
