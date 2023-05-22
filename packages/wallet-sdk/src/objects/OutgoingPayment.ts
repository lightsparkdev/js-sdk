// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { Query } from "@lightsparkdev/core";
import CurrencyAmount, { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import Entity from "./Entity.js";
import LightningTransaction from "./LightningTransaction.js";
import PaymentFailureReason from "./PaymentFailureReason.js";
import PaymentRequestData, {
  PaymentRequestDataFromJson,
} from "./PaymentRequestData.js";
import RichText, { RichTextFromJson } from "./RichText.js";
import Transaction from "./Transaction.js";
import TransactionStatus from "./TransactionStatus.js";

/** A transaction that was sent from a Lightspark node on the Lightning Network. **/
type OutgoingPayment = LightningTransaction &
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

    /** The fees paid by the sender node to send the payment. **/
    fees?: CurrencyAmount;

    /** The data of the payment request that was paid by this transaction, if known. **/
    paymentRequestData?: PaymentRequestData;

    /** If applicable, the reason why the payment failed. **/
    failureReason?: PaymentFailureReason;

    /** If applicable, user-facing error message describing why the payment failed. **/
    failureMessage?: RichText;
  };

export const OutgoingPaymentFromJson = (obj: any): OutgoingPayment => {
  return {
    id: obj["outgoing_payment_id"],
    createdAt: obj["outgoing_payment_created_at"],
    updatedAt: obj["outgoing_payment_updated_at"],
    status:
      TransactionStatus[obj["outgoing_payment_status"]] ??
      TransactionStatus.FUTURE_VALUE,
    amount: CurrencyAmountFromJson(obj["outgoing_payment_amount"]),
    typename: "OutgoingPayment",
    resolvedAt: obj["outgoing_payment_resolved_at"],
    transactionHash: obj["outgoing_payment_transaction_hash"],
    fees: !!obj["outgoing_payment_fees"]
      ? CurrencyAmountFromJson(obj["outgoing_payment_fees"])
      : undefined,
    paymentRequestData: !!obj["outgoing_payment_payment_request_data"]
      ? PaymentRequestDataFromJson(obj["outgoing_payment_payment_request_data"])
      : undefined,
    failureReason: !!obj["outgoing_payment_failure_reason"]
      ? PaymentFailureReason[obj["outgoing_payment_failure_reason"]] ??
        PaymentFailureReason.FUTURE_VALUE
      : null,
    failureMessage: !!obj["outgoing_payment_failure_message"]
      ? RichTextFromJson(obj["outgoing_payment_failure_message"])
      : undefined,
  } as OutgoingPayment;
};

export const FRAGMENT = `
fragment OutgoingPaymentFragment on OutgoingPayment {
    __typename
    outgoing_payment_id: id
    outgoing_payment_created_at: created_at
    outgoing_payment_updated_at: updated_at
    outgoing_payment_status: status
    outgoing_payment_resolved_at: resolved_at
    outgoing_payment_amount: amount {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    outgoing_payment_transaction_hash: transaction_hash
    outgoing_payment_fees: fees {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    outgoing_payment_payment_request_data: payment_request_data {
        __typename
        ... on InvoiceData {
            __typename
            invoice_data_encoded_payment_request: encoded_payment_request
            invoice_data_bitcoin_network: bitcoin_network
            invoice_data_payment_hash: payment_hash
            invoice_data_amount: amount {
                __typename
                currency_amount_original_value: original_value
                currency_amount_original_unit: original_unit
                currency_amount_preferred_currency_unit: preferred_currency_unit
                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
            }
            invoice_data_created_at: created_at
            invoice_data_expires_at: expires_at
            invoice_data_memo: memo
            invoice_data_destination: destination {
                __typename
                graph_node_id: id
                graph_node_created_at: created_at
                graph_node_updated_at: updated_at
                graph_node_alias: alias
                graph_node_bitcoin_network: bitcoin_network
                graph_node_color: color
                graph_node_conductivity: conductivity
                graph_node_display_name: display_name
                graph_node_public_key: public_key
            }
        }
    }
    outgoing_payment_failure_reason: failure_reason
    outgoing_payment_failure_message: failure_message {
        __typename
        rich_text_text: text
    }
}`;

export const getOutgoingPaymentQuery = (id: string): Query<OutgoingPayment> => {
  return {
    queryPayload: `
query GetOutgoingPayment($id: ID!) {
    entity(id: $id) {
        ... on OutgoingPayment {
            ...OutgoingPaymentFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => OutgoingPaymentFromJson(data.entity),
  };
};

export default OutgoingPayment;
