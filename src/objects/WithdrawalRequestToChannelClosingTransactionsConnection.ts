// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import ChannelClosingTransaction, {
  ChannelClosingTransactionFromJson,
} from "./ChannelClosingTransaction.js";
import PageInfo, { PageInfoFromJson } from "./PageInfo.js";

type WithdrawalRequestToChannelClosingTransactionsConnection = {
  /** An object that holds pagination information about the objects in this connection. **/
  pageInfo: PageInfo;

  /**
   * The total count of objects in this connection, using the current filters. It is different from the
   * number of objects returned in the current page (in the `entities` field).
   **/
  count: number;

  /** The channel closing transactions for the current page of this connection. **/
  entities: ChannelClosingTransaction[];
};

export const WithdrawalRequestToChannelClosingTransactionsConnectionFromJson = (
  obj: any
): WithdrawalRequestToChannelClosingTransactionsConnection => {
  return {
    pageInfo: PageInfoFromJson(
      obj[
        "withdrawal_request_to_channel_closing_transactions_connection_page_info"
      ]
    ),
    count:
      obj[
        "withdrawal_request_to_channel_closing_transactions_connection_count"
      ],
    entities: obj[
      "withdrawal_request_to_channel_closing_transactions_connection_entities"
    ].map((e) => ChannelClosingTransactionFromJson(e)),
  } as WithdrawalRequestToChannelClosingTransactionsConnection;
};

export const FRAGMENT = `
fragment WithdrawalRequestToChannelClosingTransactionsConnectionFragment on WithdrawalRequestToChannelClosingTransactionsConnection {
    __typename
    withdrawal_request_to_channel_closing_transactions_connection_page_info: page_info {
        __typename
        page_info_has_next_page: has_next_page
        page_info_has_previous_page: has_previous_page
        page_info_start_cursor: start_cursor
        page_info_end_cursor: end_cursor
    }
    withdrawal_request_to_channel_closing_transactions_connection_count: count
    withdrawal_request_to_channel_closing_transactions_connection_entities: entities {
        id
    }
}`;

export default WithdrawalRequestToChannelClosingTransactionsConnection;
