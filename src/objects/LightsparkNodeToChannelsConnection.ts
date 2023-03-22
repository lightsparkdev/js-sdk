// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import Channel, { ChannelFromJson } from "./Channel.js";
import PageInfo, { PageInfoFromJson } from "./PageInfo.js";

type LightsparkNodeToChannelsConnection = {
  /** An object that holds pagination information about the objects in this connection. **/
  pageInfo: PageInfo;

  /**
   * The total count of objects in this connection, using the current filters. It is different from the
   * number of objects returned in the current page (in the `entities` field).
   **/
  count: number;

  /** The channels for the current page of this connection. **/
  entities: Channel[];
};

export const LightsparkNodeToChannelsConnectionFromJson = (
  obj: any
): LightsparkNodeToChannelsConnection => {
  return {
    pageInfo: PageInfoFromJson(
      obj["lightspark_node_to_channels_connection_page_info"]
    ),
    count: obj["lightspark_node_to_channels_connection_count"],
    entities: obj["lightspark_node_to_channels_connection_entities"].map((e) =>
      ChannelFromJson(e)
    ),
  } as LightsparkNodeToChannelsConnection;
};

export const FRAGMENT = `
fragment LightsparkNodeToChannelsConnectionFragment on LightsparkNodeToChannelsConnection {
    __typename
    lightspark_node_to_channels_connection_page_info: page_info {
        __typename
        page_info_has_next_page: has_next_page
        page_info_has_previous_page: has_previous_page
        page_info_start_cursor: start_cursor
        page_info_end_cursor: end_cursor
    }
    lightspark_node_to_channels_connection_count: count
    lightspark_node_to_channels_connection_entities: entities {
        id
    }
}`;

export default LightsparkNodeToChannelsConnection;
