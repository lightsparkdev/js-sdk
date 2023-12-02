// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query } from "@lightsparkdev/core";
import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";
import type RichText from "./RichText.js";
import { RichTextFromJson, RichTextToJson } from "./RichText.js";
import RoutingTransactionFailureReason from "./RoutingTransactionFailureReason.js";
import TransactionStatus from "./TransactionStatus.js";

/**
 * This object represents a transaction that was forwarded through a Lightspark node on the
 * Lightning Network, i.e., a routed transaction. You can retrieve this object to receive
 * information about any transaction routed through your Lightspark Node. *
 */
interface RoutingTransaction {
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

  /** If known, the channel this transaction was received from. **/
  incomingChannelId?: string | undefined;

  /** If known, the channel this transaction was forwarded to. **/
  outgoingChannelId?: string | undefined;

  /**
   * The fees collected by the node when routing this transaction. We subtract the outgoing
   * amount to the incoming amount to determine how much fees were collected.
   **/
  fees?: CurrencyAmount | undefined;

  /** If applicable, user-facing error message describing why the routing failed. **/
  failureMessage?: RichText | undefined;

  /** If applicable, the reason why the routing failed. **/
  failureReason?: RoutingTransactionFailureReason | undefined;
}

export const RoutingTransactionFromJson = (obj: any): RoutingTransaction => {
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
};
export const RoutingTransactionToJson = (obj: RoutingTransaction): any => {
  return {
    __typename: "RoutingTransaction",
    routing_transaction_id: obj.id,
    routing_transaction_created_at: obj.createdAt,
    routing_transaction_updated_at: obj.updatedAt,
    routing_transaction_status: obj.status,
    routing_transaction_resolved_at: obj.resolvedAt,
    routing_transaction_amount: CurrencyAmountToJson(obj.amount),
    routing_transaction_transaction_hash: obj.transactionHash,
    routing_transaction_incoming_channel:
      { id: obj.incomingChannelId } ?? undefined,
    routing_transaction_outgoing_channel:
      { id: obj.outgoingChannelId } ?? undefined,
    routing_transaction_fees: obj.fees
      ? CurrencyAmountToJson(obj.fees)
      : undefined,
    routing_transaction_failure_message: obj.failureMessage
      ? RichTextToJson(obj.failureMessage)
      : undefined,
    routing_transaction_failure_reason: obj.failureReason,
  };
};

export const FRAGMENT = `
fragment RoutingTransactionFragment on RoutingTransaction {
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
}`;

export const getRoutingTransactionQuery = (
  id: string,
): Query<RoutingTransaction> => {
  return {
    queryPayload: `
query GetRoutingTransaction($id: ID!) {
    entity(id: $id) {
        ... on RoutingTransaction {
            ...RoutingTransactionFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => RoutingTransactionFromJson(data.entity),
  };
};

export default RoutingTransaction;
