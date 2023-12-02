// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type PageInfo from "./PageInfo.js";
import { PageInfoFromJson, PageInfoToJson } from "./PageInfo.js";
import type PaymentRequest from "./PaymentRequest.js";
import {
  PaymentRequestFromJson,
  PaymentRequestToJson,
} from "./PaymentRequest.js";

interface WalletToPaymentRequestsConnection {
  /**
   * The total count of objects in this connection, using the current filters. It is different
   * from the number of objects returned in the current page (in the `entities` field).
   **/
  count: number;

  /** An object that holds pagination information about the objects in this connection. **/
  pageInfo: PageInfo;

  /** The payment requests for the current page of this connection. **/
  entities: PaymentRequest[];

  /** The typename of the object **/
  typename: string;
}

export const WalletToPaymentRequestsConnectionFromJson = (
  obj: any,
): WalletToPaymentRequestsConnection => {
  return {
    count: obj["wallet_to_payment_requests_connection_count"],
    pageInfo: PageInfoFromJson(
      obj["wallet_to_payment_requests_connection_page_info"],
    ),
    entities: obj["wallet_to_payment_requests_connection_entities"].map((e) =>
      PaymentRequestFromJson(e),
    ),
    typename: "WalletToPaymentRequestsConnection",
  } as WalletToPaymentRequestsConnection;
};
export const WalletToPaymentRequestsConnectionToJson = (
  obj: WalletToPaymentRequestsConnection,
): any => {
  return {
    __typename: "WalletToPaymentRequestsConnection",
    wallet_to_payment_requests_connection_count: obj.count,
    wallet_to_payment_requests_connection_page_info: PageInfoToJson(
      obj.pageInfo,
    ),
    wallet_to_payment_requests_connection_entities: obj.entities.map((e) =>
      PaymentRequestToJson(e),
    ),
  };
};

export const FRAGMENT = `
fragment WalletToPaymentRequestsConnectionFragment on WalletToPaymentRequestsConnection {
    __typename
    wallet_to_payment_requests_connection_count: count
    wallet_to_payment_requests_connection_page_info: page_info {
        __typename
        page_info_has_next_page: has_next_page
        page_info_has_previous_page: has_previous_page
        page_info_start_cursor: start_cursor
        page_info_end_cursor: end_cursor
    }
    wallet_to_payment_requests_connection_entities: entities {
        id
    }
}`;

export default WalletToPaymentRequestsConnection;
