// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query } from "@lightsparkdev/core";
import type CurrencyAmount from "./CurrencyAmount.js";
import { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import type Entity from "./Entity.js";

/** This object represents a specific node that existed on a particular payment route. You can retrieve this object to get information about a node on a particular payment path and all payment-relevant information for that node. **/
type Hop = Entity & {
  /**
   * The unique identifier of this entity across all Lightspark systems. Should be treated as an opaque
   * string.
   **/
  id: string;

  /** The date and time when the entity was first created. **/
  createdAt: string;

  /** The date and time when the entity was last updated. **/
  updatedAt: string;

  /** The zero-based index position of this hop in the path **/
  index: number;

  /** The typename of the object **/
  typename: string;

  /** The destination node of the hop. **/
  destinationId?: string;

  /** The public key of the node to which the hop is bound. **/
  publicKey?: string;

  /** The amount that is to be forwarded to the destination node. **/
  amountToForward?: CurrencyAmount;

  /** The fees to be collected by the source node for forwarding the payment over the hop. **/
  fee?: CurrencyAmount;

  /** The block height at which an unsettled HTLC is considered expired. **/
  expiryBlockHeight?: number;
};

export const HopFromJson = (obj: any): Hop => {
  return {
    id: obj["hop_id"],
    createdAt: obj["hop_created_at"],
    updatedAt: obj["hop_updated_at"],
    index: obj["hop_index"],
    typename: "Hop",
    destinationId: obj["hop_destination"]?.id ?? undefined,
    publicKey: obj["hop_public_key"],
    amountToForward: !!obj["hop_amount_to_forward"]
      ? CurrencyAmountFromJson(obj["hop_amount_to_forward"])
      : undefined,
    fee: !!obj["hop_fee"] ? CurrencyAmountFromJson(obj["hop_fee"]) : undefined,
    expiryBlockHeight: obj["hop_expiry_block_height"],
  } as Hop;
};

export const FRAGMENT = `
fragment HopFragment on Hop {
    __typename
    hop_id: id
    hop_created_at: created_at
    hop_updated_at: updated_at
    hop_destination: destination {
        id
    }
    hop_index: index
    hop_public_key: public_key
    hop_amount_to_forward: amount_to_forward {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    hop_fee: fee {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    hop_expiry_block_height: expiry_block_height
}`;

export const getHopQuery = (id: string): Query<Hop> => {
  return {
    queryPayload: `
query GetHop($id: ID!) {
    entity(id: $id) {
        ... on Hop {
            ...HopFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => HopFromJson(data.entity),
  };
};

export default Hop;
