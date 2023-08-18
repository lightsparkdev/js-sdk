// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { Query } from "@lightsparkdev/core";
import autoBind from "auto-bind";
import LightsparkClient from "../client.js";
import CurrencyAmount, { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import Entity from "./Entity.js";
import HtlcAttemptFailureCode from "./HtlcAttemptFailureCode.js";
import OutgoingPaymentAttemptStatus from "./OutgoingPaymentAttemptStatus.js";
import OutgoingPaymentAttemptToHopsConnection, {
  OutgoingPaymentAttemptToHopsConnectionFromJson,
} from "./OutgoingPaymentAttemptToHopsConnection.js";

/** This object represents an attempted Lightning Network payment sent from a Lightspark Node. You can retrieve this object to receive payment related information about any payment attempt sent from your Lightspark Node on the Lightning Network, including any potential reasons the payment may have failed. **/
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
    first: number | undefined = undefined,
    after: string | undefined = undefined
  ): Promise<OutgoingPaymentAttemptToHopsConnection> {
    return (await client.executeRawQuery({
      queryPayload: ` 
query FetchOutgoingPaymentAttemptToHopsConnection($entity_id: ID!, $first: Int, $after: String) {
    entity(id: $entity_id) {
        ... on OutgoingPaymentAttempt {
            hops(, first: $first, after: $after) {
                __typename
                outgoing_payment_attempt_to_hops_connection_count: count
                outgoing_payment_attempt_to_hops_connection_page_info: page_info {
                    __typename
                    page_info_has_next_page: has_next_page
                    page_info_has_previous_page: has_previous_page
                    page_info_start_cursor: start_cursor
                    page_info_end_cursor: end_cursor
                }
                outgoing_payment_attempt_to_hops_connection_entities: entities {
                    __typename
                    hop_id: id
                    hop_created_at: created_at
                    hop_updated_at: updated_at
                    hop_destination: destination {
                        id
                    }
                    hop_index: index
                    hop_public_key: public_key
                    hop_amount_to_forward: amount_to_forward {
                        __typename
                        currency_amount_original_value: original_value
                        currency_amount_original_unit: original_unit
                        currency_amount_preferred_currency_unit: preferred_currency_unit
                        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                    }
                    hop_fee: fee {
                        __typename
                        currency_amount_original_value: original_value
                        currency_amount_original_unit: original_unit
                        currency_amount_preferred_currency_unit: preferred_currency_unit
                        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
                    }
                    hop_expiry_block_height: expiry_block_height
                }
            }
        }
    }
}
`,
      variables: { entity_id: this.id, first: first, after: after },
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
    OutgoingPaymentAttemptStatus[obj["outgoing_payment_attempt_status"]] ??
      OutgoingPaymentAttemptStatus.FUTURE_VALUE,
    obj["outgoing_payment_attempt_outgoing_payment"].id,
    "OutgoingPaymentAttempt",
    !!obj["outgoing_payment_attempt_failure_code"]
      ? HtlcAttemptFailureCode[obj["outgoing_payment_attempt_failure_code"]] ??
        HtlcAttemptFailureCode.FUTURE_VALUE
      : null,
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
}`;

export default OutgoingPaymentAttempt;
