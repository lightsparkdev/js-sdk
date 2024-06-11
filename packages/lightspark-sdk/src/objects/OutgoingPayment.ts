// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query } from "@lightsparkdev/core";
import autoBind from "auto-bind";
import type LightsparkClient from "../client.js";
import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";
import type Entity from "./Entity.js";
import type LightningTransaction from "./LightningTransaction.js";
import type OutgoingPaymentToAttemptsConnection from "./OutgoingPaymentToAttemptsConnection.js";
import { OutgoingPaymentToAttemptsConnectionFromJson } from "./OutgoingPaymentToAttemptsConnection.js";
import PaymentFailureReason from "./PaymentFailureReason.js";
import type PaymentRequestData from "./PaymentRequestData.js";
import {
  PaymentRequestDataFromJson,
  PaymentRequestDataToJson,
} from "./PaymentRequestData.js";
import type PostTransactionData from "./PostTransactionData.js";
import {
  PostTransactionDataFromJson,
  PostTransactionDataToJson,
} from "./PostTransactionData.js";
import type RichText from "./RichText.js";
import { RichTextFromJson, RichTextToJson } from "./RichText.js";
import type Transaction from "./Transaction.js";
import TransactionStatus from "./TransactionStatus.js";

/**
 * This object represents a Lightning Network payment sent from a Lightspark Node. You can retrieve
 * this object to receive payment related information about any payment sent from your Lightspark
 * Node on the Lightning Network. *
 */
class OutgoingPayment implements LightningTransaction, Transaction, Entity {
  constructor(
    /**
     * The unique identifier of this entity across all Lightspark systems. Should be treated as an
     * opaque string.
     **/
    public readonly id: string,
    /** The date and time when this transaction was initiated. **/
    public readonly createdAt: string,
    /** The date and time when the entity was last updated. **/
    public readonly updatedAt: string,
    /** The current status of this transaction. **/
    public readonly status: TransactionStatus,
    /** The amount of money involved in this transaction. **/
    public readonly amount: CurrencyAmount,
    /**
     * Whether this payment is an UMA payment or not. NOTE: this field is only set if the payment
     * has been sent using the recommended `pay_uma_invoice` function.
     **/
    public readonly isUma: boolean,
    /** The Lightspark node this payment originated from. **/
    public readonly originId: string,
    /** Whether the payment is made to the same node. **/
    public readonly isInternalPayment: boolean,
    /** The typename of the object **/
    public readonly typename: string,
    /** The date and time when this transaction was completed or failed. **/
    public readonly resolvedAt?: string | undefined,
    /** The hash of this transaction, so it can be uniquely identified on the Lightning Network. **/
    public readonly transactionHash?: string | undefined,
    /** If known, the final recipient node this payment was sent to. **/
    public readonly destinationId?: string | undefined,
    /** The fees paid by the sender node to send the payment. **/
    public readonly fees?: CurrencyAmount | undefined,
    /** The data of the payment request that was paid by this transaction, if known. **/
    public readonly paymentRequestData?: PaymentRequestData | undefined,
    /** If applicable, the reason why the payment failed. **/
    public readonly failureReason?: PaymentFailureReason | undefined,
    /** If applicable, user-facing error message describing why the payment failed. **/
    public readonly failureMessage?: RichText | undefined,
    /** The post transaction data which can be used in KYT payment registration. **/
    public readonly umaPostTransactionData?: PostTransactionData[] | undefined,
    /** The preimage of the payment. **/
    public readonly paymentPreimage?: string | undefined,
    /** The idempotency key of the payment. **/
    public readonly idempotencyKey?: string | undefined,
  ) {
    autoBind(this);
  }

  public async getAttempts(
    client: LightsparkClient,
    first: number | undefined = undefined,
    after: string | undefined = undefined,
  ): Promise<OutgoingPaymentToAttemptsConnection> {
    return (await client.executeRawQuery({
      queryPayload: ` 
query FetchOutgoingPaymentToAttemptsConnection($entity_id: ID!, $first: Int, $after: String) {
    entity(id: $entity_id) {
        ... on OutgoingPayment {
            attempts(, first: $first, after: $after) {
                __typename
                outgoing_payment_to_attempts_connection_count: count
                outgoing_payment_to_attempts_connection_page_info: page_info {
                    __typename
                    page_info_has_next_page: has_next_page
                    page_info_has_previous_page: has_previous_page
                    page_info_start_cursor: start_cursor
                    page_info_end_cursor: end_cursor
                }
                outgoing_payment_to_attempts_connection_entities: entities {
                    __typename
                    outgoing_payment_attempt_id: id
                    outgoing_payment_attempt_created_at: created_at
                    outgoing_payment_attempt_updated_at: updated_at
                    outgoing_payment_attempt_status: status
                    outgoing_payment_attempt_failure_code: failure_code
                    outgoing_payment_attempt_failure_source_index: failure_source_index
                    outgoing_payment_attempt_attempted_at: attempted_at
                    outgoing_payment_attempt_resolved_at: resolved_at
                    outgoing_payment_attempt_amount: amount {
                        __typename
                        currency_amount_original_value: original_value
                        currency_amount_original_unit: original_unit
                        currency_amount_preferred_currency_unit: preferred_currency_unit
                        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                    }
                    outgoing_payment_attempt_fees: fees {
                        __typename
                        currency_amount_original_value: original_value
                        currency_amount_original_unit: original_unit
                        currency_amount_preferred_currency_unit: preferred_currency_unit
                        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                    }
                    outgoing_payment_attempt_outgoing_payment: outgoing_payment {
                        id
                    }
                    outgoing_payment_attempt_channel_snapshot: channel_snapshot {
                        id
                    }
                }
            }
        }
    }
}
`,
      variables: { entity_id: this.id, first: first, after: after },
      constructObject: (json) => {
        const connection = json["entity"]["attempts"];
        return OutgoingPaymentToAttemptsConnectionFromJson(connection);
      },
    }))!;
  }

  static getOutgoingPaymentQuery(id: string): Query<OutgoingPayment> {
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
  }

  public toJson() {
    return {
      __typename: "OutgoingPayment",
      outgoing_payment_id: this.id,
      outgoing_payment_created_at: this.createdAt,
      outgoing_payment_updated_at: this.updatedAt,
      outgoing_payment_status: this.status,
      outgoing_payment_resolved_at: this.resolvedAt,
      outgoing_payment_amount: CurrencyAmountToJson(this.amount),
      outgoing_payment_transaction_hash: this.transactionHash,
      outgoing_payment_is_uma: this.isUma,
      outgoing_payment_origin: { id: this.originId },
      outgoing_payment_destination: { id: this.destinationId } ?? undefined,
      outgoing_payment_fees: this.fees
        ? CurrencyAmountToJson(this.fees)
        : undefined,
      outgoing_payment_payment_request_data: this.paymentRequestData
        ? PaymentRequestDataToJson(this.paymentRequestData)
        : undefined,
      outgoing_payment_failure_reason: this.failureReason,
      outgoing_payment_failure_message: this.failureMessage
        ? RichTextToJson(this.failureMessage)
        : undefined,
      outgoing_payment_uma_post_transaction_data:
        this.umaPostTransactionData?.map((e) => PostTransactionDataToJson(e)),
      outgoing_payment_payment_preimage: this.paymentPreimage,
      outgoing_payment_is_internal_payment: this.isInternalPayment,
      outgoing_payment_idempotency_key: this.idempotencyKey,
    };
  }
}

export const OutgoingPaymentFromJson = (obj: any): OutgoingPayment => {
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
      ? PaymentRequestDataFromJson(obj["outgoing_payment_payment_request_data"])
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
}`;

export default OutgoingPayment;
