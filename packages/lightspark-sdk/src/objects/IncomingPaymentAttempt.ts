// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query } from "@lightsparkdev/core";
import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";
import IncomingPaymentAttemptStatus from "./IncomingPaymentAttemptStatus.js";

/**
 * This object represents any attempted payment sent to a Lightspark node on the Lightning Network.
 * You can retrieve this object to receive payment related information about a specific incoming
 * payment attempt. *
 */
interface IncomingPaymentAttempt {
  /**
   * The unique identifier of this entity across all Lightspark systems. Should be treated as an
   * opaque string.
   **/
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
  resolvedAt?: string | undefined;
}

export const IncomingPaymentAttemptFromJson = (
  obj: any,
): IncomingPaymentAttempt => {
  return {
    id: obj["incoming_payment_attempt_id"],
    createdAt: obj["incoming_payment_attempt_created_at"],
    updatedAt: obj["incoming_payment_attempt_updated_at"],
    status:
      IncomingPaymentAttemptStatus[obj["incoming_payment_attempt_status"]] ??
      IncomingPaymentAttemptStatus.FUTURE_VALUE,
    amount: CurrencyAmountFromJson(obj["incoming_payment_attempt_amount"]),
    channelId: obj["incoming_payment_attempt_channel"].id,
    typename: "IncomingPaymentAttempt",
    resolvedAt: obj["incoming_payment_attempt_resolved_at"],
  } as IncomingPaymentAttempt;
};
export const IncomingPaymentAttemptToJson = (
  obj: IncomingPaymentAttempt,
): any => {
  return {
    __typename: "IncomingPaymentAttempt",
    incoming_payment_attempt_id: obj.id,
    incoming_payment_attempt_created_at: obj.createdAt,
    incoming_payment_attempt_updated_at: obj.updatedAt,
    incoming_payment_attempt_status: obj.status,
    incoming_payment_attempt_resolved_at: obj.resolvedAt,
    incoming_payment_attempt_amount: CurrencyAmountToJson(obj.amount),
    incoming_payment_attempt_channel: { id: obj.channelId },
  };
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
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    incoming_payment_attempt_channel: channel {
        id
    }
}`;

export const getIncomingPaymentAttemptQuery = (
  id: string,
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
