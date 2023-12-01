// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type LightsparkNode from "./LightsparkNode.js";
import {
  LightsparkNodeFromJson,
  LightsparkNodeToJson,
} from "./LightsparkNode.js";
import type PageInfo from "./PageInfo.js";
import { PageInfoFromJson, PageInfoToJson } from "./PageInfo.js";

/** A connection between an account and the nodes it manages. **/
interface AccountToNodesConnection {
  /**
   * The total count of objects in this connection, using the current filters. It is different
   * from the number of objects returned in the current page (in the `entities` field).
   **/
  count: number;

  /** An object that holds pagination information about the objects in this connection. **/
  pageInfo: PageInfo;

  /** The nodes for the current page of this connection. **/
  entities: LightsparkNode[];

  /** The typename of the object **/
  typename: string;
}

export const AccountToNodesConnectionFromJson = (
  obj: any,
): AccountToNodesConnection => {
  return {
    count: obj["account_to_nodes_connection_count"],
    pageInfo: PageInfoFromJson(obj["account_to_nodes_connection_page_info"]),
    entities: obj["account_to_nodes_connection_entities"].map((e) =>
      LightsparkNodeFromJson(e),
    ),
    typename: "AccountToNodesConnection",
  } as AccountToNodesConnection;
};
export const AccountToNodesConnectionToJson = (
  obj: AccountToNodesConnection,
): any => {
  return {
    __typename: "AccountToNodesConnection",
    account_to_nodes_connection_count: obj.count,
    account_to_nodes_connection_page_info: PageInfoToJson(obj.pageInfo),
    account_to_nodes_connection_entities: obj.entities.map((e) =>
      LightsparkNodeToJson(e),
    ),
  };
};

export const FRAGMENT = `
fragment AccountToNodesConnectionFragment on AccountToNodesConnection {
    __typename
    account_to_nodes_connection_count: count
    account_to_nodes_connection_page_info: page_info {
        __typename
        page_info_has_next_page: has_next_page
        page_info_has_previous_page: has_previous_page
        page_info_start_cursor: start_cursor
        page_info_end_cursor: end_cursor
    }
    account_to_nodes_connection_entities: entities {
        id
    }
}`;

export default AccountToNodesConnection;
