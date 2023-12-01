// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import autoBind from "auto-bind";
import type Channel from "./Channel.js";
import { ChannelFromJson } from "./Channel.js";

class AccountToChannelsConnection {
  constructor(
    /**
     * The total count of objects in this connection, using the current filters. It is different
     * from the number of objects returned in the current page (in the `entities` field).
     **/
    public readonly count: number,
    /** The channels for the current page of this connection. **/
    public readonly entities: Channel[],
  ) {
    autoBind(this);
  }

  public toJson() {
    return {
      account_to_channels_connection_count: this.count,
      account_to_channels_connection_entities: this.entities.map((e) =>
        e.toJson(),
      ),
    };
  }
}

export const AccountToChannelsConnectionFromJson = (
  obj: any,
): AccountToChannelsConnection => {
  return new AccountToChannelsConnection(
    obj["account_to_channels_connection_count"],
    obj["account_to_channels_connection_entities"].map((e) =>
      ChannelFromJson(e),
    ),
  );
};

export const FRAGMENT = `
fragment AccountToChannelsConnectionFragment on AccountToChannelsConnection {
    __typename
    account_to_channels_connection_count: count
    account_to_channels_connection_entities: entities {
        id
    }
}`;

export default AccountToChannelsConnection;
