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
import type IncomingPaymentAttemptStatus from "./IncomingPaymentAttemptStatus.js";
import type IncomingPaymentToAttemptsConnection from "./IncomingPaymentToAttemptsConnection.js";
import { IncomingPaymentToAttemptsConnectionFromJson } from "./IncomingPaymentToAttemptsConnection.js";
import type LightningTransaction from "./LightningTransaction.js";
import type PostTransactionData from "./PostTransactionData.js";
import {
  PostTransactionDataFromJson,
  PostTransactionDataToJson,
} from "./PostTransactionData.js";
import type Transaction from "./Transaction.js";
import TransactionStatus from "./TransactionStatus.js";

/**
 * This object represents any payment sent to a Lightspark node on the Lightning Network. You can
 * retrieve this object to receive payment related information about a specific payment received by
 * a Lightspark node. *
 */
class IncomingPayment implements LightningTransaction, Transaction, Entity {
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
    /** The recipient Lightspark node this payment was sent to. **/
    public readonly destinationId: string,
    /** The typename of the object **/
    public readonly typename: string,
    /** The date and time when this transaction was completed or failed. **/
    public readonly resolvedAt?: string | undefined,
    /** The hash of this transaction, so it can be uniquely identified on the Lightning Network. **/
    public readonly transactionHash?: string | undefined,
    /**
     * The optional payment request for this incoming payment, which will be null if the payment is
     * sent through keysend.
     **/
    public readonly paymentRequestId?: string | undefined,
    /** The post transaction data which can be used in KYT payment registration. **/
    public readonly umaPostTransactionData?: PostTransactionData[] | undefined,
  ) {
    autoBind(this);
  }

  public async getAttempts(
    client: LightsparkClient,
    first: number | undefined = undefined,
    statuses: IncomingPaymentAttemptStatus[] | undefined = undefined,
    after: string | undefined = undefined,
  ): Promise<IncomingPaymentToAttemptsConnection> {
    return (await client.executeRawQuery({
      queryPayload: ` 
query FetchIncomingPaymentToAttemptsConnection($entity_id: ID!, $first: Int, $statuses: [IncomingPaymentAttemptStatus!], $after: String) {
    entity(id: $entity_id) {
        ... on IncomingPayment {
            attempts(, first: $first, statuses: $statuses, after: $after) {
                __typename
                incoming_payment_to_attempts_connection_count: count
                incoming_payment_to_attempts_connection_page_info: page_info {
                    __typename
                    page_info_has_next_page: has_next_page
                    page_info_has_previous_page: has_previous_page
                    page_info_start_cursor: start_cursor
                    page_info_end_cursor: end_cursor
                }
                incoming_payment_to_attempts_connection_entities: entities {
                    __typename
                    incoming_payment_attempt_id: id
                    incoming_payment_attempt_created_at: created_at
                    incoming_payment_attempt_updated_at: updated_at
                    incoming_payment_attempt_status: status
                    incoming_payment_attempt_resolved_at: resolved_at
                    incoming_payment_attempt_amount: amount {
                        __typename
                        currency_amount_original_value: original_value
                        currency_amount_original_unit: original_unit
                        currency_amount_preferred_currency_unit: preferred_currency_unit
                        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                    }
                    incoming_payment_attempt_channel: channel {
                        id
                    }
                }
            }
        }
    }
}
`,
      variables: {
        entity_id: this.id,
        first: first,
        statuses: statuses,
        after: after,
      },
      constructObject: (json) => {
        const connection = json["entity"]["attempts"];
        return IncomingPaymentToAttemptsConnectionFromJson(connection);
      },
    }))!;
  }

  static getIncomingPaymentQuery(id: string): Query<IncomingPayment> {
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
  }

  public toJson() {
    return {
      __typename: "IncomingPayment",
      incoming_payment_id: this.id,
      incoming_payment_created_at: this.createdAt,
      incoming_payment_updated_at: this.updatedAt,
      incoming_payment_status: this.status,
      incoming_payment_resolved_at: this.resolvedAt,
      incoming_payment_amount: CurrencyAmountToJson(this.amount),
      incoming_payment_transaction_hash: this.transactionHash,
      incoming_payment_destination: { id: this.destinationId },
      incoming_payment_payment_request:
        { id: this.paymentRequestId } ?? undefined,
      incoming_payment_uma_post_transaction_data:
        this.umaPostTransactionData?.map((e) => PostTransactionDataToJson(e)),
    };
  }
}

export const IncomingPaymentFromJson = (obj: any): IncomingPayment => {
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
    obj["incoming_payment_payment_request"]?.id ?? undefined,
    obj["incoming_payment_uma_post_transaction_data"]?.map((e) =>
      PostTransactionDataFromJson(e),
    ),
  );
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
}`;

export default IncomingPayment;
