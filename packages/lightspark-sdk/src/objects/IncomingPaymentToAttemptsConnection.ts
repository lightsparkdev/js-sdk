// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type IncomingPaymentAttempt from "./IncomingPaymentAttempt.js";
import {
  IncomingPaymentAttemptFromJson,
  IncomingPaymentAttemptToJson,
} from "./IncomingPaymentAttempt.js";
import type PageInfo from "./PageInfo.js";
import { PageInfoFromJson, PageInfoToJson } from "./PageInfo.js";

/** The connection from incoming payment to all attempts. **/
interface IncomingPaymentToAttemptsConnection {
  /**
   * The total count of objects in this connection, using the current filters. It is different
   * from the number of objects returned in the current page (in the `entities` field).
   **/
  count: number;

  /** An object that holds pagination information about the objects in this connection. **/
  pageInfo: PageInfo;

  /** The incoming payment attempts for the current page of this connection. **/
  entities: IncomingPaymentAttempt[];

  /** The typename of the object **/
  typename: string;
}

export const IncomingPaymentToAttemptsConnectionFromJson = (
  obj: any,
): IncomingPaymentToAttemptsConnection => {
  return {
    count: obj["incoming_payment_to_attempts_connection_count"],
    pageInfo: PageInfoFromJson(
      obj["incoming_payment_to_attempts_connection_page_info"],
    ),
    entities: obj["incoming_payment_to_attempts_connection_entities"].map((e) =>
      IncomingPaymentAttemptFromJson(e),
    ),
    typename: "IncomingPaymentToAttemptsConnection",
  } as IncomingPaymentToAttemptsConnection;
};
export const IncomingPaymentToAttemptsConnectionToJson = (
  obj: IncomingPaymentToAttemptsConnection,
): any => {
  return {
    __typename: "IncomingPaymentToAttemptsConnection",
    incoming_payment_to_attempts_connection_count: obj.count,
    incoming_payment_to_attempts_connection_page_info: PageInfoToJson(
      obj.pageInfo,
    ),
    incoming_payment_to_attempts_connection_entities: obj.entities.map((e) =>
      IncomingPaymentAttemptToJson(e),
    ),
  };
};

export const FRAGMENT = `
fragment IncomingPaymentToAttemptsConnectionFragment on IncomingPaymentToAttemptsConnection {
    __typename
    incoming_payment_to_attempts_connection_count: count
    incoming_payment_to_attempts_connection_page_info: page_info {
        __typename
        page_info_has_next_page: has_next_page
        page_info_has_previous_page: has_previous_page
        page_info_start_cursor: start_cursor
        page_info_end_cursor: end_cursor
    }
    incoming_payment_to_attempts_connection_entities: entities {
        id
    }
}`;

export default IncomingPaymentToAttemptsConnection;
