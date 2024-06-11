// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query } from "@lightsparkdev/core";
import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";
import TransactionStatus from "./TransactionStatus.js";

/**
 * This object represents a Deposit made to a Lightspark node wallet. This operation occurs for any
 * L1 funding transaction to the wallet. You can retrieve this object to receive detailed
 * information about the deposit. *
 */
interface Deposit {
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

export const DepositFromJson = (obj: any): Deposit => {
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
};
export const DepositToJson = (obj: Deposit): any => {
  return {
    __typename: "Deposit",
    deposit_id: obj.id,
    deposit_created_at: obj.createdAt,
    deposit_updated_at: obj.updatedAt,
    deposit_status: obj.status,
    deposit_resolved_at: obj.resolvedAt,
    deposit_amount: CurrencyAmountToJson(obj.amount),
    deposit_transaction_hash: obj.transactionHash,
    deposit_fees: obj.fees ? CurrencyAmountToJson(obj.fees) : undefined,
    deposit_block_hash: obj.blockHash,
    deposit_block_height: obj.blockHeight,
    deposit_destination_addresses: obj.destinationAddresses,
    deposit_num_confirmations: obj.numConfirmations,
  };
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
