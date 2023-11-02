// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { LightsparkException, type Query } from "@lightsparkdev/core";
import type ChannelClosingTransaction from "./ChannelClosingTransaction.js";
import type ChannelOpeningTransaction from "./ChannelOpeningTransaction.js";
import type CurrencyAmount from "./CurrencyAmount.js";
import { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import type Deposit from "./Deposit.js";
import type Entity from "./Entity.js";
import type Transaction from "./Transaction.js";
import TransactionStatus from "./TransactionStatus.js";
import type Withdrawal from "./Withdrawal.js";

/** This object represents an L1 transaction that occurred on the Bitcoin Network. You can retrieve this object to receive information about a specific on-chain transaction made on the Lightning Network associated with your Lightspark Node. **/
type OnChainTransaction = Transaction &
  Entity & {
    /**
     * The unique identifier of this entity across all Lightspark systems. Should be treated as an opaque
     * string.
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

    /** The typename of the object **/
    typename: string;

    /** The date and time when this transaction was completed or failed. **/
    resolvedAt?: string;

    /** The hash of this transaction, so it can be uniquely identified on the Lightning Network. **/
    transactionHash?: string;

    /**
     * The fees that were paid by the wallet sending the transaction to commit it to the Bitcoin
     * blockchain.
     **/
    fees?: CurrencyAmount;

    /**
     * The hash of the block that included this transaction. This will be null for unconfirmed
     * transactions.
     **/
    blockHash?: string;

    /** The number of blockchain confirmations for this transaction in real time. **/
    numConfirmations?: number;
  };

export const OnChainTransactionFromJson = (obj: any): OnChainTransaction => {
  if (obj["__typename"] == "ChannelClosingTransaction") {
    return {
      id: obj["channel_closing_transaction_id"],
      createdAt: obj["channel_closing_transaction_created_at"],
      updatedAt: obj["channel_closing_transaction_updated_at"],
      status:
        TransactionStatus[obj["channel_closing_transaction_status"]] ??
        TransactionStatus.FUTURE_VALUE,
      amount: CurrencyAmountFromJson(obj["channel_closing_transaction_amount"]),
      blockHeight: obj["channel_closing_transaction_block_height"],
      destinationAddresses:
        obj["channel_closing_transaction_destination_addresses"],
      typename: "ChannelClosingTransaction",
      resolvedAt: obj["channel_closing_transaction_resolved_at"],
      transactionHash: obj["channel_closing_transaction_transaction_hash"],
      fees: !!obj["channel_closing_transaction_fees"]
        ? CurrencyAmountFromJson(obj["channel_closing_transaction_fees"])
        : undefined,
      blockHash: obj["channel_closing_transaction_block_hash"],
      numConfirmations: obj["channel_closing_transaction_num_confirmations"],
    } as ChannelClosingTransaction;
  }
  if (obj["__typename"] == "ChannelOpeningTransaction") {
    return {
      id: obj["channel_opening_transaction_id"],
      createdAt: obj["channel_opening_transaction_created_at"],
      updatedAt: obj["channel_opening_transaction_updated_at"],
      status:
        TransactionStatus[obj["channel_opening_transaction_status"]] ??
        TransactionStatus.FUTURE_VALUE,
      amount: CurrencyAmountFromJson(obj["channel_opening_transaction_amount"]),
      blockHeight: obj["channel_opening_transaction_block_height"],
      destinationAddresses:
        obj["channel_opening_transaction_destination_addresses"],
      typename: "ChannelOpeningTransaction",
      resolvedAt: obj["channel_opening_transaction_resolved_at"],
      transactionHash: obj["channel_opening_transaction_transaction_hash"],
      fees: !!obj["channel_opening_transaction_fees"]
        ? CurrencyAmountFromJson(obj["channel_opening_transaction_fees"])
        : undefined,
      blockHash: obj["channel_opening_transaction_block_hash"],
      numConfirmations: obj["channel_opening_transaction_num_confirmations"],
    } as ChannelOpeningTransaction;
  }
  if (obj["__typename"] == "Deposit") {
    return {
      id: obj["deposit_id"],
      createdAt: obj["deposit_created_at"],
      updatedAt: obj["deposit_updated_at"],
      status:
        TransactionStatus[obj["deposit_status"]] ??
        TransactionStatus.FUTURE_VALUE,
      amount: CurrencyAmountFromJson(obj["deposit_amount"]),
      blockHeight: obj["deposit_block_height"],
      destinationAddresses: obj["deposit_destination_addresses"],
      typename: "Deposit",
      resolvedAt: obj["deposit_resolved_at"],
      transactionHash: obj["deposit_transaction_hash"],
      fees: !!obj["deposit_fees"]
        ? CurrencyAmountFromJson(obj["deposit_fees"])
        : undefined,
      blockHash: obj["deposit_block_hash"],
      numConfirmations: obj["deposit_num_confirmations"],
    } as Deposit;
  }
  if (obj["__typename"] == "Withdrawal") {
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
      typename: "Withdrawal",
      resolvedAt: obj["withdrawal_resolved_at"],
      transactionHash: obj["withdrawal_transaction_hash"],
      fees: !!obj["withdrawal_fees"]
        ? CurrencyAmountFromJson(obj["withdrawal_fees"])
        : undefined,
      blockHash: obj["withdrawal_block_hash"],
      numConfirmations: obj["withdrawal_num_confirmations"],
    } as Withdrawal;
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface OnChainTransaction corresponding to the typename=${obj["__typename"]}`,
  );
};

export const FRAGMENT = `
fragment OnChainTransactionFragment on OnChainTransaction {
    __typename
    ... on ChannelClosingTransaction {
        __typename
        channel_closing_transaction_id: id
        channel_closing_transaction_created_at: created_at
        channel_closing_transaction_updated_at: updated_at
        channel_closing_transaction_status: status
        channel_closing_transaction_resolved_at: resolved_at
        channel_closing_transaction_amount: amount {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        channel_closing_transaction_transaction_hash: transaction_hash
        channel_closing_transaction_fees: fees {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        channel_closing_transaction_block_hash: block_hash
        channel_closing_transaction_block_height: block_height
        channel_closing_transaction_destination_addresses: destination_addresses
        channel_closing_transaction_num_confirmations: num_confirmations
    }
    ... on ChannelOpeningTransaction {
        __typename
        channel_opening_transaction_id: id
        channel_opening_transaction_created_at: created_at
        channel_opening_transaction_updated_at: updated_at
        channel_opening_transaction_status: status
        channel_opening_transaction_resolved_at: resolved_at
        channel_opening_transaction_amount: amount {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        channel_opening_transaction_transaction_hash: transaction_hash
        channel_opening_transaction_fees: fees {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        channel_opening_transaction_block_hash: block_hash
        channel_opening_transaction_block_height: block_height
        channel_opening_transaction_destination_addresses: destination_addresses
        channel_opening_transaction_num_confirmations: num_confirmations
    }
    ... on Deposit {
        __typename
        deposit_id: id
        deposit_created_at: created_at
        deposit_updated_at: updated_at
        deposit_status: status
        deposit_resolved_at: resolved_at
        deposit_amount: amount {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        deposit_transaction_hash: transaction_hash
        deposit_fees: fees {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        deposit_block_hash: block_hash
        deposit_block_height: block_height
        deposit_destination_addresses: destination_addresses
        deposit_num_confirmations: num_confirmations
    }
    ... on Withdrawal {
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
    }
}`;

export const getOnChainTransactionQuery = (
  id: string,
): Query<OnChainTransaction> => {
  return {
    queryPayload: `
query GetOnChainTransaction($id: ID!) {
    entity(id: $id) {
        ... on OnChainTransaction {
            ...OnChainTransactionFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => OnChainTransactionFromJson(data.entity),
  };
};

export default OnChainTransaction;
