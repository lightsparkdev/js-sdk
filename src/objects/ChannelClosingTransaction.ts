// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import Query from "../requester/Query.js";
import CurrencyAmount, { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import Entity from "./Entity.js";
import OnChainTransaction from "./OnChainTransaction.js";
import Transaction from "./Transaction.js";
import TransactionStatus from "./TransactionStatus.js";

/** The transaction on Bitcoin blockchain to close a channel on Lightning Network where the balances are allocated back to local and remote nodes. **/
type ChannelClosingTransaction = OnChainTransaction &
  Transaction &
  Entity & {
    /** The unique identifier of this entity across all Lightspark systems. Should be treated as an opaque string. **/
    id: string;

    /** The date and time when this transaction was initiated. **/
    createdAt: string;

    /** The date and time when the entity was last updated. **/
    updatedAt: string;

    /** The current status of this transaction. **/
    status: TransactionStatus;

    /** The amount of money involved in this transaction. **/
    amount: CurrencyAmount;

    /** The height of the block that included this transaction. This will be zero for unconfirmed transactions. **/
    blockHeight: number;

    /** The Bitcoin blockchain addresses this transaction was sent to. **/
    destinationAddresses: string[];

    /** The typename of the object **/
    typename: string;

    /** The date and time when this transaction was completed or failed. **/
    resolvedAt?: string;

    /** The hash of this transaction, so it can be uniquely identified on the Lightning network. **/
    transactionHash?: string;

    /** The fees that were paid by the wallet sending the transaction to commit it to the Bitcoin blockchain. **/
    fees?: CurrencyAmount;

    /** The hash of the block that included this transaction. This will be null for unconfirmed transactions. **/
    blockHash?: string;

    /** The number of blockchain confirmations for this transaction in real time. **/
    numConfirmations?: number;

    /** If known, the channel this transaction is closing. **/
    channelId?: string;
  };

export const ChannelClosingTransactionFromJson = (
  obj: any
): ChannelClosingTransaction => {
  return {
    id: obj["channel_closing_transaction_id"],
    createdAt: obj["channel_closing_transaction_created_at"],
    updatedAt: obj["channel_closing_transaction_updated_at"],
    status: TransactionStatus[obj["channel_closing_transaction_status"]],
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
        currency_amount_value: value
        currency_amount_unit: unit
    }
    channel_closing_transaction_transaction_hash: transaction_hash
    channel_closing_transaction_fees: fees {
        __typename
        currency_amount_value: value
        currency_amount_unit: unit
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
  id: string
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
