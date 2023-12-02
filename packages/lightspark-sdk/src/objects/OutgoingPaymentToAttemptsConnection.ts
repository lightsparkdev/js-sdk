// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type OutgoingPaymentAttempt from "./OutgoingPaymentAttempt.js";
import { OutgoingPaymentAttemptFromJson } from "./OutgoingPaymentAttempt.js";
import type PageInfo from "./PageInfo.js";
import { PageInfoFromJson, PageInfoToJson } from "./PageInfo.js";

/** The connection from outgoing payment to all attempts. **/
interface OutgoingPaymentToAttemptsConnection {
  /**
   * The total count of objects in this connection, using the current filters. It is different
   * from the number of objects returned in the current page (in the `entities` field).
   **/
  count: number;

  /** An object that holds pagination information about the objects in this connection. **/
  pageInfo: PageInfo;

  /** The attempts for the current page of this connection. **/
  entities: OutgoingPaymentAttempt[];

  /** The typename of the object **/
  typename: string;
}

export const OutgoingPaymentToAttemptsConnectionFromJson = (
  obj: any,
): OutgoingPaymentToAttemptsConnection => {
  return {
    count: obj["outgoing_payment_to_attempts_connection_count"],
    pageInfo: PageInfoFromJson(
      obj["outgoing_payment_to_attempts_connection_page_info"],
    ),
    entities: obj["outgoing_payment_to_attempts_connection_entities"].map((e) =>
      OutgoingPaymentAttemptFromJson(e),
    ),
    typename: "OutgoingPaymentToAttemptsConnection",
  } as OutgoingPaymentToAttemptsConnection;
};
export const OutgoingPaymentToAttemptsConnectionToJson = (
  obj: OutgoingPaymentToAttemptsConnection,
): any => {
  return {
    __typename: "OutgoingPaymentToAttemptsConnection",
    outgoing_payment_to_attempts_connection_count: obj.count,
    outgoing_payment_to_attempts_connection_page_info: PageInfoToJson(
      obj.pageInfo,
    ),
    outgoing_payment_to_attempts_connection_entities: obj.entities.map((e) =>
      e.toJson(),
    ),
  };
};

export const FRAGMENT = `
fragment OutgoingPaymentToAttemptsConnectionFragment on OutgoingPaymentToAttemptsConnection {
    __typename
    outgoing_payment_to_attempts_connection_count: count
    outgoing_payment_to_attempts_connection_page_info: page_info {
        __typename
        page_info_has_next_page: has_next_page
        page_info_has_previous_page: has_previous_page
        page_info_start_cursor: start_cursor
        page_info_end_cursor: end_cursor
    }
    outgoing_payment_to_attempts_connection_entities: entities {
        id
    }
}`;

export default OutgoingPaymentToAttemptsConnection;
