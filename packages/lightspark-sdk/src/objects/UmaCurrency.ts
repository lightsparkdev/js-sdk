// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query, isObject } from "@lightsparkdev/core";

interface UmaCurrency {
  /**
   * The unique identifier of this entity across all Lightspark systems. Should be treated as an
   * opaque string.
   **/
  id: string;

  /** The date and time when the entity was first created. **/
  createdAt: string;

  /** The date and time when the entity was last updated. **/
  updatedAt: string;

  /** The currency code of currency. E.g. USD. **/
  code: string;

  /** The symbol of currency. E.g. $. **/
  symbol: string;

  /** The full name of currency. E.g. US Dollar. **/
  name: string;

  /**
   * The number of digits after the decimal point for display on the sender side, and to add
   * clarity around what the `smallest unit` of the currency is. For example, in USD, by
   * convention, there are 2 digits for cents - $5.95. In this case, `decimals` would be 2. Note
   * that the multiplier is still always in the smallest unit (cents). In addition to display
   * purposes, this field can be used to resolve ambiguity in what the multiplier means. For
   * example, if the currency is `BTC` and the multiplier is 1000, really we're exchanging in
   * SATs, so `decimals` would be 8.
   **/
  decimals: number;

  /** The typename of the object **/
  typename: string;
}

export const UmaCurrencyFromJson = (obj: any): UmaCurrency => {
  return {
    id: obj["uma_currency_id"],
    createdAt: obj["uma_currency_created_at"],
    updatedAt: obj["uma_currency_updated_at"],
    code: obj["uma_currency_code"],
    symbol: obj["uma_currency_symbol"],
    name: obj["uma_currency_name"],
    decimals: obj["uma_currency_decimals"],
    typename: "UmaCurrency",
  } as UmaCurrency;
};
export const UmaCurrencyToJson = (obj: UmaCurrency): any => {
  return {
    __typename: "UmaCurrency",
    uma_currency_id: obj.id,
    uma_currency_created_at: obj.createdAt,
    uma_currency_updated_at: obj.updatedAt,
    uma_currency_code: obj.code,
    uma_currency_symbol: obj.symbol,
    uma_currency_name: obj.name,
    uma_currency_decimals: obj.decimals,
  };
};

export const FRAGMENT = `
fragment UmaCurrencyFragment on UmaCurrency {
    __typename
    uma_currency_id: id
    uma_currency_created_at: created_at
    uma_currency_updated_at: updated_at
    uma_currency_code: code
    uma_currency_symbol: symbol
    uma_currency_name: name
    uma_currency_decimals: decimals
}`;

export const getUmaCurrencyQuery = (id: string): Query<UmaCurrency> => {
  return {
    queryPayload: `
query GetUmaCurrency($id: ID!) {
    entity(id: $id) {
        ... on UmaCurrency {
            ...UmaCurrencyFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: unknown) =>
      isObject(data) && "entity" in data && isObject(data.entity)
        ? UmaCurrencyFromJson(data.entity)
        : null,
  };
};

export default UmaCurrency;
