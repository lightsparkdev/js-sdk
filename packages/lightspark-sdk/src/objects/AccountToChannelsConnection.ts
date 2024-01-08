// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type Channel from "./Channel.js";
import { ChannelFromJson } from "./Channel.js";
import type PageInfo from "./PageInfo.js";
import { PageInfoFromJson, PageInfoToJson } from "./PageInfo.js";

interface AccountToChannelsConnection {
  /**
   * The total count of objects in this connection, using the current filters. It is different
   * from the number of objects returned in the current page (in the `entities` field).
   **/
  count: number;

  /** An object that holds pagination information about the objects in this connection. **/
  pageInfo: PageInfo;

  /** The channels for the current page of this connection. **/
  entities: Channel[];

  /** The typename of the object **/
  typename: string;
}

export const AccountToChannelsConnectionFromJson = (
  obj: any,
): AccountToChannelsConnection => {
  return {
    count: obj["account_to_channels_connection_count"],
    pageInfo: PageInfoFromJson(obj["account_to_channels_connection_page_info"]),
    entities: obj["account_to_channels_connection_entities"].map((e) =>
      ChannelFromJson(e),
    ),
    typename: "AccountToChannelsConnection",
  } as AccountToChannelsConnection;
};
export const AccountToChannelsConnectionToJson = (
  obj: AccountToChannelsConnection,
): any => {
  return {
    __typename: "AccountToChannelsConnection",
    account_to_channels_connection_count: obj.count,
    account_to_channels_connection_page_info: PageInfoToJson(obj.pageInfo),
    account_to_channels_connection_entities: obj.entities.map((e) =>
      e.toJson(),
    ),
  };
};

export const FRAGMENT = `
fragment AccountToChannelsConnectionFragment on AccountToChannelsConnection {
    __typename
    account_to_channels_connection_count: count
    account_to_channels_connection_page_info: page_info {
        __typename
        page_info_has_next_page: has_next_page
        page_info_has_previous_page: has_previous_page
        page_info_start_cursor: start_cursor
        page_info_end_cursor: end_cursor
    }
    account_to_channels_connection_entities: entities {
        id
    }
}`;

export default AccountToChannelsConnection;
