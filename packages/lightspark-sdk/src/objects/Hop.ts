// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query } from "@lightsparkdev/core";
import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";

/**
 * This object represents a specific node that existed on a particular payment route. You can
 * retrieve this object to get information about a node on a particular payment path and all
 * payment-relevant information for that node. *
 */
interface Hop {
  /**
   * The unique identifier of this entity across all Lightspark systems. Should be treated as an
   * opaque string.
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
  destinationId?: string | undefined;

  /** The public key of the node to which the hop is bound. **/
  publicKey?: string | undefined;

  /** The amount that is to be forwarded to the destination node. **/
  amountToForward?: CurrencyAmount | undefined;

  /** The fees to be collected by the source node for forwarding the payment over the hop. **/
  fee?: CurrencyAmount | undefined;

  /** The block height at which an unsettled HTLC is considered expired. **/
  expiryBlockHeight?: number | undefined;
}

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
export const HopToJson = (obj: Hop): any => {
  return {
    __typename: "Hop",
    hop_id: obj.id,
    hop_created_at: obj.createdAt,
    hop_updated_at: obj.updatedAt,
    hop_destination: { id: obj.destinationId } ?? undefined,
    hop_index: obj.index,
    hop_public_key: obj.publicKey,
    hop_amount_to_forward: obj.amountToForward
      ? CurrencyAmountToJson(obj.amountToForward)
      : undefined,
    hop_fee: obj.fee ? CurrencyAmountToJson(obj.fee) : undefined,
    hop_expiry_block_height: obj.expiryBlockHeight,
  };
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
