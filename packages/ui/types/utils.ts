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
    node: N | undefined | null,
  ): node is Extract<N, { __typename: T }> => {
    return node?.__typename === typename;
  };

export function notNullUndefined<TValue>(
  value: TValue | null | undefined,
): value is TValue {
  return value !== null && value !== undefined;
}
