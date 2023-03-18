// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import ApiToken, { ApiTokenFromJson } from "./ApiToken.js";
import PageInfo, { PageInfoFromJson } from "./PageInfo.js";

type AccountToApiTokensConnection = {
  /** An object that holds pagination information about the objects in this connection. **/
  pageInfo: PageInfo;

  /**
   * The total count of objects in this connection, using the current filters. It is different from the
   * number of objects returned in the current page (in the `entities` field).
   **/
  count: number;

  /** The API tokens for the current page of this connection. **/
  entities: ApiToken[];
};

export const AccountToApiTokensConnectionFromJson = (
  obj: any
): AccountToApiTokensConnection => {
  return {
    pageInfo: PageInfoFromJson(
      obj["account_to_api_tokens_connection_page_info"]
    ),
    count: obj["account_to_api_tokens_connection_count"],
    entities: obj["account_to_api_tokens_connection_entities"].map((e) =>
      ApiTokenFromJson(e)
    ),
  } as AccountToApiTokensConnection;
};

export const FRAGMENT = `
fragment AccountToApiTokensConnectionFragment on AccountToApiTokensConnection {
    __typename
    account_to_api_tokens_connection_page_info: page_info {
        __typename
        page_info_has_next_page: has_next_page
        page_info_has_previous_page: has_previous_page
        page_info_start_cursor: start_cursor
        page_info_end_cursor: end_cursor
    }
    account_to_api_tokens_connection_count: count
    account_to_api_tokens_connection_entities: entities {
        id
    }
}`;

export default AccountToApiTokensConnection;
