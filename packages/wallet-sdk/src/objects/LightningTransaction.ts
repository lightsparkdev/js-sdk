// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { LightsparkException, type Query } from "@lightsparkdev/core";
import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";
import type IncomingPayment from "./IncomingPayment.js";
import type OutgoingPayment from "./OutgoingPayment.js";
import PaymentFailureReason from "./PaymentFailureReason.js";
import {
  PaymentRequestDataFromJson,
  PaymentRequestDataToJson,
} from "./PaymentRequestData.js";
import { RichTextFromJson, RichTextToJson } from "./RichText.js";
import TransactionStatus from "./TransactionStatus.js";

/**
 * This is an object representing a transaction made over the Lightning Network. You can retrieve
 * this object to receive information about a specific transaction made over Lightning for a
 * Lightspark node. *
 */
interface LightningTransaction {
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
}

export const LightningTransactionFromJson = (
  obj: any,
): LightningTransaction => {
  if (obj["__typename"] == "IncomingPayment") {
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
      paymentRequestId:
        obj["incoming_payment_payment_request"]?.id ?? undefined,
    } as IncomingPayment;
  }
  if (obj["__typename"] == "OutgoingPayment") {
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
        ? PaymentRequestDataFromJson(
            obj["outgoing_payment_payment_request_data"],
          )
        : undefined,
      failureReason: !!obj["outgoing_payment_failure_reason"]
        ? PaymentFailureReason[obj["outgoing_payment_failure_reason"]] ??
          PaymentFailureReason.FUTURE_VALUE
        : null,
      failureMessage: !!obj["outgoing_payment_failure_message"]
        ? RichTextFromJson(obj["outgoing_payment_failure_message"])
        : undefined,
      paymentPreimage: obj["outgoing_payment_payment_preimage"],
    } as OutgoingPayment;
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface LightningTransaction corresponding to the typename=${obj["__typename"]}`,
  );
};
export const LightningTransactionToJson = (obj: LightningTransaction): any => {
  if (obj.typename == "IncomingPayment") {
    const incomingPayment = obj as IncomingPayment;
    return {
      __typename: "IncomingPayment",
      incoming_payment_id: incomingPayment.id,
      incoming_payment_created_at: incomingPayment.createdAt,
      incoming_payment_updated_at: incomingPayment.updatedAt,
      incoming_payment_status: incomingPayment.status,
      incoming_payment_resolved_at: incomingPayment.resolvedAt,
      incoming_payment_amount: CurrencyAmountToJson(incomingPayment.amount),
      incoming_payment_transaction_hash: incomingPayment.transactionHash,
      incoming_payment_payment_request:
        { id: incomingPayment.paymentRequestId } ?? undefined,
    };
  }
  if (obj.typename == "OutgoingPayment") {
    const outgoingPayment = obj as OutgoingPayment;
    return {
      __typename: "OutgoingPayment",
      outgoing_payment_id: outgoingPayment.id,
      outgoing_payment_created_at: outgoingPayment.createdAt,
      outgoing_payment_updated_at: outgoingPayment.updatedAt,
      outgoing_payment_status: outgoingPayment.status,
      outgoing_payment_resolved_at: outgoingPayment.resolvedAt,
      outgoing_payment_amount: CurrencyAmountToJson(outgoingPayment.amount),
      outgoing_payment_transaction_hash: outgoingPayment.transactionHash,
      outgoing_payment_fees: outgoingPayment.fees
        ? CurrencyAmountToJson(outgoingPayment.fees)
        : undefined,
      outgoing_payment_payment_request_data: outgoingPayment.paymentRequestData
        ? PaymentRequestDataToJson(outgoingPayment.paymentRequestData)
        : undefined,
      outgoing_payment_failure_reason: outgoingPayment.failureReason,
      outgoing_payment_failure_message: outgoingPayment.failureMessage
        ? RichTextToJson(outgoingPayment.failureMessage)
        : undefined,
      outgoing_payment_payment_preimage: outgoingPayment.paymentPreimage,
    };
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface LightningTransaction corresponding to the typename=${obj.typename}`,
  );
};

export const FRAGMENT = `
fragment LightningTransactionFragment on LightningTransaction {
    __typename
    ... on IncomingPayment {
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
    }
    ... on OutgoingPayment {
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
        outgoing_payment_payment_preimage: payment_preimage
    }
}`;

export const getLightningTransactionQuery = (
  id: string,
): Query<LightningTransaction> => {
  return {
    queryPayload: `
query GetLightningTransaction($id: ID!) {
    entity(id: $id) {
        ... on LightningTransaction {
            ...LightningTransactionFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => LightningTransactionFromJson(data.entity),
  };
};

export default LightningTransaction;
