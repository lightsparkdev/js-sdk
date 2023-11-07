// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { LightsparkException } from "@lightsparkdev/core";
import type PageInfo from "./PageInfo.js";
import { PageInfoFromJson } from "./PageInfo.js";
import { PaymentRequestFromJson } from "./PaymentRequest.js";
import { TransactionFromJson } from "./Transaction.js";
import type WalletToPaymentRequestsConnection from "./WalletToPaymentRequestsConnection.js";
import type WalletToTransactionsConnection from "./WalletToTransactionsConnection.js";

type Connection = {
  /**
   * The total count of objects in this connection, using the current filters. It is different from the
   * number of objects returned in the current page (in the `entities` field).
   **/
  count: number;

  /** An object that holds pagination information about the objects in this connection. **/
  pageInfo: PageInfo;

  /** The typename of the object **/
  typename: string;
};

export const ConnectionFromJson = (obj: any): Connection => {
  if (obj["__typename"] == "WalletToPaymentRequestsConnection") {
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
  }
  if (obj["__typename"] == "WalletToTransactionsConnection") {
    return {
      count: obj["wallet_to_transactions_connection_count"],
      pageInfo: PageInfoFromJson(
        obj["wallet_to_transactions_connection_page_info"],
      ),
      entities: obj["wallet_to_transactions_connection_entities"].map((e) =>
        TransactionFromJson(e),
      ),
      typename: "WalletToTransactionsConnection",
    } as WalletToTransactionsConnection;
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface Connection corresponding to the typename=${obj["__typename"]}`,
  );
};

export const FRAGMENT = `
fragment ConnectionFragment on Connection {
    __typename
    ... on WalletToPaymentRequestsConnection {
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
    }
    ... on WalletToTransactionsConnection {
        __typename
        wallet_to_transactions_connection_count: count
        wallet_to_transactions_connection_page_info: page_info {
            __typename
            page_info_has_next_page: has_next_page
            page_info_has_previous_page: has_previous_page
            page_info_start_cursor: start_cursor
            page_info_end_cursor: end_cursor
        }
        wallet_to_transactions_connection_entities: entities {
            id
        }
    }
}`;

export default Connection;
