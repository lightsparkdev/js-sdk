// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query } from "@lightsparkdev/core";
import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";
import TransactionStatus from "./TransactionStatus.js";

/**
 * This object represents an L1 withdrawal from your Lightspark Node to any Bitcoin wallet. You can
 * retrieve this object to receive detailed information about any L1 withdrawal associated with
 * your Lightspark Node or account. *
 */
interface Withdrawal {
  /**
   * The unique identifier of this entity across all Lightspark systems. Should be treated as an
   * opaque string.
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

  /**
   * The height of the block that included this transaction. This will be zero for unconfirmed
   * transactions.
   **/
  blockHeight: number;

  /** The Bitcoin blockchain addresses this transaction was sent to. **/
  destinationAddresses: string[];

  /** The Lightspark node this withdrawal originated from. **/
  originId: string;

  /** The typename of the object **/
  typename: string;

  /** The date and time when this transaction was completed or failed. **/
  resolvedAt?: string | undefined;

  /** The hash of this transaction, so it can be uniquely identified on the Lightning Network. **/
  transactionHash?: string | undefined;

  /**
   * The fees that were paid by the wallet sending the transaction to commit it to the Bitcoin
   * blockchain.
   **/
  fees?: CurrencyAmount | undefined;

  /**
   * The hash of the block that included this transaction. This will be null for unconfirmed
   * transactions.
   **/
  blockHash?: string | undefined;

  /** The number of blockchain confirmations for this transaction in real time. **/
  numConfirmations?: number | undefined;
}

export const WithdrawalFromJson = (obj: any): Withdrawal => {
  return {
    id: obj["withdrawal_id"],
    createdAt: obj["withdrawal_created_at"],
    updatedAt: obj["withdrawal_updated_at"],
    status:
      TransactionStatus[obj["withdrawal_status"]] ??
      TransactionStatus.FUTURE_VALUE,
    amount: CurrencyAmountFromJson(obj["withdrawal_amount"]),
    blockHeight: obj["withdrawal_block_height"],
    destinationAddresses: obj["withdrawal_destination_addresses"],
    originId: obj["withdrawal_origin"].id,
    typename: "Withdrawal",
    resolvedAt: obj["withdrawal_resolved_at"],
    transactionHash: obj["withdrawal_transaction_hash"],
    fees: !!obj["withdrawal_fees"]
      ? CurrencyAmountFromJson(obj["withdrawal_fees"])
      : undefined,
    blockHash: obj["withdrawal_block_hash"],
    numConfirmations: obj["withdrawal_num_confirmations"],
  } as Withdrawal;
};
export const WithdrawalToJson = (obj: Withdrawal): any => {
  return {
    __typename: "Withdrawal",
    withdrawal_id: obj.id,
    withdrawal_created_at: obj.createdAt,
    withdrawal_updated_at: obj.updatedAt,
    withdrawal_status: obj.status,
    withdrawal_resolved_at: obj.resolvedAt,
    withdrawal_amount: CurrencyAmountToJson(obj.amount),
    withdrawal_transaction_hash: obj.transactionHash,
    withdrawal_fees: obj.fees ? CurrencyAmountToJson(obj.fees) : undefined,
    withdrawal_block_hash: obj.blockHash,
    withdrawal_block_height: obj.blockHeight,
    withdrawal_destination_addresses: obj.destinationAddresses,
    withdrawal_num_confirmations: obj.numConfirmations,
    withdrawal_origin: { id: obj.originId },
  };
};

export const FRAGMENT = `
fragment WithdrawalFragment on Withdrawal {
    __typename
    withdrawal_id: id
    withdrawal_created_at: created_at
    withdrawal_updated_at: updated_at
    withdrawal_status: status
    withdrawal_resolved_at: resolved_at
    withdrawal_amount: amount {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    withdrawal_transaction_hash: transaction_hash
    withdrawal_fees: fees {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    withdrawal_block_hash: block_hash
    withdrawal_block_height: block_height
    withdrawal_destination_addresses: destination_addresses
    withdrawal_num_confirmations: num_confirmations
    withdrawal_origin: origin {
        id
    }
}`;

export const getWithdrawalQuery = (id: string): Query<Withdrawal> => {
  return {
    queryPayload: `
query GetWithdrawal($id: ID!) {
    entity(id: $id) {
        ... on Withdrawal {
            ...WithdrawalFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => WithdrawalFromJson(data.entity),
  };
};

export default Withdrawal;
