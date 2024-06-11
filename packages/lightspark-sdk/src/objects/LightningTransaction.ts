// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { LightsparkException, type Query } from "@lightsparkdev/core";
import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";
import IncomingPayment from "./IncomingPayment.js";
import OutgoingPayment from "./OutgoingPayment.js";
import PaymentFailureReason from "./PaymentFailureReason.js";
import {
  PaymentRequestDataFromJson,
  PaymentRequestDataToJson,
} from "./PaymentRequestData.js";
import {
  PostTransactionDataFromJson,
  PostTransactionDataToJson,
} from "./PostTransactionData.js";
import { RichTextFromJson, RichTextToJson } from "./RichText.js";
import type RoutingTransaction from "./RoutingTransaction.js";
import RoutingTransactionFailureReason from "./RoutingTransactionFailureReason.js";
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
    return new IncomingPayment(
      obj["incoming_payment_id"],
      obj["incoming_payment_created_at"],
      obj["incoming_payment_updated_at"],
      TransactionStatus[obj["incoming_payment_status"]] ??
        TransactionStatus.FUTURE_VALUE,
      CurrencyAmountFromJson(obj["incoming_payment_amount"]),
      obj["incoming_payment_is_uma"],
      obj["incoming_payment_destination"].id,
      obj["incoming_payment_is_internal_payment"],
      "IncomingPayment",
      obj["incoming_payment_resolved_at"],
      obj["incoming_payment_transaction_hash"],
      obj["incoming_payment_payment_request"]?.id ?? undefined,
      obj["incoming_payment_uma_post_transaction_data"]?.map((e) =>
        PostTransactionDataFromJson(e),
      ),
    );
  }
  if (obj["__typename"] == "OutgoingPayment") {
    return new OutgoingPayment(
      obj["outgoing_payment_id"],
      obj["outgoing_payment_created_at"],
      obj["outgoing_payment_updated_at"],
      TransactionStatus[obj["outgoing_payment_status"]] ??
        TransactionStatus.FUTURE_VALUE,
      CurrencyAmountFromJson(obj["outgoing_payment_amount"]),
      obj["outgoing_payment_is_uma"],
      obj["outgoing_payment_origin"].id,
      obj["outgoing_payment_is_internal_payment"],
      "OutgoingPayment",
      obj["outgoing_payment_resolved_at"],
      obj["outgoing_payment_transaction_hash"],
      obj["outgoing_payment_destination"]?.id ?? undefined,
      !!obj["outgoing_payment_fees"]
        ? CurrencyAmountFromJson(obj["outgoing_payment_fees"])
        : undefined,
      !!obj["outgoing_payment_payment_request_data"]
        ? PaymentRequestDataFromJson(
            obj["outgoing_payment_payment_request_data"],
          )
        : undefined,
      !!obj["outgoing_payment_failure_reason"]
        ? PaymentFailureReason[obj["outgoing_payment_failure_reason"]] ??
          PaymentFailureReason.FUTURE_VALUE
        : null,
      !!obj["outgoing_payment_failure_message"]
        ? RichTextFromJson(obj["outgoing_payment_failure_message"])
        : undefined,
      obj["outgoing_payment_uma_post_transaction_data"]?.map((e) =>
        PostTransactionDataFromJson(e),
      ),
      obj["outgoing_payment_payment_preimage"],
      obj["outgoing_payment_idempotency_key"],
    );
  }
  if (obj["__typename"] == "RoutingTransaction") {
    return {
      id: obj["routing_transaction_id"],
      createdAt: obj["routing_transaction_created_at"],
      updatedAt: obj["routing_transaction_updated_at"],
      status:
        TransactionStatus[obj["routing_transaction_status"]] ??
        TransactionStatus.FUTURE_VALUE,
      amount: CurrencyAmountFromJson(obj["routing_transaction_amount"]),
      typename: "RoutingTransaction",
      resolvedAt: obj["routing_transaction_resolved_at"],
      transactionHash: obj["routing_transaction_transaction_hash"],
      incomingChannelId:
        obj["routing_transaction_incoming_channel"]?.id ?? undefined,
      outgoingChannelId:
        obj["routing_transaction_outgoing_channel"]?.id ?? undefined,
      fees: !!obj["routing_transaction_fees"]
        ? CurrencyAmountFromJson(obj["routing_transaction_fees"])
        : undefined,
      failureMessage: !!obj["routing_transaction_failure_message"]
        ? RichTextFromJson(obj["routing_transaction_failure_message"])
        : undefined,
      failureReason: !!obj["routing_transaction_failure_reason"]
        ? RoutingTransactionFailureReason[
            obj["routing_transaction_failure_reason"]
          ] ?? RoutingTransactionFailureReason.FUTURE_VALUE
        : null,
    } as RoutingTransaction;
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
      incoming_payment_is_uma: incomingPayment.isUma,
      incoming_payment_destination: { id: incomingPayment.destinationId },
      incoming_payment_payment_request:
        { id: incomingPayment.paymentRequestId } ?? undefined,
      incoming_payment_uma_post_transaction_data:
        incomingPayment.umaPostTransactionData?.map((e) =>
          PostTransactionDataToJson(e),
        ),
      incoming_payment_is_internal_payment: incomingPayment.isInternalPayment,
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
      outgoing_payment_is_uma: outgoingPayment.isUma,
      outgoing_payment_origin: { id: outgoingPayment.originId },
      outgoing_payment_destination:
        { id: outgoingPayment.destinationId } ?? undefined,
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
      outgoing_payment_uma_post_transaction_data:
        outgoingPayment.umaPostTransactionData?.map((e) =>
          PostTransactionDataToJson(e),
        ),
      outgoing_payment_payment_preimage: outgoingPayment.paymentPreimage,
      outgoing_payment_is_internal_payment: outgoingPayment.isInternalPayment,
      outgoing_payment_idempotency_key: outgoingPayment.idempotencyKey,
    };
  }
  if (obj.typename == "RoutingTransaction") {
    const routingTransaction = obj as RoutingTransaction;
    return {
      __typename: "RoutingTransaction",
      routing_transaction_id: routingTransaction.id,
      routing_transaction_created_at: routingTransaction.createdAt,
      routing_transaction_updated_at: routingTransaction.updatedAt,
      routing_transaction_status: routingTransaction.status,
      routing_transaction_resolved_at: routingTransaction.resolvedAt,
      routing_transaction_amount: CurrencyAmountToJson(
        routingTransaction.amount,
      ),
      routing_transaction_transaction_hash: routingTransaction.transactionHash,
      routing_transaction_incoming_channel:
        { id: routingTransaction.incomingChannelId } ?? undefined,
      routing_transaction_outgoing_channel:
        { id: routingTransaction.outgoingChannelId } ?? undefined,
      routing_transaction_fees: routingTransaction.fees
        ? CurrencyAmountToJson(routingTransaction.fees)
        : undefined,
      routing_transaction_failure_message: routingTransaction.failureMessage
        ? RichTextToJson(routingTransaction.failureMessage)
        : undefined,
      routing_transaction_failure_reason: routingTransaction.failureReason,
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
        incoming_payment_is_uma: is_uma
        incoming_payment_destination: destination {
            id
        }
        incoming_payment_payment_request: payment_request {
            id
        }
        incoming_payment_uma_post_transaction_data: uma_post_transaction_data {
            __typename
            post_transaction_data_utxo: utxo
            post_transaction_data_amount: amount {
                __typename
                currency_amount_original_value: original_value
                currency_amount_original_unit: original_unit
                currency_amount_preferred_currency_unit: preferred_currency_unit
                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
            }
        }
        incoming_payment_is_internal_payment: is_internal_payment
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
        outgoing_payment_is_uma: is_uma
        outgoing_payment_origin: origin {
            id
        }
        outgoing_payment_destination: destination {
            id
        }
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
                    ... on GraphNode {
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
                    ... on LightsparkNodeWithOSK {
                        __typename
                        lightspark_node_with_o_s_k_id: id
                        lightspark_node_with_o_s_k_created_at: created_at
                        lightspark_node_with_o_s_k_updated_at: updated_at
                        lightspark_node_with_o_s_k_alias: alias
                        lightspark_node_with_o_s_k_bitcoin_network: bitcoin_network
                        lightspark_node_with_o_s_k_color: color
                        lightspark_node_with_o_s_k_conductivity: conductivity
                        lightspark_node_with_o_s_k_display_name: display_name
                        lightspark_node_with_o_s_k_public_key: public_key
                        lightspark_node_with_o_s_k_owner: owner {
                            id
                        }
                        lightspark_node_with_o_s_k_status: status
                        lightspark_node_with_o_s_k_total_balance: total_balance {
                            __typename
                            currency_amount_original_value: original_value
                            currency_amount_original_unit: original_unit
                            currency_amount_preferred_currency_unit: preferred_currency_unit
                            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                        }
                        lightspark_node_with_o_s_k_total_local_balance: total_local_balance {
                            __typename
                            currency_amount_original_value: original_value
                            currency_amount_original_unit: original_unit
                            currency_amount_preferred_currency_unit: preferred_currency_unit
                            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                        }
                        lightspark_node_with_o_s_k_local_balance: local_balance {
                            __typename
                            currency_amount_original_value: original_value
                            currency_amount_original_unit: original_unit
                            currency_amount_preferred_currency_unit: preferred_currency_unit
                            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                        }
                        lightspark_node_with_o_s_k_remote_balance: remote_balance {
                            __typename
                            currency_amount_original_value: original_value
                            currency_amount_original_unit: original_unit
                            currency_amount_preferred_currency_unit: preferred_currency_unit
                            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                        }
                        lightspark_node_with_o_s_k_blockchain_balance: blockchain_balance {
                            __typename
                            blockchain_balance_total_balance: total_balance {
                                __typename
                                currency_amount_original_value: original_value
                                currency_amount_original_unit: original_unit
                                currency_amount_preferred_currency_unit: preferred_currency_unit
                                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                            }
                            blockchain_balance_confirmed_balance: confirmed_balance {
                                __typename
                                currency_amount_original_value: original_value
                                currency_amount_original_unit: original_unit
                                currency_amount_preferred_currency_unit: preferred_currency_unit
                                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                            }
                            blockchain_balance_unconfirmed_balance: unconfirmed_balance {
                                __typename
                                currency_amount_original_value: original_value
                                currency_amount_original_unit: original_unit
                                currency_amount_preferred_currency_unit: preferred_currency_unit
                                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                            }
                            blockchain_balance_locked_balance: locked_balance {
                                __typename
                                currency_amount_original_value: original_value
                                currency_amount_original_unit: original_unit
                                currency_amount_preferred_currency_unit: preferred_currency_unit
                                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                            }
                            blockchain_balance_required_reserve: required_reserve {
                                __typename
                                currency_amount_original_value: original_value
                                currency_amount_original_unit: original_unit
                                currency_amount_preferred_currency_unit: preferred_currency_unit
                                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                            }
                            blockchain_balance_available_balance: available_balance {
                                __typename
                                currency_amount_original_value: original_value
                                currency_amount_original_unit: original_unit
                                currency_amount_preferred_currency_unit: preferred_currency_unit
                                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                            }
                        }
                        lightspark_node_with_o_s_k_uma_prescreening_utxos: uma_prescreening_utxos
                        lightspark_node_with_o_s_k_balances: balances {
                            __typename
                            balances_owned_balance: owned_balance {
                                __typename
                                currency_amount_original_value: original_value
                                currency_amount_original_unit: original_unit
                                currency_amount_preferred_currency_unit: preferred_currency_unit
                                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                            }
                            balances_available_to_send_balance: available_to_send_balance {
                                __typename
                                currency_amount_original_value: original_value
                                currency_amount_original_unit: original_unit
                                currency_amount_preferred_currency_unit: preferred_currency_unit
                                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                            }
                            balances_available_to_withdraw_balance: available_to_withdraw_balance {
                                __typename
                                currency_amount_original_value: original_value
                                currency_amount_original_unit: original_unit
                                currency_amount_preferred_currency_unit: preferred_currency_unit
                                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                            }
                        }
                        lightspark_node_with_o_s_k_encrypted_signing_private_key: encrypted_signing_private_key {
                            __typename
                            secret_encrypted_value: encrypted_value
                            secret_cipher: cipher
                        }
                    }
                    ... on LightsparkNodeWithRemoteSigning {
                        __typename
                        lightspark_node_with_remote_signing_id: id
                        lightspark_node_with_remote_signing_created_at: created_at
                        lightspark_node_with_remote_signing_updated_at: updated_at
                        lightspark_node_with_remote_signing_alias: alias
                        lightspark_node_with_remote_signing_bitcoin_network: bitcoin_network
                        lightspark_node_with_remote_signing_color: color
                        lightspark_node_with_remote_signing_conductivity: conductivity
                        lightspark_node_with_remote_signing_display_name: display_name
                        lightspark_node_with_remote_signing_public_key: public_key
                        lightspark_node_with_remote_signing_owner: owner {
                            id
                        }
                        lightspark_node_with_remote_signing_status: status
                        lightspark_node_with_remote_signing_total_balance: total_balance {
                            __typename
                            currency_amount_original_value: original_value
                            currency_amount_original_unit: original_unit
                            currency_amount_preferred_currency_unit: preferred_currency_unit
                            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                        }
                        lightspark_node_with_remote_signing_total_local_balance: total_local_balance {
                            __typename
                            currency_amount_original_value: original_value
                            currency_amount_original_unit: original_unit
                            currency_amount_preferred_currency_unit: preferred_currency_unit
                            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                        }
                        lightspark_node_with_remote_signing_local_balance: local_balance {
                            __typename
                            currency_amount_original_value: original_value
                            currency_amount_original_unit: original_unit
                            currency_amount_preferred_currency_unit: preferred_currency_unit
                            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                        }
                        lightspark_node_with_remote_signing_remote_balance: remote_balance {
                            __typename
                            currency_amount_original_value: original_value
                            currency_amount_original_unit: original_unit
                            currency_amount_preferred_currency_unit: preferred_currency_unit
                            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                        }
                        lightspark_node_with_remote_signing_blockchain_balance: blockchain_balance {
                            __typename
                            blockchain_balance_total_balance: total_balance {
                                __typename
                                currency_amount_original_value: original_value
                                currency_amount_original_unit: original_unit
                                currency_amount_preferred_currency_unit: preferred_currency_unit
                                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                            }
                            blockchain_balance_confirmed_balance: confirmed_balance {
                                __typename
                                currency_amount_original_value: original_value
                                currency_amount_original_unit: original_unit
                                currency_amount_preferred_currency_unit: preferred_currency_unit
                                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                            }
                            blockchain_balance_unconfirmed_balance: unconfirmed_balance {
                                __typename
                                currency_amount_original_value: original_value
                                currency_amount_original_unit: original_unit
                                currency_amount_preferred_currency_unit: preferred_currency_unit
                                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                            }
                            blockchain_balance_locked_balance: locked_balance {
                                __typename
                                currency_amount_original_value: original_value
                                currency_amount_original_unit: original_unit
                                currency_amount_preferred_currency_unit: preferred_currency_unit
                                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                            }
                            blockchain_balance_required_reserve: required_reserve {
                                __typename
                                currency_amount_original_value: original_value
                                currency_amount_original_unit: original_unit
                                currency_amount_preferred_currency_unit: preferred_currency_unit
                                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                            }
                            blockchain_balance_available_balance: available_balance {
                                __typename
                                currency_amount_original_value: original_value
                                currency_amount_original_unit: original_unit
                                currency_amount_preferred_currency_unit: preferred_currency_unit
                                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                            }
                        }
                        lightspark_node_with_remote_signing_uma_prescreening_utxos: uma_prescreening_utxos
                        lightspark_node_with_remote_signing_balances: balances {
                            __typename
                            balances_owned_balance: owned_balance {
                                __typename
                                currency_amount_original_value: original_value
                                currency_amount_original_unit: original_unit
                                currency_amount_preferred_currency_unit: preferred_currency_unit
                                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                            }
                            balances_available_to_send_balance: available_to_send_balance {
                                __typename
                                currency_amount_original_value: original_value
                                currency_amount_original_unit: original_unit
                                currency_amount_preferred_currency_unit: preferred_currency_unit
                                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                            }
                            balances_available_to_withdraw_balance: available_to_withdraw_balance {
                                __typename
                                currency_amount_original_value: original_value
                                currency_amount_original_unit: original_unit
                                currency_amount_preferred_currency_unit: preferred_currency_unit
                                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                            }
                        }
                    }
                }
            }
        }
        outgoing_payment_failure_reason: failure_reason
        outgoing_payment_failure_message: failure_message {
            __typename
            rich_text_text: text
        }
        outgoing_payment_uma_post_transaction_data: uma_post_transaction_data {
            __typename
            post_transaction_data_utxo: utxo
            post_transaction_data_amount: amount {
                __typename
                currency_amount_original_value: original_value
                currency_amount_original_unit: original_unit
                currency_amount_preferred_currency_unit: preferred_currency_unit
                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
            }
        }
        outgoing_payment_payment_preimage: payment_preimage
        outgoing_payment_is_internal_payment: is_internal_payment
        outgoing_payment_idempotency_key: idempotency_key
    }
    ... on RoutingTransaction {
        __typename
        routing_transaction_id: id
        routing_transaction_created_at: created_at
        routing_transaction_updated_at: updated_at
        routing_transaction_status: status
        routing_transaction_resolved_at: resolved_at
        routing_transaction_amount: amount {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        routing_transaction_transaction_hash: transaction_hash
        routing_transaction_incoming_channel: incoming_channel {
            id
        }
        routing_transaction_outgoing_channel: outgoing_channel {
            id
        }
        routing_transaction_fees: fees {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        routing_transaction_failure_message: failure_message {
            __typename
            rich_text_text: text
        }
        routing_transaction_failure_reason: failure_reason
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
