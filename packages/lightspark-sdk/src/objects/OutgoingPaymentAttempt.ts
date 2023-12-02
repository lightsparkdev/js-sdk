// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query } from "@lightsparkdev/core";
import autoBind from "auto-bind";
import type LightsparkClient from "../client.js";
import type ChannelSnapshot from "./ChannelSnapshot.js";
import {
  ChannelSnapshotFromJson,
  ChannelSnapshotToJson,
} from "./ChannelSnapshot.js";
import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";
import type Entity from "./Entity.js";
import HtlcAttemptFailureCode from "./HtlcAttemptFailureCode.js";
import OutgoingPaymentAttemptStatus from "./OutgoingPaymentAttemptStatus.js";
import type OutgoingPaymentAttemptToHopsConnection from "./OutgoingPaymentAttemptToHopsConnection.js";
import { OutgoingPaymentAttemptToHopsConnectionFromJson } from "./OutgoingPaymentAttemptToHopsConnection.js";

/**
 * This object represents an attempted Lightning Network payment sent from a Lightspark Node. You
 * can retrieve this object to receive payment related information about any payment attempt sent
 * from your Lightspark Node on the Lightning Network, including any potential reasons the payment
 * may have failed. *
 */
class OutgoingPaymentAttempt implements Entity {
  constructor(
    /**
     * The unique identifier of this entity across all Lightspark systems. Should be treated as an
     * opaque string.
     **/
    public readonly id: string,
    /** The date and time when the entity was first created. **/
    public readonly createdAt: string,
    /** The date and time when the entity was last updated. **/
    public readonly updatedAt: string,
    /** The status of an outgoing payment attempt. **/
    public readonly status: OutgoingPaymentAttemptStatus,
    /** The date and time when the attempt was initiated. **/
    public readonly attemptedAt: string,
    /** The outgoing payment for this attempt. **/
    public readonly outgoingPaymentId: string,
    /** The typename of the object **/
    public readonly typename: string,
    /** If the payment attempt failed, then this contains the Bolt #4 failure code. **/
    public readonly failureCode?: HtlcAttemptFailureCode | undefined,
    /**
     * If the payment attempt failed, then this contains the index of the hop at which the problem
     * occurred.
     **/
    public readonly failureSourceIndex?: number | undefined,
    /** The time the outgoing payment attempt failed or succeeded. **/
    public readonly resolvedAt?: string | undefined,
    /**
     * The total amount of funds required to complete a payment over this route. This value
     * includes the cumulative fees for each hop. As a result, the attempt extended to the
     * first-hop in the route will need to have at least this much value, otherwise the route will
     * fail at an intermediate node due to an insufficient amount.
     **/
    public readonly amount?: CurrencyAmount | undefined,
    /**
     * The sum of the fees paid at each hop within the route of this attempt. In the case of a
     * one-hop payment, this value will be zero as we don't need to pay a fee to ourselves.
     **/
    public readonly fees?: CurrencyAmount | undefined,
    /** The channel snapshot at the time the outgoing payment attempt was made. **/
    public readonly channelSnapshot?: ChannelSnapshot | undefined,
  ) {
    autoBind(this);
  }

  public async getHops(
    client: LightsparkClient,
    first: number | undefined = undefined,
    after: string | undefined = undefined,
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
    id: string,
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

  public toJson() {
    return {
      __typename: "OutgoingPaymentAttempt",
      outgoing_payment_attempt_id: this.id,
      outgoing_payment_attempt_created_at: this.createdAt,
      outgoing_payment_attempt_updated_at: this.updatedAt,
      outgoing_payment_attempt_status: this.status,
      outgoing_payment_attempt_failure_code: this.failureCode,
      outgoing_payment_attempt_failure_source_index: this.failureSourceIndex,
      outgoing_payment_attempt_attempted_at: this.attemptedAt,
      outgoing_payment_attempt_resolved_at: this.resolvedAt,
      outgoing_payment_attempt_amount: this.amount
        ? CurrencyAmountToJson(this.amount)
        : undefined,
      outgoing_payment_attempt_fees: this.fees
        ? CurrencyAmountToJson(this.fees)
        : undefined,
      outgoing_payment_attempt_outgoing_payment: { id: this.outgoingPaymentId },
      outgoing_payment_attempt_channel_snapshot: this.channelSnapshot
        ? ChannelSnapshotToJson(this.channelSnapshot)
        : undefined,
    };
  }
}

export const OutgoingPaymentAttemptFromJson = (
  obj: any,
): OutgoingPaymentAttempt => {
  return new OutgoingPaymentAttempt(
    obj["outgoing_payment_attempt_id"],
    obj["outgoing_payment_attempt_created_at"],
    obj["outgoing_payment_attempt_updated_at"],
    OutgoingPaymentAttemptStatus[obj["outgoing_payment_attempt_status"]] ??
      OutgoingPaymentAttemptStatus.FUTURE_VALUE,
    obj["outgoing_payment_attempt_attempted_at"],
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
      : undefined,
    !!obj["outgoing_payment_attempt_channel_snapshot"]
      ? ChannelSnapshotFromJson(
          obj["outgoing_payment_attempt_channel_snapshot"],
        )
      : undefined,
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
        __typename
        channel_snapshot_channel: channel {
            id
        }
        channel_snapshot_timestamp: timestamp
        channel_snapshot_local_balance: local_balance {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        channel_snapshot_local_unsettled_balance: local_unsettled_balance {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        channel_snapshot_local_channel_reserve: local_channel_reserve {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        channel_snapshot_remote_balance: remote_balance {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
        channel_snapshot_remote_unsettled_balance: remote_unsettled_balance {
            __typename
            currency_amount_original_value: original_value
            currency_amount_original_unit: original_unit
            currency_amount_preferred_currency_unit: preferred_currency_unit
            currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
            currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
        }
    }
}`;

export default OutgoingPaymentAttempt;
