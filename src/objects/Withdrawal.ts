// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import Query from "../requester/Query.js";
import CurrencyAmount, { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import Entity from "./Entity.js";
import OnChainTransaction from "./OnChainTransaction.js";
import Transaction from "./Transaction.js";
import TransactionStatus from "./TransactionStatus.js";

/** The transaction on the Bitcoin blockchain to withdraw funds from the Lightspark node to a Bitcoin wallet. **/
type Withdrawal = OnChainTransaction &
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

    /** The Lightspark node this withdrawal originated from. **/
    originId: string;

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
  };

export const WithdrawalFromJson = (obj: any): Withdrawal => {
  return {
    id: obj["withdrawal_id"],
    createdAt: obj["withdrawal_created_at"],
    updatedAt: obj["withdrawal_updated_at"],
    status: TransactionStatus[obj["withdrawal_status"]],
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
        currency_amount_value: value
        currency_amount_unit: unit
    }
    withdrawal_transaction_hash: transaction_hash
    withdrawal_fees: fees {
        __typename
        currency_amount_value: value
        currency_amount_unit: unit
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
