// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query } from "@lightsparkdev/core";
import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";
import TransactionStatus from "./TransactionStatus.js";

/**
 * This is an object representing a transaction which closes a channel on the Lightning Network.
 * This operation allocates balances back to the local and remote nodes. *
 */
interface ChannelClosingTransaction {
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

  /** If known, the channel this transaction is closing. **/
  channelId?: string | undefined;
}

export const ChannelClosingTransactionFromJson = (
  obj: any,
): ChannelClosingTransaction => {
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
    channelId: obj["channel_closing_transaction_channel"]?.id ?? undefined,
  } as ChannelClosingTransaction;
};
export const ChannelClosingTransactionToJson = (
  obj: ChannelClosingTransaction,
): any => {
  return {
    __typename: "ChannelClosingTransaction",
    channel_closing_transaction_id: obj.id,
    channel_closing_transaction_created_at: obj.createdAt,
    channel_closing_transaction_updated_at: obj.updatedAt,
    channel_closing_transaction_status: obj.status,
    channel_closing_transaction_resolved_at: obj.resolvedAt,
    channel_closing_transaction_amount: CurrencyAmountToJson(obj.amount),
    channel_closing_transaction_transaction_hash: obj.transactionHash,
    channel_closing_transaction_fees: obj.fees
      ? CurrencyAmountToJson(obj.fees)
      : undefined,
    channel_closing_transaction_block_hash: obj.blockHash,
    channel_closing_transaction_block_height: obj.blockHeight,
    channel_closing_transaction_destination_addresses: obj.destinationAddresses,
    channel_closing_transaction_num_confirmations: obj.numConfirmations,
    channel_closing_transaction_channel: { id: obj.channelId } ?? undefined,
  };
};

export const FRAGMENT = `
fragment ChannelClosingTransactionFragment on ChannelClosingTransaction {
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
    channel_closing_transaction_channel: channel {
        id
    }
}`;

export const getChannelClosingTransactionQuery = (
  id: string,
): Query<ChannelClosingTransaction> => {
  return {
    queryPayload: `
query GetChannelClosingTransaction($id: ID!) {
    entity(id: $id) {
        ... on ChannelClosingTransaction {
            ...ChannelClosingTransactionFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) =>
      ChannelClosingTransactionFromJson(data.entity),
  };
};

export default ChannelClosingTransaction;
