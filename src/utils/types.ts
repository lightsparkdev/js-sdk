// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

export type Maybe<T> = T | null | undefined;

export type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> } // eslint-disable-line @typescript-eslint/no-unused-vars
    : never
  : T;

export type ById<T> = {
  [id: string]: T;
};

export type OmitTypename<T> = Omit<T, "__typename">;

export const isType =
  <T extends string>(typename: T) =>
  <N extends { __typename: string }>(
    node: N | undefined | null
  ): node is Extract<N, { __typename: T }> => {
    return node?.__typename === typename;
  };

type StripPrefix<
  TPrefix extends string,
  T extends string
> = T extends `${TPrefix}${infer R}` ? R : T;

export type MapKeysStripPrefix<T, TPrefix extends string> = {
  [K in keyof T & string as StripPrefix<TPrefix, K>]: T[K];
};

export const stripPrefix = <T, TPrefix extends string>(object: T, prefix: TPrefix): MapKeysStripPrefix<T, TPrefix> => {
  const result: any = {};
  for (const key in object) {
    if (key.startsWith(prefix)) {
      result[key.substring(prefix.length)] = object[key];
    } else {
      result[key] = object[key];
    }
  }
  return result;
}

