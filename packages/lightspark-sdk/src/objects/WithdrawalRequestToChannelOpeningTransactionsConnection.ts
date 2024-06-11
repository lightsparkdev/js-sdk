// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type ChannelOpeningTransaction from "./ChannelOpeningTransaction.js";
import {
  ChannelOpeningTransactionFromJson,
  ChannelOpeningTransactionToJson,
} from "./ChannelOpeningTransaction.js";
import type PageInfo from "./PageInfo.js";
import { PageInfoFromJson, PageInfoToJson } from "./PageInfo.js";

interface WithdrawalRequestToChannelOpeningTransactionsConnection {
  /**
   * The total count of objects in this connection, using the current filters. It is different
   * from the number of objects returned in the current page (in the `entities` field).
   **/
  count: number;

  /** An object that holds pagination information about the objects in this connection. **/
  pageInfo: PageInfo;

  /** The channel opening transactions for the current page of this connection. **/
  entities: ChannelOpeningTransaction[];

  /** The typename of the object **/
  typename: string;
}

export const WithdrawalRequestToChannelOpeningTransactionsConnectionFromJson = (
  obj: any,
): WithdrawalRequestToChannelOpeningTransactionsConnection => {
  return {
    count:
      obj[
        "withdrawal_request_to_channel_opening_transactions_connection_count"
      ],
    pageInfo: PageInfoFromJson(
      obj[
        "withdrawal_request_to_channel_opening_transactions_connection_page_info"
      ],
    ),
    entities: obj[
      "withdrawal_request_to_channel_opening_transactions_connection_entities"
    ].map((e) => ChannelOpeningTransactionFromJson(e)),
    typename: "WithdrawalRequestToChannelOpeningTransactionsConnection",
  } as WithdrawalRequestToChannelOpeningTransactionsConnection;
};
export const WithdrawalRequestToChannelOpeningTransactionsConnectionToJson = (
  obj: WithdrawalRequestToChannelOpeningTransactionsConnection,
): any => {
  return {
    __typename: "WithdrawalRequestToChannelOpeningTransactionsConnection",
    withdrawal_request_to_channel_opening_transactions_connection_count:
      obj.count,
    withdrawal_request_to_channel_opening_transactions_connection_page_info:
      PageInfoToJson(obj.pageInfo),
    withdrawal_request_to_channel_opening_transactions_connection_entities:
      obj.entities.map((e) => ChannelOpeningTransactionToJson(e)),
  };
};

export const FRAGMENT = `
fragment WithdrawalRequestToChannelOpeningTransactionsConnectionFragment on WithdrawalRequestToChannelOpeningTransactionsConnection {
    __typename
    withdrawal_request_to_channel_opening_transactions_connection_count: count
    withdrawal_request_to_channel_opening_transactions_connection_page_info: page_info {
        __typename
        page_info_has_next_page: has_next_page
        page_info_has_previous_page: has_previous_page
        page_info_start_cursor: start_cursor
        page_info_end_cursor: end_cursor
    }
    withdrawal_request_to_channel_opening_transactions_connection_entities: entities {
        id
    }
}`;

export default WithdrawalRequestToChannelOpeningTransactionsConnection;
