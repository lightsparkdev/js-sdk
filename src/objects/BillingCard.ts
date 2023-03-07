// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import Query from "../requester/Query.js";
import Entity from "./Entity.js";
import FinancialInstrument from "./FinancialInstrument.js";

/** Represents the display data for a card that has been added to the account for billing. **/
type BillingCard = FinancialInstrument &
  Entity & {
    /** The unique identifier of this entity across all Lightspark systems. Should be treated as an opaque string. **/
    id: string;

    /** The date and time when the entity was first created. **/
    createdAt: string;

    /** The date and time when the entity was last updated. **/
    updatedAt: string;

    /** Whether this is the primary billing payment method. **/
    isPrimary: boolean;

    /** The card's expiration month **/
    expirationMonth: number;

    /** The card's expiration year **/
    expirationYear: number;

    /** The typename of the object **/
    typename: string;

    /** Card brand, i.e. 'Visa', 'American Express', etc. **/
    brand?: string;

    /** The last 4 digits of the card. **/
    last4?: string;
  };

export const BillingCardFromJson = (obj: any): BillingCard => {
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
};

export const FRAGMENT = `
fragment BillingCardFragment on BillingCard {
    __typename
    billing_card_id: id
    billing_card_created_at: created_at
    billing_card_updated_at: updated_at
    billing_card_is_primary: is_primary
    billing_card_expiration_month: expiration_month
    billing_card_expiration_year: expiration_year
    billing_card_brand: brand
    billing_card_last4: last4
}`;

export const getBillingCardQuery = (id: string): Query<BillingCard> => {
  return {
    queryPayload: `
query GetBillingCard($id: ID!) {
    entity(id: $id) {
        ... on BillingCard {
            ...BillingCardFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => BillingCardFromJson(data.entity),
  };
};

export default BillingCard;
