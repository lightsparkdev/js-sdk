// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import IncomingPaymentAttempt, {
  IncomingPaymentAttemptFromJson,
} from "./IncomingPaymentAttempt.js";

/** The connection from incoming payment to all attempts. **/
type IncomingPaymentToAttemptsConnection = {
  /**
   * The total count of objects in this connection, using the current filters. It is different from the
   * number of objects returned in the current page (in the `entities` field).
   **/
  count: number;

  /** The incoming payment attempts for the current page of this connection. **/
  entities: IncomingPaymentAttempt[];
};

export const IncomingPaymentToAttemptsConnectionFromJson = (
  obj: any
): IncomingPaymentToAttemptsConnection => {
  return {
    count: obj["incoming_payment_to_attempts_connection_count"],
    entities: obj["incoming_payment_to_attempts_connection_entities"].map((e) =>
      IncomingPaymentAttemptFromJson(e)
    ),
  } as IncomingPaymentToAttemptsConnection;
};

export const FRAGMENT = `
fragment IncomingPaymentToAttemptsConnectionFragment on IncomingPaymentToAttemptsConnection {
    __typename
    incoming_payment_to_attempts_connection_count: count
    incoming_payment_to_attempts_connection_entities: entities {
        id
    }
}`;

export default IncomingPaymentToAttemptsConnection;
