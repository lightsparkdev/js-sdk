// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import ChannelOpeningTransaction, {
  ChannelOpeningTransactionFromJson,
} from "./ChannelOpeningTransaction.js";
import PageInfo, { PageInfoFromJson } from "./PageInfo.js";

type WithdrawalRequestToChannelOpeningTransactionsConnection = {
  /** An object that holds pagination information about the objects in this connection. **/
  pageInfo: PageInfo;

  /**
   * The total count of objects in this connection, using the current filters. It is different from the
   * number of objects returned in the current page (in the `entities` field).
   **/
  count: number;

  /** The channel opening transactions for the current page of this connection. **/
  entities: ChannelOpeningTransaction[];
};

export const WithdrawalRequestToChannelOpeningTransactionsConnectionFromJson = (
  obj: any
): WithdrawalRequestToChannelOpeningTransactionsConnection => {
  return {
    pageInfo: PageInfoFromJson(
      obj[
        "withdrawal_request_to_channel_opening_transactions_connection_page_info"
      ]
    ),
    count:
      obj[
        "withdrawal_request_to_channel_opening_transactions_connection_count"
      ],
    entities: obj[
      "withdrawal_request_to_channel_opening_transactions_connection_entities"
    ].map((e) => ChannelOpeningTransactionFromJson(e)),
  } as WithdrawalRequestToChannelOpeningTransactionsConnection;
};

export const FRAGMENT = `
fragment WithdrawalRequestToChannelOpeningTransactionsConnectionFragment on WithdrawalRequestToChannelOpeningTransactionsConnection {
    __typename
    withdrawal_request_to_channel_opening_transactions_connection_page_info: page_info {
        __typename
        page_info_has_next_page: has_next_page
        page_info_has_previous_page: has_previous_page
        page_info_start_cursor: start_cursor
        page_info_end_cursor: end_cursor
    }
    withdrawal_request_to_channel_opening_transactions_connection_count: count
    withdrawal_request_to_channel_opening_transactions_connection_entities: entities {
        id
    }
}`;

export default WithdrawalRequestToChannelOpeningTransactionsConnection;
