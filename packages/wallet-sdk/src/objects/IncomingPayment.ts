// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query } from "@lightsparkdev/core";
import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";
import TransactionStatus from "./TransactionStatus.js";

/**
 * This object represents any payment sent to a Lightspark node on the Lightning Network. You can
 * retrieve this object to receive payment related information about a specific payment received by
 * a Lightspark node. *
 */
interface IncomingPayment {
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

  /** The typename of the object **/
  typename: string;

  /** The date and time when this transaction was completed or failed. **/
  resolvedAt?: string | undefined;

  /** The hash of this transaction, so it can be uniquely identified on the Lightning Network. **/
  transactionHash?: string | undefined;

  /**
   * The optional payment request for this incoming payment, which will be null if the payment is
   * sent through keysend.
   **/
  paymentRequestId?: string | undefined;
}

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
export const IncomingPaymentToJson = (obj: IncomingPayment): any => {
  return {
    __typename: "IncomingPayment",
    incoming_payment_id: obj.id,
    incoming_payment_created_at: obj.createdAt,
    incoming_payment_updated_at: obj.updatedAt,
    incoming_payment_status: obj.status,
    incoming_payment_resolved_at: obj.resolvedAt,
    incoming_payment_amount: CurrencyAmountToJson(obj.amount),
    incoming_payment_transaction_hash: obj.transactionHash,
    incoming_payment_payment_request: { id: obj.paymentRequestId } ?? undefined,
  };
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
