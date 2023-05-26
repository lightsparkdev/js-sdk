// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type OnlyKey = {
  key: string;
  alias?: never;
};

type OnlyAlias = {
  key?: never;
  alias: string;
};

export type KeyOrAliasType = OnlyKey | OnlyAlias;

export const KeyOrAlias = {
  key: (key: string): OnlyKey => ({ key }),
  alias: (alias: string): OnlyAlias => ({ alias }),
};
