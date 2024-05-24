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

export type NN<T> = NonNullable<T>;

export function notNullUndefined<TValue>(
  value: TValue | null | undefined,
): value is TValue {
  return value !== null && value !== undefined;
}

/* Make specific properties on object optional: */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/* Opposite of Partial - make all keys required with NonNullable values */
export type Complete<T> = { [P in keyof T]-?: NonNullable<T[P]> };
