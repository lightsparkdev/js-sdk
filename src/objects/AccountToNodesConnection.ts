// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import LightsparkNode, { LightsparkNodeFromJson } from "./LightsparkNode.js";
import LightsparkNodePurpose from "./LightsparkNodePurpose.js";
import PageInfo, { PageInfoFromJson } from "./PageInfo.js";

/** A connection between an account and the nodes it manages. **/
type AccountToNodesConnection = {
  /** An object that holds pagination information about the objects in this connection. **/
  pageInfo: PageInfo;

  /** The total count of objects in this connection, using the current filters. It is different from the number of objects returned in the current page (in the `entities` field). **/
  count: number;

  /** The nodes for the current page of this connection. **/
  entities: LightsparkNode[];

  /** The main purpose for the selected set of nodes. It is automatically determined from the nodes that are selected in this connection and is used for optimization purposes, as well as to determine the variation of the UI that should be presented to the user. **/
  purpose?: LightsparkNodePurpose;
};

export const AccountToNodesConnectionFromJson = (
  obj: any
): AccountToNodesConnection => {
  return {
    pageInfo: PageInfoFromJson(obj["account_to_nodes_connection_page_info"]),
    count: obj["account_to_nodes_connection_count"],
    entities: obj["account_to_nodes_connection_entities"].map((e) =>
      LightsparkNodeFromJson(e)
    ),
    purpose:
      LightsparkNodePurpose[obj["account_to_nodes_connection_purpose"]] ?? null,
  } as AccountToNodesConnection;
};

export const FRAGMENT = `
fragment AccountToNodesConnectionFragment on AccountToNodesConnection {
    __typename
    account_to_nodes_connection_page_info: page_info {
        __typename
        page_info_has_next_page: has_next_page
        page_info_has_previous_page: has_previous_page
        page_info_start_cursor: start_cursor
        page_info_end_cursor: end_cursor
    }
    account_to_nodes_connection_count: count
    account_to_nodes_connection_purpose: purpose
    account_to_nodes_connection_entities: entities {
        id
    }
}`;

export default AccountToNodesConnection;
