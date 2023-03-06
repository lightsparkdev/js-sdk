// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import Query from "../requester/Query.js";
import CurrencyAmount, { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import Entity from "./Entity.js";
import IncomingPayment from "./IncomingPayment.js";
import OutgoingPayment from "./OutgoingPayment.js";
import PaymentFailureReason from "./PaymentFailureReason.js";
import { PaymentRequestDataFromJson } from "./PaymentRequestData.js";
import { RichTextFromJson } from "./RichText.js";
import RoutingTransaction from "./RoutingTransaction.js";
import RoutingTransactionFailureReason from "./RoutingTransactionFailureReason.js";
import Transaction from "./Transaction.js";
import TransactionStatus from "./TransactionStatus.js";

type LightningTransaction = Transaction &
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

    /** The typename of the object **/
    typename: string;

    /** The date and time when this transaction was completed or failed. **/
    resolvedAt?: string;

    /** The hash of this transaction, so it can be uniquely identified on the Lightning network. **/
    transactionHash?: string;
  };

export const LightningTransactionFromJson = (
  obj: any
): LightningTransaction => {
  if (obj["__typename"] == "OutgoingPayment") {
    return new OutgoingPayment(
      obj["outgoing_payment_id"],
      obj["outgoing_payment_created_at"],
      obj["outgoing_payment_updated_at"],
      TransactionStatus[obj["outgoing_payment_status"]],
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
      PaymentFailureReason[obj["outgoing_payment_failure_reason"]] ?? null,
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
      status: TransactionStatus[obj["routing_transaction_status"]],
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
      failureReason:
        RoutingTransactionFailureReason[
          obj["routing_transaction_failure_reason"]
        ] ?? null,
    } as RoutingTransaction;
  }
  if (obj["__typename"] == "IncomingPayment") {
    return new IncomingPayment(
      obj["incoming_payment_id"],
      obj["incoming_payment_created_at"],
      obj["incoming_payment_updated_at"],
      TransactionStatus[obj["incoming_payment_status"]],
      CurrencyAmountFromJson(obj["incoming_payment_amount"]),
      obj["incoming_payment_destination"].id,
      "IncomingPayment",
      obj["incoming_payment_resolved_at"],
      obj["incoming_payment_transaction_hash"],
      obj["incoming_payment_origin"]?.id ?? undefined,
      obj["incoming_payment_payment_request"]?.id ?? undefined
    );
  }
  throw new Error(
    `Couldn't find a concrete type for interface LightningTransaction corresponding to the typename=${obj["__typename"]}`
  );
};

export const FRAGMENT = `
fragment LightningTransactionFragment on LightningTransaction {
    __typename
    ... on OutgoingPayment {
        __typename
        outgoing_payment_id: id
        outgoing_payment_created_at: created_at
        outgoing_payment_updated_at: updated_at
        outgoing_payment_status: status
        outgoing_payment_resolved_at: resolved_at
        outgoing_payment_amount: amount {
            __typename
            currency_amount_value: value
            currency_amount_unit: unit
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
            currency_amount_value: value
            currency_amount_unit: unit
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
                    currency_amount_value: value
                    currency_amount_unit: unit
                }
                invoice_data_created_at: created_at
                invoice_data_expires_at: expires_at
                invoice_data_destination: destination {
                    __typename
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
                                currency_amount_value: value
                                currency_amount_unit: unit
                            }
                            blockchain_balance_confirmed_balance: confirmed_balance {
                                __typename
                                currency_amount_value: value
                                currency_amount_unit: unit
                            }
                            blockchain_balance_unconfirmed_balance: unconfirmed_balance {
                                __typename
                                currency_amount_value: value
                                currency_amount_unit: unit
                            }
                            blockchain_balance_locked_balance: locked_balance {
                                __typename
                                currency_amount_value: value
                                currency_amount_unit: unit
                            }
                            blockchain_balance_required_reserve: required_reserve {
                                __typename
                                currency_amount_value: value
                                currency_amount_unit: unit
                            }
                            blockchain_balance_available_balance: available_balance {
                                __typename
                                currency_amount_value: value
                                currency_amount_unit: unit
                            }
                        }
                        lightspark_node_encrypted_admin_macaroon: encrypted_admin_macaroon {
                            __typename
                            secret_encrypted_value: encrypted_value
                            secret_cipher: cipher
                        }
                        lightspark_node_encrypted_signing_private_key: encrypted_signing_private_key {
                            __typename
                            secret_encrypted_value: encrypted_value
                            secret_cipher: cipher
                        }
                        lightspark_node_encryption_public_key: encryption_public_key {
                            __typename
                            key_type: type
                            key_public_key: public_key
                        }
                        lightspark_node_grpc_hostname: grpc_hostname
                        lightspark_node_local_balance: local_balance {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                        lightspark_node_name: name
                        lightspark_node_purpose: purpose
                        lightspark_node_remote_balance: remote_balance {
                            __typename
                            currency_amount_value: value
                            currency_amount_unit: unit
                        }
                        lightspark_node_rest_url: rest_url
                        lightspark_node_status: status
                        lightspark_node_upgrade_available: upgrade_available
                        lightspark_node_has_channel_funding_op: has_channel_funding_op
                    }
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
            currency_amount_value: value
            currency_amount_unit: unit
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
            currency_amount_value: value
            currency_amount_unit: unit
        }
        routing_transaction_failure_message: failure_message {
            __typename
            rich_text_text: text
        }
        routing_transaction_failure_reason: failure_reason
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
            currency_amount_value: value
            currency_amount_unit: unit
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
}`;

export const getLightningTransactionQuery = (
  id: string
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
