// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { LightsparkException, type Query } from "@lightsparkdev/core";
import type ChannelClosingTransaction from "./ChannelClosingTransaction.js";
import type ChannelOpeningTransaction from "./ChannelOpeningTransaction.js";
import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";
import type Deposit from "./Deposit.js";
import TransactionStatus from "./TransactionStatus.js";
import type Withdrawal from "./Withdrawal.js";

/**
 * This object represents an L1 transaction that occurred on the Bitcoin Network. You can retrieve
 * this object to receive information about a specific on-chain transaction made on the Lightning
 * Network associated with your Lightspark Node. *
 */
interface OnChainTransaction {
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

  /** The typename of the object **/
  typename: string;

  /** The date and time when this transaction was completed or failed. **/
  resolvedAt?: string | undefined;

  /** The hash of this transaction, so it can be uniquely identified on the Lightning Network. **/
  transactionHash?: string | undefined;

  /** The fees that were paid by the node for this transaction. **/
  fees?: CurrencyAmount | undefined;

  /**
   * The hash of the block that included this transaction. This will be null for unconfirmed
   * transactions.
   **/
  blockHash?: string | undefined;

  /** The number of blockchain confirmations for this transaction in real time. **/
  numConfirmations?: number | undefined;
}

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
export const OnChainTransactionToJson = (obj: OnChainTransaction): any => {
  if (obj.typename == "ChannelClosingTransaction") {
    const channelClosingTransaction = obj as ChannelClosingTransaction;
    return {
      __typename: "ChannelClosingTransaction",
      channel_closing_transaction_id: channelClosingTransaction.id,
      channel_closing_transaction_created_at:
        channelClosingTransaction.createdAt,
      channel_closing_transaction_updated_at:
        channelClosingTransaction.updatedAt,
      channel_closing_transaction_status: channelClosingTransaction.status,
      channel_closing_transaction_resolved_at:
        channelClosingTransaction.resolvedAt,
      channel_closing_transaction_amount: CurrencyAmountToJson(
        channelClosingTransaction.amount,
      ),
      channel_closing_transaction_transaction_hash:
        channelClosingTransaction.transactionHash,
      channel_closing_transaction_fees: channelClosingTransaction.fees
        ? CurrencyAmountToJson(channelClosingTransaction.fees)
        : undefined,
      channel_closing_transaction_block_hash:
        channelClosingTransaction.blockHash,
      channel_closing_transaction_block_height:
        channelClosingTransaction.blockHeight,
      channel_closing_transaction_destination_addresses:
        channelClosingTransaction.destinationAddresses,
      channel_closing_transaction_num_confirmations:
        channelClosingTransaction.numConfirmations,
    };
  }
  if (obj.typename == "ChannelOpeningTransaction") {
    const channelOpeningTransaction = obj as ChannelOpeningTransaction;
    return {
      __typename: "ChannelOpeningTransaction",
      channel_opening_transaction_id: channelOpeningTransaction.id,
      channel_opening_transaction_created_at:
        channelOpeningTransaction.createdAt,
      channel_opening_transaction_updated_at:
        channelOpeningTransaction.updatedAt,
      channel_opening_transaction_status: channelOpeningTransaction.status,
      channel_opening_transaction_resolved_at:
        channelOpeningTransaction.resolvedAt,
      channel_opening_transaction_amount: CurrencyAmountToJson(
        channelOpeningTransaction.amount,
      ),
      channel_opening_transaction_transaction_hash:
        channelOpeningTransaction.transactionHash,
      channel_opening_transaction_fees: channelOpeningTransaction.fees
        ? CurrencyAmountToJson(channelOpeningTransaction.fees)
        : undefined,
      channel_opening_transaction_block_hash:
        channelOpeningTransaction.blockHash,
      channel_opening_transaction_block_height:
        channelOpeningTransaction.blockHeight,
      channel_opening_transaction_destination_addresses:
        channelOpeningTransaction.destinationAddresses,
      channel_opening_transaction_num_confirmations:
        channelOpeningTransaction.numConfirmations,
    };
  }
  if (obj.typename == "Deposit") {
    const deposit = obj as Deposit;
    return {
      __typename: "Deposit",
      deposit_id: deposit.id,
      deposit_created_at: deposit.createdAt,
      deposit_updated_at: deposit.updatedAt,
      deposit_status: deposit.status,
      deposit_resolved_at: deposit.resolvedAt,
      deposit_amount: CurrencyAmountToJson(deposit.amount),
      deposit_transaction_hash: deposit.transactionHash,
      deposit_fees: deposit.fees
        ? CurrencyAmountToJson(deposit.fees)
        : undefined,
      deposit_block_hash: deposit.blockHash,
      deposit_block_height: deposit.blockHeight,
      deposit_destination_addresses: deposit.destinationAddresses,
      deposit_num_confirmations: deposit.numConfirmations,
    };
  }
  if (obj.typename == "Withdrawal") {
    const withdrawal = obj as Withdrawal;
    return {
      __typename: "Withdrawal",
      withdrawal_id: withdrawal.id,
      withdrawal_created_at: withdrawal.createdAt,
      withdrawal_updated_at: withdrawal.updatedAt,
      withdrawal_status: withdrawal.status,
      withdrawal_resolved_at: withdrawal.resolvedAt,
      withdrawal_amount: CurrencyAmountToJson(withdrawal.amount),
      withdrawal_transaction_hash: withdrawal.transactionHash,
      withdrawal_fees: withdrawal.fees
        ? CurrencyAmountToJson(withdrawal.fees)
        : undefined,
      withdrawal_block_hash: withdrawal.blockHash,
      withdrawal_block_height: withdrawal.blockHeight,
      withdrawal_destination_addresses: withdrawal.destinationAddresses,
      withdrawal_num_confirmations: withdrawal.numConfirmations,
    };
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface OnChainTransaction corresponding to the typename=${obj.typename}`,
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
