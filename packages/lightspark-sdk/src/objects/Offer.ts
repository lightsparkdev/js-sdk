// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query, isObject } from "@lightsparkdev/core";
import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";

/** This object represents a BOLT #12 offer (https://github.com/lightning/bolts/blob/master/12-offer-encoding.md) created by a Lightspark Node. **/
interface Offer {
  /**
   * The unique identifier of this entity across all Lightspark systems. Should be treated as an
   * opaque string.
   **/
  id: string;

  /** The date and time when the entity was first created. **/
  createdAt: string;

  /** The date and time when the entity was last updated. **/
  updatedAt: string;

  /** The details of the offer. **/
  dataId: string;

  /** The BOLT12 encoded offer. Starts with 'lno'. **/
  encodedOffer: string;

  /** The typename of the object **/
  typename: string;

  /** The amount of the offer. If null, the payer chooses the amount. **/
  amount?: CurrencyAmount | undefined;

  /** The description of the offer. **/
  description?: string | undefined;
}

export const OfferFromJson = (obj: any): Offer => {
  return {
    id: obj["offer_id"],
    createdAt: obj["offer_created_at"],
    updatedAt: obj["offer_updated_at"],
    dataId: obj["offer_data"].id,
    encodedOffer: obj["offer_encoded_offer"],
    typename: "Offer",
    amount: !!obj["offer_amount"]
      ? CurrencyAmountFromJson(obj["offer_amount"])
      : undefined,
    description: obj["offer_description"],
  } as Offer;
};
export const OfferToJson = (obj: Offer): any => {
  return {
    __typename: "Offer",
    offer_id: obj.id,
    offer_created_at: obj.createdAt,
    offer_updated_at: obj.updatedAt,
    offer_data: { id: obj.dataId },
    offer_encoded_offer: obj.encodedOffer,
    offer_amount: obj.amount ? CurrencyAmountToJson(obj.amount) : undefined,
    offer_description: obj.description,
  };
};

export const FRAGMENT = `
fragment OfferFragment on Offer {
    __typename
    offer_id: id
    offer_created_at: created_at
    offer_updated_at: updated_at
    offer_data: data {
        id
    }
    offer_encoded_offer: encoded_offer
    offer_amount: amount {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    offer_description: description
}`;

export const getOfferQuery = (id: string): Query<Offer> => {
  return {
    queryPayload: `
query GetOffer($id: ID!) {
    entity(id: $id) {
        ... on Offer {
            ...OfferFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: unknown) =>
      isObject(data) && "entity" in data && isObject(data.entity)
        ? OfferFromJson(data.entity)
        : null,
  };
};

export default Offer;
