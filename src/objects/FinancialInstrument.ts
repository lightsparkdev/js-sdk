// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import Query from "../requester/Query.js";
import BillingCard from "./BillingCard.js";
import Entity from "./Entity.js";

type FinancialInstrument = Entity & {
  /** The unique identifier of this entity across all Lightspark systems. Should be treated as an opaque string. **/
  id: string;

  /** The date and time when the entity was first created. **/
  createdAt: string;

  /** The date and time when the entity was last updated. **/
  updatedAt: string;

  /** Whether this is the primary billing payment method. **/
  isPrimary: boolean;

  /** The typename of the object **/
  typename: string;
};

export const FinancialInstrumentFromJson = (obj: any): FinancialInstrument => {
  if (obj["__typename"] == "BillingCard") {
    return {
      id: obj["billing_card_id"],
      createdAt: obj["billing_card_created_at"],
      updatedAt: obj["billing_card_updated_at"],
      isPrimary: obj["billing_card_is_primary"],
      expirationMonth: obj["billing_card_expiration_month"],
      expirationYear: obj["billing_card_expiration_year"],
      typename: "BillingCard",
      brand: obj["billing_card_brand"],
      last4: obj["billing_card_last4"],
    } as BillingCard;
  }
  throw new Error(
    `Couldn't find a concrete type for interface FinancialInstrument corresponding to the typename=${obj["__typename"]}`
  );
};

export const FRAGMENT = `
fragment FinancialInstrumentFragment on FinancialInstrument {
    __typename
    ... on BillingCard {
        __typename
        billing_card_id: id
        billing_card_created_at: created_at
        billing_card_updated_at: updated_at
        billing_card_is_primary: is_primary
        billing_card_expiration_month: expiration_month
        billing_card_expiration_year: expiration_year
        billing_card_brand: brand
        billing_card_last4: last4
    }
}`;

export const getFinancialInstrumentQuery = (
  id: string
): Query<FinancialInstrument> => {
  return {
    queryPayload: `
query GetFinancialInstrument($id: ID!) {
    entity(id: $id) {
        ... on FinancialInstrument {
            ...FinancialInstrumentFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => FinancialInstrumentFromJson(data.entity),
  };
};

export default FinancialInstrument;
