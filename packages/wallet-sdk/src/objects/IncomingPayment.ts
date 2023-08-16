// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query } from "@lightsparkdev/core";
import type CurrencyAmount from "./CurrencyAmount.js";
import { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import type Entity from "./Entity.js";
import type LightningTransaction from "./LightningTransaction.js";
import type Transaction from "./Transaction.js";
import TransactionStatus from "./TransactionStatus.js";

/** This object represents any payment sent to a Lightspark node on the Lightning Network. You can retrieve this object to receive payment related information about a specific payment received by a Lightspark node. **/
type IncomingPayment = LightningTransaction &
  Transaction &
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

    /** The typename of the object **/
    typename: string;

    /** The date and time when this transaction was completed or failed. **/
    resolvedAt?: string;

    /** The hash of this transaction, so it can be uniquely identified on the Lightning Network. **/
    transactionHash?: string;

    /**
     * The optional payment request for this incoming payment, which will be null if the payment is sent
     * through keysend.
     **/
    paymentRequestId?: string;
  };

export const IncomingPaymentFromJson = (obj: any): IncomingPayment => {
  return {
    id: obj["incoming_payment_id"],
    createdAt: obj["incoming_payment_created_at"],
    updatedAt: obj["incoming_payment_updated_at"],
    status:
      TransactionStatus[obj["incoming_payment_status"]] ??
      TransactionStatus.FUTURE_VALUE,
    amount: CurrencyAmountFromJson(obj["incoming_payment_amount"]),
    typename: "IncomingPayment",
    resolvedAt: obj["incoming_payment_resolved_at"],
    transactionHash: obj["incoming_payment_transaction_hash"],
    paymentRequestId: obj["incoming_payment_payment_request"]?.id ?? undefined,
  } as IncomingPayment;
};

export const FRAGMENT = `
fragment IncomingPaymentFragment on IncomingPayment {
    __typename
    incoming_payment_id: id
    incoming_payment_created_at: created_at
    incoming_payment_updated_at: updated_at
    incoming_payment_status: status
    incoming_payment_resolved_at: resolved_at
    incoming_payment_amount: amount {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    incoming_payment_transaction_hash: transaction_hash
    incoming_payment_payment_request: payment_request {
        id
    }
}`;

export const getIncomingPaymentQuery = (id: string): Query<IncomingPayment> => {
  return {
    queryPayload: `
query GetIncomingPayment($id: ID!) {
    entity(id: $id) {
        ... on IncomingPayment {
            ...IncomingPaymentFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => IncomingPaymentFromJson(data.entity),
  };
};

export default IncomingPayment;
