// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { HopFromJson } from "./Hop.js";
import Hop from "./Hop.js";

/** The connection from an outgoing payment attempt to the list of sequential hops that define the path from sender node to recipient node. **/
type OutgoingPaymentAttemptToHopsConnection = {
  /** The total count of objects in this connection, using the current filters. It is different from the number of objects returned in the current page (in the `entities` field). **/
  count: number;

  /** The hops for the current page of this connection. **/
  entities: Hop[];
};

export const OutgoingPaymentAttemptToHopsConnectionFromJson = (
  obj: any
): OutgoingPaymentAttemptToHopsConnection => {
  return {
    count: obj["outgoing_payment_attempt_to_hops_connection_count"],
    entities: obj["outgoing_payment_attempt_to_hops_connection_entities"].map(
      (e) => HopFromJson(e)
    ),
  } as OutgoingPaymentAttemptToHopsConnection;
};

export const FRAGMENT = `
fragment OutgoingPaymentAttemptToHopsConnectionFragment on OutgoingPaymentAttemptToHopsConnection {
    __typename
    outgoing_payment_attempt_to_hops_connection_count: count
    outgoing_payment_attempt_to_hops_connection_entities: entities {
        id
    }
}`;

export default OutgoingPaymentAttemptToHopsConnection;
