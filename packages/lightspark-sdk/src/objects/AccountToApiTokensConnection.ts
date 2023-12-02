// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type ApiToken from "./ApiToken.js";
import { ApiTokenFromJson, ApiTokenToJson } from "./ApiToken.js";
import type PageInfo from "./PageInfo.js";
import { PageInfoFromJson, PageInfoToJson } from "./PageInfo.js";

interface AccountToApiTokensConnection {
  /**
   * The total count of objects in this connection, using the current filters. It is different
   * from the number of objects returned in the current page (in the `entities` field).
   **/
  count: number;

  /** An object that holds pagination information about the objects in this connection. **/
  pageInfo: PageInfo;

  /** The API tokens for the current page of this connection. **/
  entities: ApiToken[];

  /** The typename of the object **/
  typename: string;
}

export const AccountToApiTokensConnectionFromJson = (
  obj: any,
): AccountToApiTokensConnection => {
  return {
    count: obj["account_to_api_tokens_connection_count"],
    pageInfo: PageInfoFromJson(
      obj["account_to_api_tokens_connection_page_info"],
    ),
    entities: obj["account_to_api_tokens_connection_entities"].map((e) =>
      ApiTokenFromJson(e),
    ),
    typename: "AccountToApiTokensConnection",
  } as AccountToApiTokensConnection;
};
export const AccountToApiTokensConnectionToJson = (
  obj: AccountToApiTokensConnection,
): any => {
  return {
    __typename: "AccountToApiTokensConnection",
    account_to_api_tokens_connection_count: obj.count,
    account_to_api_tokens_connection_page_info: PageInfoToJson(obj.pageInfo),
    account_to_api_tokens_connection_entities: obj.entities.map((e) =>
      ApiTokenToJson(e),
    ),
  };
};

export const FRAGMENT = `
fragment AccountToApiTokensConnectionFragment on AccountToApiTokensConnection {
    __typename
    account_to_api_tokens_connection_count: count
    account_to_api_tokens_connection_page_info: page_info {
        __typename
        page_info_has_next_page: has_next_page
        page_info_has_previous_page: has_previous_page
        page_info_start_cursor: start_cursor
        page_info_end_cursor: end_cursor
    }
    account_to_api_tokens_connection_entities: entities {
        id
    }
}`;

export default AccountToApiTokensConnection;
