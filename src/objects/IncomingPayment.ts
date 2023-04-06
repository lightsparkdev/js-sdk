// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import autoBind from "auto-bind";
import LightsparkClient from "../client.js";
import Query from "../requester/Query.js";
import CurrencyAmount, { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import IncomingPaymentAttemptStatus from "./IncomingPaymentAttemptStatus.js";
import IncomingPaymentToAttemptsConnection, {
  IncomingPaymentToAttemptsConnectionFromJson,
} from "./IncomingPaymentToAttemptsConnection.js";
import LightningTransaction from "./LightningTransaction.js";
import TransactionStatus from "./TransactionStatus.js";

/** A transaction that was sent to a Lightspark node on the Lightning Network. **/
class IncomingPayment implements LightningTransaction {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly status: TransactionStatus,
    public readonly amount: CurrencyAmount,
    public readonly destinationId: string,
    public readonly typename: string,
    public readonly resolvedAt?: string,
    public readonly transactionHash?: string,
    public readonly originId?: string,
    public readonly paymentRequestId?: string
  ) {
    autoBind(this);
  }

  public async getAttempts(
    client: LightsparkClient,
    first: number | undefined = undefined,
    statuses: IncomingPaymentAttemptStatus[] | undefined = undefined
  ): Promise<IncomingPaymentToAttemptsConnection> {
    return (await client.executeRawQuery({
      queryPayload: ` 
query FetchIncomingPaymentToAttemptsConnection($entity_id: ID!, $first: Int, $statuses: [IncomingPaymentAttemptStatus!]) {
    entity(id: $entity_id) {
        ... on IncomingPayment {
            attempts(, first: $first, statuses: $statuses) {
                __typename
                incoming_payment_to_attempts_connection_count: count
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
      variables: { entity_id: this.id, first: first, statuses: statuses },
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
    obj["incoming_payment_origin"]?.id ?? undefined,
    obj["incoming_payment_payment_request"]?.id ?? undefined
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
    incoming_payment_origin: origin {
        id
    }
    incoming_payment_destination: destination {
        id
    }
    incoming_payment_payment_request: payment_request {
        id
    }
}`;

export default IncomingPayment;
