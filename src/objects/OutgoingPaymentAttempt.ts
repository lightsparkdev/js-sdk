// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import autoBind from "auto-bind";
import LightsparkClient from "../client.js";
import Query from "../requester/Query.js";
import CurrencyAmount, { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import Entity from "./Entity.js";
import HtlcAttemptFailureCode from "./HtlcAttemptFailureCode.js";
import OutgoingPaymentAttemptStatus from "./OutgoingPaymentAttemptStatus.js";
import OutgoingPaymentAttemptToHopsConnection, {
  OutgoingPaymentAttemptToHopsConnectionFromJson,
} from "./OutgoingPaymentAttemptToHopsConnection.js";

/** An attempt for a payment over a route from sender node to recipient node. **/
class OutgoingPaymentAttempt implements Entity {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly status: OutgoingPaymentAttemptStatus,
    public readonly outgoingPaymentId: string,
    public readonly typename: string,
    public readonly failureCode?: HtlcAttemptFailureCode,
    public readonly failureSourceIndex?: number,
    public readonly resolvedAt?: string,
    public readonly amount?: CurrencyAmount,
    public readonly fees?: CurrencyAmount
  ) {
    autoBind(this);
  }

  public async getHops(
    client: LightsparkClient,
    first: number | undefined = undefined
  ): Promise<OutgoingPaymentAttemptToHopsConnection> {
    return (await client.executeRawQuery({
      queryPayload: ` 
query FetchOutgoingPaymentAttemptToHopsConnection($entity_id: ID!, $first: Int) {
    entity(id: $entity_id) {
        ... on OutgoingPaymentAttempt {
            hops(, first: $first) {
                __typename
                outgoing_payment_attempt_to_hops_connection_count: count
                outgoing_payment_attempt_to_hops_connection_entities: entities {
                    __typename
                    hop_id: id
                    hop_created_at: created_at
                    hop_updated_at: updated_at
                    hop_destination: destination {
                        id
                    }
                    hop_index: index
                    hop_short_channel_id: short_channel_id
                    hop_pub_key: pub_key
                    hop_public_key: public_key
                    hop_amount_to_forward: amount_to_forward {
                        __typename
                        currency_amount_value: value
                        currency_amount_unit: unit
                    }
                    hop_fee: fee {
                        __typename
                        currency_amount_value: value
                        currency_amount_unit: unit
                    }
                    hop_expiry: expiry
                    hop_expiry_block_height: expiry_block_height
                }
            }
        }
    }
}
`,
      variables: { entity_id: this.id, first: first },
      constructObject: (json) => {
        const connection = json["entity"]["hops"];
        return OutgoingPaymentAttemptToHopsConnectionFromJson(connection);
      },
    }))!;
  }

  static getOutgoingPaymentAttemptQuery(
    id: string
  ): Query<OutgoingPaymentAttempt> {
    return {
      queryPayload: `
query GetOutgoingPaymentAttempt($id: ID!) {
    entity(id: $id) {
        ... on OutgoingPaymentAttempt {
            ...OutgoingPaymentAttemptFragment
        }
    }
}

${FRAGMENT}    
`,
      variables: { id },
      constructObject: (data: any) =>
        OutgoingPaymentAttemptFromJson(data.entity),
    };
  }
}

export const OutgoingPaymentAttemptFromJson = (
  obj: any
): OutgoingPaymentAttempt => {
  return new OutgoingPaymentAttempt(
    obj["outgoing_payment_attempt_id"],
    obj["outgoing_payment_attempt_created_at"],
    obj["outgoing_payment_attempt_updated_at"],
    OutgoingPaymentAttemptStatus[obj["outgoing_payment_attempt_status"]],
    obj["outgoing_payment_attempt_outgoing_payment"].id,
    "OutgoingPaymentAttempt",
    HtlcAttemptFailureCode[obj["outgoing_payment_attempt_failure_code"]] ??
      null,
    obj["outgoing_payment_attempt_failure_source_index"],
    obj["outgoing_payment_attempt_resolved_at"],
    !!obj["outgoing_payment_attempt_amount"]
      ? CurrencyAmountFromJson(obj["outgoing_payment_attempt_amount"])
      : undefined,
    !!obj["outgoing_payment_attempt_fees"]
      ? CurrencyAmountFromJson(obj["outgoing_payment_attempt_fees"])
      : undefined
  );
};

export const FRAGMENT = `
fragment OutgoingPaymentAttemptFragment on OutgoingPaymentAttempt {
    __typename
    outgoing_payment_attempt_id: id
    outgoing_payment_attempt_created_at: created_at
    outgoing_payment_attempt_updated_at: updated_at
    outgoing_payment_attempt_status: status
    outgoing_payment_attempt_failure_code: failure_code
    outgoing_payment_attempt_failure_source_index: failure_source_index
    outgoing_payment_attempt_resolved_at: resolved_at
    outgoing_payment_attempt_amount: amount {
        __typename
        currency_amount_value: value
        currency_amount_unit: unit
    }
    outgoing_payment_attempt_fees: fees {
        __typename
        currency_amount_value: value
        currency_amount_unit: unit
    }
    outgoing_payment_attempt_outgoing_payment: outgoing_payment {
        id
    }
}`;

export default OutgoingPaymentAttempt;
