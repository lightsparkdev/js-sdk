// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import OutgoingPaymentAttempt, {
  OutgoingPaymentAttemptFromJson,
} from "./OutgoingPaymentAttempt.js";

/** The connection from outgoing payment to all attempts. **/
type OutgoingPaymentToAttemptsConnection = {
  /**
   * The total count of objects in this connection, using the current filters. It is different from the
   * number of objects returned in the current page (in the `entities` field).
   **/
  count: number;

  /** The attempts for the current page of this connection. **/
  entities: OutgoingPaymentAttempt[];
};

export const OutgoingPaymentToAttemptsConnectionFromJson = (
  obj: any
): OutgoingPaymentToAttemptsConnection => {
  return {
    count: obj["outgoing_payment_to_attempts_connection_count"],
    entities: obj["outgoing_payment_to_attempts_connection_entities"].map((e) =>
      OutgoingPaymentAttemptFromJson(e)
    ),
  } as OutgoingPaymentToAttemptsConnection;
};

export const FRAGMENT = `
fragment OutgoingPaymentToAttemptsConnectionFragment on OutgoingPaymentToAttemptsConnection {
    __typename
    outgoing_payment_to_attempts_connection_count: count
    outgoing_payment_to_attempts_connection_entities: entities {
        id
    }
}`;

export default OutgoingPaymentToAttemptsConnection;
