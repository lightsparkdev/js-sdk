// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { LightsparkException, type Query } from "@lightsparkdev/core";
import type ChannelClosingTransaction from "./ChannelClosingTransaction.js";
import type ChannelOpeningTransaction from "./ChannelOpeningTransaction.js";
import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";
import type Deposit from "./Deposit.js";
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
import type Withdrawal from "./Withdrawal.js";

/**
 * This object represents a payment transaction. The transaction can occur either on a Bitcoin
 * Network, or over the Lightning Network. You can retrieve this object to receive specific
 * information about a particular transaction tied to your Lightspark Node. *
 */
interface Transaction {
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

export const TransactionFromJson = (obj: any): Transaction => {
  if (obj["__typename"] == "ChannelClosingTransaction") {
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
  }
  if (obj["__typename"] == "ChannelOpeningTransaction") {
    return {
      id: obj["channel_opening_transaction_id"],
      createdAt: obj["channel_opening_transaction_created_at"],
      updatedAt: obj["channel_opening_transaction_updated_at"],
      status:
        TransactionStatus[obj["channel_opening_transaction_status"]] ??
        TransactionStatus.FUTURE_VALUE,
      amount: CurrencyAmountFromJson(obj["channel_opening_transaction_amount"]),
      blockHeight: obj["channel_opening_transaction_block_height"],
      destinationAddresses:
        obj["channel_opening_transaction_destination_addresses"],
      typename: "ChannelOpeningTransaction",
      resolvedAt: obj["channel_opening_transaction_resolved_at"],
      transactionHash: obj["channel_opening_transaction_transaction_hash"],
      fees: !!obj["channel_opening_transaction_fees"]
        ? CurrencyAmountFromJson(obj["channel_opening_transaction_fees"])
        : undefined,
      blockHash: obj["channel_opening_transaction_block_hash"],
      numConfirmations: obj["channel_opening_transaction_num_confirmations"],
      channelId: obj["channel_opening_transaction_channel"]?.id ?? undefined,
    } as ChannelOpeningTransaction;
  }
  if (obj["__typename"] == "Deposit") {
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
  }
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
  if (obj["__typename"] == "Withdrawal") {
    return {
      id: obj["withdrawal_id"],
      createdAt: obj["withdrawal_created_at"],
      updatedAt: obj["withdrawal_updated_at"],
      status:
        TransactionStatus[obj["withdrawal_status"]] ??
        TransactionStatus.FUTURE_VALUE,
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
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface Transaction corresponding to the typename=${obj["__typename"]}`,
  );
};
export const TransactionToJson = (obj: Transaction): any => {
  if (obj.typename == "ChannelClosingTransaction") {
    const channelClosingTransaction = obj as ChannelClosingTransaction;
    return {
      __typename: "ChannelClosingTransaction",
      channel_closing_transaction_id: channelClosingTransaction.id,
      channel_closing_transaction_created_at:
        channelClosingTransaction.createdAt,
      channel_closing_transaction_updated_at:
        channelClosingTransaction.updatedAt,
      channel_closing_transaction_status: channelClosingTransaction.status,
      channel_closing_transaction_resolved_at:
        channelClosingTransaction.resolvedAt,
      channel_closing_transaction_amount: CurrencyAmountToJson(
        channelClosingTransaction.amount,
      ),
      channel_closing_transaction_transaction_hash:
        channelClosingTransaction.transactionHash,
      channel_closing_transaction_fees: channelClosingTransaction.fees
        ? CurrencyAmountToJson(channelClosingTransaction.fees)
        : undefined,
      channel_closing_transaction_block_hash:
        channelClosingTransaction.blockHash,
      channel_closing_transaction_block_height:
        channelClosingTransaction.blockHeight,
      channel_closing_transaction_destination_addresses:
        channelClosingTransaction.destinationAddresses,
      channel_closing_transaction_num_confirmations:
        channelClosingTransaction.numConfirmations,
      channel_closing_transaction_channel:
        { id: channelClosingTransaction.channelId } ?? undefined,
    };
  }
  if (obj.typename == "ChannelOpeningTransaction") {
    const channelOpeningTransaction = obj as ChannelOpeningTransaction;
    return {
      __typename: "ChannelOpeningTransaction",
      channel_opening_transaction_id: channelOpeningTransaction.id,
      channel_opening_transaction_created_at:
        channelOpeningTransaction.createdAt,
      channel_opening_transaction_updated_at:
        channelOpeningTransaction.updatedAt,
      channel_opening_transaction_status: channelOpeningTransaction.status,
      channel_opening_transaction_resolved_at:
        channelOpeningTransaction.resolvedAt,
      channel_opening_transaction_amount: CurrencyAmountToJson(
        channelOpeningTransaction.amount,
      ),
      channel_opening_transaction_transaction_hash:
        channelOpeningTransaction.transactionHash,
      channel_opening_transaction_fees: channelOpeningTransaction.fees
        ? CurrencyAmountToJson(channelOpeningTransaction.fees)
        : undefined,
      channel_opening_transaction_block_hash:
        channelOpeningTransaction.blockHash,
      channel_opening_transaction_block_height:
        channelOpeningTransaction.blockHeight,
      channel_opening_transaction_destination_addresses:
        channelOpeningTransaction.destinationAddresses,
      channel_opening_transaction_num_confirmations:
        channelOpeningTransaction.numConfirmations,
      channel_opening_transaction_channel:
        { id: channelOpeningTransaction.channelId } ?? undefined,
    };
  }
  if (obj.typename == "Deposit") {
    const deposit = obj as Deposit;
    return {
      __typename: "Deposit",
      deposit_id: deposit.id,
      deposit_created_at: deposit.createdAt,
      deposit_updated_at: deposit.updatedAt,
      deposit_status: deposit.status,
      deposit_resolved_at: deposit.resolvedAt,
      deposit_amount: CurrencyAmountToJson(deposit.amount),
      deposit_transaction_hash: deposit.transactionHash,
      deposit_fees: deposit.fees
        ? CurrencyAmountToJson(deposit.fees)
        : undefined,
      deposit_block_hash: deposit.blockHash,
      deposit_block_height: deposit.blockHeight,
      deposit_destination_addresses: deposit.destinationAddresses,
      deposit_num_confirmations: deposit.numConfirmations,
      deposit_destination: { id: deposit.destinationId },
    };
  }
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
  if (obj.typename == "Withdrawal") {
    const withdrawal = obj as Withdrawal;
    return {
      __typename: "Withdrawal",
      withdrawal_id: withdrawal.id,
      withdrawal_created_at: withdrawal.createdAt,
      withdrawal_updated_at: withdrawal.updatedAt,
      withdrawal_status: withdrawal.status,
      withdrawal_resolved_at: withdrawal.resolvedAt,
      withdrawal_amount: CurrencyAmountToJson(withdrawal.amount),
      withdrawal_transaction_hash: withdrawal.transactionHash,
      withdrawal_fees: withdrawal.fees
        ? CurrencyAmountToJson(withdrawal.fees)
        : undefined,
      withdrawal_block_hash: withdrawal.blockHash,
      withdrawal_block_height: withdrawal.blockHeight,
      withdrawal_destination_addresses: withdrawal.destinationAddresses,
      withdrawal_num_confirmations: withdrawal.numConfirmations,
      withdrawal_origin: { id: withdrawal.originId },
    };
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface Transaction corresponding to the typename=${obj.typename}`,
  );
};

export const FRAGMENT = `
fragment TransactionFragment on Transaction {
    __typename
    ... on ChannelClosingTransaction {
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
    }
    ... on ChannelOpeningTransaction {
        __typename
        channel_opening_transaction_id: id
        channel_opening_transaction_created_at: created_at
        channel_opening_transaction_updated_at: updated_at
        channel_opening_transaction_status: status
        channel_opening_transaction_resolved_at: resolved_at
        channel_opening_transaction_amount: amount {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        channel_opening_transaction_transaction_hash: transaction_hash
        channel_opening_transaction_fees: fees {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        channel_opening_transaction_block_hash: block_hash
        channel_opening_transaction_block_height: block_height
        channel_opening_transaction_destination_addresses: destination_addresses
        channel_opening_transaction_num_confirmations: num_confirmations
        channel_opening_transaction_channel: channel {
            id
        }
    }
    ... on Deposit {
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
        deposit_destination: destination {
            id
        }
    }
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
    ... on Withdrawal {
        __typename
        withdrawal_id: id
        withdrawal_created_at: created_at
        withdrawal_updated_at: updated_at
        withdrawal_status: status
        withdrawal_resolved_at: resolved_at
        withdrawal_amount: amount {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        withdrawal_transaction_hash: transaction_hash
        withdrawal_fees: fees {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        withdrawal_block_hash: block_hash
        withdrawal_block_height: block_height
        withdrawal_destination_addresses: destination_addresses
        withdrawal_num_confirmations: num_confirmations
        withdrawal_origin: origin {
            id
        }
    }
}`;

export const getTransactionQuery = (id: string): Query<Transaction> => {
  return {
    queryPayload: `
query GetTransaction($id: ID!) {
    entity(id: $id) {
        ... on Transaction {
            ...TransactionFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => TransactionFromJson(data.entity),
  };
};

export default Transaction;
