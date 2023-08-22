// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import autoBind from "auto-bind";
import Channel, { ChannelFromJson } from "./Channel.js";

class AccountToChannelsConnection {
  constructor(
    public readonly count: number,
    public readonly entities: Channel[],
  ) {
    autoBind(this);
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
