// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import OnChainTransaction from "./OnChainTransaction.js";
import Transaction from "./Transaction.js";
import Entity from "./Entity.js";
import { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import TransactionStatus from "./TransactionStatus.js";
import Query from "../requester/Query.js";
import CurrencyAmount from "./CurrencyAmount.js";

/** The transaction on Bitcoin blockchain to fund the Lightspark node's wallet. **/
type Deposit = OnChainTransaction &
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

    /** The recipient Lightspark node this deposit was sent to. **/
    destinationId: string;

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

export const DepositFromJson = (obj: any): Deposit => {
  return {
    id: obj["deposit_id"],
    createdAt: obj["deposit_created_at"],
    updatedAt: obj["deposit_updated_at"],
    status: TransactionStatus[obj["deposit_status"]],
    amount: CurrencyAmountFromJson(obj["deposit_amount"]),
    blockHeight: obj["deposit_block_height"],
    destinationAddresses: obj["deposit_destination_addresses"],
    destinationId: obj["deposit_destination"].id,
    typename: "Deposit",
    resolvedAt: obj["deposit_resolved_at"],
    transactionHash: obj["deposit_transaction_hash"],
    fees: !!obj["deposit_fees"]
      ? CurrencyAmountFromJson(obj["deposit_fees"])
      : undefined,
    blockHash: obj["deposit_block_hash"],
    numConfirmations: obj["deposit_num_confirmations"],
  } as Deposit;
};

export const FRAGMENT = `
fragment DepositFragment on Deposit {
    __typename
    deposit_id: id
    deposit_created_at: created_at
    deposit_updated_at: updated_at
    deposit_status: status
    deposit_resolved_at: resolved_at
    deposit_amount: amount {
        __typename
        currency_amount_value: value
        currency_amount_unit: unit
    }
    deposit_transaction_hash: transaction_hash
    deposit_fees: fees {
        __typename
        currency_amount_value: value
        currency_amount_unit: unit
    }
    deposit_block_hash: block_hash
    deposit_block_height: block_height
    deposit_destination_addresses: destination_addresses
    deposit_num_confirmations: num_confirmations
    deposit_destination: destination {
        id
    }
}`;

export const getDepositQuery = (id: string): Query<Deposit> => {
  return {
    queryPayload: `
query GetDeposit($id: ID!) {
    entity(id: $id) {
        ... on Deposit {
            ...DepositFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => DepositFromJson(data.entity),
  };
};

export default Deposit;
