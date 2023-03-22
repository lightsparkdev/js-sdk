// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import KeyType from "./KeyType.js";

type Key = {
  type: KeyType;

  publicKey: string;
};

export const KeyFromJson = (obj: any): Key => {
  return {
    type: KeyType[obj["key_type"]] ?? KeyType.FUTURE_VALUE,
    publicKey: obj["key_public_key"],
  } as Key;
};

export const FRAGMENT = `
fragment KeyFragment on Key {
    __typename
    key_type: type
    key_public_key: public_key
}`;

export default Key;
