// Copyright  ©, 2023, Lightspark Group, Inc. - All Rights Reserved

export type Maybe<T> = T | null | undefined;

export type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T;

export type ById<T> = {
  [id: string]: T;
};

export type OmitTypename<T> = Omit<T, "__typename">;

export const isType =
  <T extends string>(typename: T) =>
  <N extends { __typename: string }>(
    node: N | undefined | null,
  ): node is Extract<N, { __typename: T }> => {
    return node?.__typename === typename;
  };

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type JSONLiteral = string | number | boolean | null;
export type JSONType = JSONLiteral | JSONType[] | { [key: string]: JSONType };
export type JSONObject = { [key: string]: JSONType };
