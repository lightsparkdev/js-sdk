// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import Query from "../requester/Query.js";
import CurrencyAmount, { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import Entity from "./Entity.js";
import LightningTransaction from "./LightningTransaction.js";
import RichText, { RichTextFromJson } from "./RichText.js";
import RoutingTransactionFailureReason from "./RoutingTransactionFailureReason.js";
import Transaction from "./Transaction.js";
import TransactionStatus from "./TransactionStatus.js";

/** A transaction that was forwarded through a Lightspark node on the Lightning Network. **/
type RoutingTransaction = LightningTransaction &
  Transaction &
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

    /** If known, the channel this transaction was received from. **/
    incomingChannelId?: string;

    /** If known, the channel this transaction was forwarded to. **/
    outgoingChannelId?: string;

    /** The fees collected by the node when routing this transaction. We subtract the outgoing amount to the incoming amount to determine how much fees were collected. **/
    fees?: CurrencyAmount;

    /** If applicable, user-facing error message describing why the routing failed. **/
    failureMessage?: RichText;

    /** If applicable, the reason why the routing failed. **/
    failureReason?: RoutingTransactionFailureReason;
  };

export const RoutingTransactionFromJson = (obj: any): RoutingTransaction => {
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
}`;

export const getRoutingTransactionQuery = (
  id: string
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
