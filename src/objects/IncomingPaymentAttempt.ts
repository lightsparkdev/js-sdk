// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import Entity from "./Entity.js";
import { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import Query from "../requester/Query.js";
import IncomingPaymentAttemptStatus from "./IncomingPaymentAttemptStatus.js";
import CurrencyAmount from "./CurrencyAmount.js";

/** An attempt for a payment over a route from sender node to recipient node. **/
type IncomingPaymentAttempt = Entity & {
  /** The unique identifier of this entity across all Lightspark systems. Should be treated as an opaque string. **/
  id: string;

  /** The date and time when the entity was first created. **/
  createdAt: string;

  /** The date and time when the entity was last updated. **/
  updatedAt: string;

  /** The status of the incoming payment attempt. **/
  status: IncomingPaymentAttemptStatus;

  /** The total amount of that was attempted to send. **/
  amount: CurrencyAmount;

  /** The channel this attempt was made on. **/
  channelId: string;

  /** The typename of the object **/
  typename: string;

  /** The time the incoming payment attempt failed or succeeded. **/
  resolvedAt?: string;
};

export const IncomingPaymentAttemptFromJson = (
  obj: any
): IncomingPaymentAttempt => {
  return {
    id: obj["incoming_payment_attempt_id"],
    createdAt: obj["incoming_payment_attempt_created_at"],
    updatedAt: obj["incoming_payment_attempt_updated_at"],
    status:
      IncomingPaymentAttemptStatus[obj["incoming_payment_attempt_status"]],
    amount: CurrencyAmountFromJson(obj["incoming_payment_attempt_amount"]),
    channelId: obj["incoming_payment_attempt_channel"].id,
    typename: "IncomingPaymentAttempt",
    resolvedAt: obj["incoming_payment_attempt_resolved_at"],
  } as IncomingPaymentAttempt;
};

export const FRAGMENT = `
fragment IncomingPaymentAttemptFragment on IncomingPaymentAttempt {
    __typename
    incoming_payment_attempt_id: id
    incoming_payment_attempt_created_at: created_at
    incoming_payment_attempt_updated_at: updated_at
    incoming_payment_attempt_status: status
    incoming_payment_attempt_resolved_at: resolved_at
    incoming_payment_attempt_amount: amount {
        __typename
        currency_amount_value: value
        currency_amount_unit: unit
    }
    incoming_payment_attempt_channel: channel {
        id
    }
}`;

export const getIncomingPaymentAttemptQuery = (
  id: string
): Query<IncomingPaymentAttempt> => {
  return {
    queryPayload: `
query GetIncomingPaymentAttempt($id: ID!) {
    entity(id: $id) {
        ... on IncomingPaymentAttempt {
            ...IncomingPaymentAttemptFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => IncomingPaymentAttemptFromJson(data.entity),
  };
};

export default IncomingPaymentAttempt;
