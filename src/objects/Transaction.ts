// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import LightsparkException from "../LightsparkException.js";
import Query from "../requester/Query.js";
import ChannelClosingTransaction from "./ChannelClosingTransaction.js";
import ChannelOpeningTransaction from "./ChannelOpeningTransaction.js";
import CurrencyAmount, { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import Deposit from "./Deposit.js";
import Entity from "./Entity.js";
import IncomingPayment from "./IncomingPayment.js";
import OutgoingPayment from "./OutgoingPayment.js";
import PaymentFailureReason from "./PaymentFailureReason.js";
import { PaymentRequestDataFromJson } from "./PaymentRequestData.js";
import { RichTextFromJson } from "./RichText.js";
import RoutingTransaction from "./RoutingTransaction.js";
import RoutingTransactionFailureReason from "./RoutingTransactionFailureReason.js";
import TransactionStatus from "./TransactionStatus.js";
import Withdrawal from "./Withdrawal.js";

type Transaction = Entity & {
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

  /** The hash of this transaction, so it can be uniquely identified on the Lightning network. **/
  transactionHash?: string;
};

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
      obj["incoming_payment_destination"].id,
      "IncomingPayment",
      obj["incoming_payment_resolved_at"],
      obj["incoming_payment_transaction_hash"],
      obj["incoming_payment_origin"]?.id ?? undefined,
      obj["incoming_payment_payment_request"]?.id ?? undefined
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
      obj["outgoing_payment_origin"].id,
      "OutgoingPayment",
      obj["outgoing_payment_resolved_at"],
      obj["outgoing_payment_transaction_hash"],
      obj["outgoing_payment_destination"]?.id ?? undefined,
      !!obj["outgoing_payment_fees"]
        ? CurrencyAmountFromJson(obj["outgoing_payment_fees"])
        : undefined,
      !!obj["outgoing_payment_payment_request_data"]
        ? PaymentRequestDataFromJson(
            obj["outgoing_payment_payment_request_data"]
          )
        : undefined,
      !!obj["outgoing_payment_failure_reason"]
        ? PaymentFailureReason[obj["outgoing_payment_failure_reason"]] ??
          PaymentFailureReason.FUTURE_VALUE
        : null,
      !!obj["outgoing_payment_failure_message"]
        ? RichTextFromJson(obj["outgoing_payment_failure_message"])
        : undefined
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
    `Couldn't find a concrete type for interface Transaction corresponding to the typename=${obj["__typename"]}`
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
        incoming_payment_origin: origin {
            id
        }
        incoming_payment_destination: destination {
            id
        }
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
                    ... on LightsparkNode {
                        __typename
                        lightspark_node_id: id
                        lightspark_node_created_at: created_at
                        lightspark_node_updated_at: updated_at
                        lightspark_node_alias: alias
                        lightspark_node_bitcoin_network: bitcoin_network
                        lightspark_node_color: color
                        lightspark_node_conductivity: conductivity
                        lightspark_node_display_name: display_name
                        lightspark_node_public_key: public_key
                        lightspark_node_account: account {
                            id
                        }
                        lightspark_node_blockchain_balance: blockchain_balance {
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
                        lightspark_node_encrypted_signing_private_key: encrypted_signing_private_key {
                            __typename
                            secret_encrypted_value: encrypted_value
                            secret_cipher: cipher
                        }
                        lightspark_node_total_balance: total_balance {
                            __typename
                            currency_amount_original_value: original_value
                            currency_amount_original_unit: original_unit
                            currency_amount_preferred_currency_unit: preferred_currency_unit
                            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                        }
                        lightspark_node_total_local_balance: total_local_balance {
                            __typename
                            currency_amount_original_value: original_value
                            currency_amount_original_unit: original_unit
                            currency_amount_preferred_currency_unit: preferred_currency_unit
                            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                        }
                        lightspark_node_local_balance: local_balance {
                            __typename
                            currency_amount_original_value: original_value
                            currency_amount_original_unit: original_unit
                            currency_amount_preferred_currency_unit: preferred_currency_unit
                            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                        }
                        lightspark_node_purpose: purpose
                        lightspark_node_remote_balance: remote_balance {
                            __typename
                            currency_amount_original_value: original_value
                            currency_amount_original_unit: original_unit
                            currency_amount_preferred_currency_unit: preferred_currency_unit
                            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                        }
                        lightspark_node_status: status
                    }
                }
                invoice_data_memo: memo
            }
        }
        outgoing_payment_failure_reason: failure_reason
        outgoing_payment_failure_message: failure_message {
            __typename
            rich_text_text: text
        }
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
