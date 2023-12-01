// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type Hop from "./Hop.js";
import { HopFromJson, HopToJson } from "./Hop.js";
import type PageInfo from "./PageInfo.js";
import { PageInfoFromJson, PageInfoToJson } from "./PageInfo.js";

/**
 * The connection from an outgoing payment attempt to the list of sequential hops that define the
 * path from sender node to recipient node. *
 */
interface OutgoingPaymentAttemptToHopsConnection {
  /**
   * The total count of objects in this connection, using the current filters. It is different
   * from the number of objects returned in the current page (in the `entities` field).
   **/
  count: number;

  /** An object that holds pagination information about the objects in this connection. **/
  pageInfo: PageInfo;

  /** The hops for the current page of this connection. **/
  entities: Hop[];

  /** The typename of the object **/
  typename: string;
}

export const OutgoingPaymentAttemptToHopsConnectionFromJson = (
  obj: any,
): OutgoingPaymentAttemptToHopsConnection => {
  return {
    count: obj["outgoing_payment_attempt_to_hops_connection_count"],
    pageInfo: PageInfoFromJson(
      obj["outgoing_payment_attempt_to_hops_connection_page_info"],
    ),
    entities: obj["outgoing_payment_attempt_to_hops_connection_entities"].map(
      (e) => HopFromJson(e),
    ),
    typename: "OutgoingPaymentAttemptToHopsConnection",
  } as OutgoingPaymentAttemptToHopsConnection;
};
export const OutgoingPaymentAttemptToHopsConnectionToJson = (
  obj: OutgoingPaymentAttemptToHopsConnection,
): any => {
  return {
    __typename: "OutgoingPaymentAttemptToHopsConnection",
    outgoing_payment_attempt_to_hops_connection_count: obj.count,
    outgoing_payment_attempt_to_hops_connection_page_info: PageInfoToJson(
      obj.pageInfo,
    ),
    outgoing_payment_attempt_to_hops_connection_entities: obj.entities.map(
      (e) => HopToJson(e),
    ),
  };
};

export const FRAGMENT = `
fragment OutgoingPaymentAttemptToHopsConnectionFragment on OutgoingPaymentAttemptToHopsConnection {
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
        id
    }
}`;

export default OutgoingPaymentAttemptToHopsConnection;
