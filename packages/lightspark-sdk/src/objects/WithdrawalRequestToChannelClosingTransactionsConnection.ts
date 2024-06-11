// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type ChannelClosingTransaction from "./ChannelClosingTransaction.js";
import {
  ChannelClosingTransactionFromJson,
  ChannelClosingTransactionToJson,
} from "./ChannelClosingTransaction.js";
import type PageInfo from "./PageInfo.js";
import { PageInfoFromJson, PageInfoToJson } from "./PageInfo.js";

interface WithdrawalRequestToChannelClosingTransactionsConnection {
  /**
   * The total count of objects in this connection, using the current filters. It is different
   * from the number of objects returned in the current page (in the `entities` field).
   **/
  count: number;

  /** An object that holds pagination information about the objects in this connection. **/
  pageInfo: PageInfo;

  /** The channel closing transactions for the current page of this connection. **/
  entities: ChannelClosingTransaction[];

  /** The typename of the object **/
  typename: string;
}

export const WithdrawalRequestToChannelClosingTransactionsConnectionFromJson = (
  obj: any,
): WithdrawalRequestToChannelClosingTransactionsConnection => {
  return {
    count:
      obj[
        "withdrawal_request_to_channel_closing_transactions_connection_count"
      ],
    pageInfo: PageInfoFromJson(
      obj[
        "withdrawal_request_to_channel_closing_transactions_connection_page_info"
      ],
    ),
    entities: obj[
      "withdrawal_request_to_channel_closing_transactions_connection_entities"
    ].map((e) => ChannelClosingTransactionFromJson(e)),
    typename: "WithdrawalRequestToChannelClosingTransactionsConnection",
  } as WithdrawalRequestToChannelClosingTransactionsConnection;
};
export const WithdrawalRequestToChannelClosingTransactionsConnectionToJson = (
  obj: WithdrawalRequestToChannelClosingTransactionsConnection,
): any => {
  return {
    __typename: "WithdrawalRequestToChannelClosingTransactionsConnection",
    withdrawal_request_to_channel_closing_transactions_connection_count:
      obj.count,
    withdrawal_request_to_channel_closing_transactions_connection_page_info:
      PageInfoToJson(obj.pageInfo),
    withdrawal_request_to_channel_closing_transactions_connection_entities:
      obj.entities.map((e) => ChannelClosingTransactionToJson(e)),
  };
};

export const FRAGMENT = `
fragment WithdrawalRequestToChannelClosingTransactionsConnectionFragment on WithdrawalRequestToChannelClosingTransactionsConnection {
    __typename
    withdrawal_request_to_channel_closing_transactions_connection_count: count
    withdrawal_request_to_channel_closing_transactions_connection_page_info: page_info {
        __typename
        page_info_has_next_page: has_next_page
        page_info_has_previous_page: has_previous_page
        page_info_start_cursor: start_cursor
        page_info_end_cursor: end_cursor
    }
    withdrawal_request_to_channel_closing_transactions_connection_entities: entities {
        id
    }
}`;

export default WithdrawalRequestToChannelClosingTransactionsConnection;
