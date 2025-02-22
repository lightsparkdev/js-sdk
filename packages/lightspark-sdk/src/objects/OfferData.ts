// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query, isObject } from "@lightsparkdev/core";
import BitcoinNetwork from "./BitcoinNetwork.js";
import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";

/**
 * This object represents the data associated with a BOLT #12 offer. You can retrieve this object
 * to receive the relevant data associated with a specific offer. *
 */
interface OfferData {
  /**
   * The unique identifier of this entity across all Lightspark systems. Should be treated as an
   * opaque string.
   **/
  id: string;

  /** The date and time when the entity was first created. **/
  createdAt: string;

  /** The date and time when the entity was last updated. **/
  updatedAt: string;

  /** The Bech32 encoded offer. **/
  encodedOffer: string;

  /** The bitcoin networks supported by the offer. **/
  bitcoinNetworks: BitcoinNetwork[];

  /** The typename of the object **/
  typename: string;

  /**
   * The requested amount in this invoice. If it is equal to 0, the sender should choose the
   * amount to send.
   **/
  amount?: CurrencyAmount | undefined;

  /** The date and time when this invoice will expire. **/
  expiresAt?: string | undefined;
}

export const OfferDataFromJson = (obj: any): OfferData => {
  return {
    id: obj["offer_data_id"],
    createdAt: obj["offer_data_created_at"],
    updatedAt: obj["offer_data_updated_at"],
    encodedOffer: obj["offer_data_encoded_offer"],
    bitcoinNetworks: obj["offer_data_bitcoin_networks"].map(
      (e) => BitcoinNetwork[e],
    ),
    typename: "OfferData",
    amount: !!obj["offer_data_amount"]
      ? CurrencyAmountFromJson(obj["offer_data_amount"])
      : undefined,
    expiresAt: obj["offer_data_expires_at"],
  } as OfferData;
};
export const OfferDataToJson = (obj: OfferData): any => {
  return {
    __typename: "OfferData",
    offer_data_id: obj.id,
    offer_data_created_at: obj.createdAt,
    offer_data_updated_at: obj.updatedAt,
    offer_data_amount: obj.amount
      ? CurrencyAmountToJson(obj.amount)
      : undefined,
    offer_data_encoded_offer: obj.encodedOffer,
    offer_data_bitcoin_networks: obj.bitcoinNetworks,
    offer_data_expires_at: obj.expiresAt,
  };
};

export const FRAGMENT = `
fragment OfferDataFragment on OfferData {
    __typename
    offer_data_id: id
    offer_data_created_at: created_at
    offer_data_updated_at: updated_at
    offer_data_amount: amount {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    offer_data_encoded_offer: encoded_offer
    offer_data_bitcoin_networks: bitcoin_networks
    offer_data_expires_at: expires_at
}`;

export const getOfferDataQuery = (id: string): Query<OfferData> => {
  return {
    queryPayload: `
query GetOfferData($id: ID!) {
    entity(id: $id) {
        ... on OfferData {
            ...OfferDataFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: unknown) =>
      isObject(data) && "entity" in data && isObject(data.entity)
        ? OfferDataFromJson(data.entity)
        : null,
  };
};

export default OfferData;
