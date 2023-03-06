// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import Query from "../requester/Query.js";
import CurrencyAmount, { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import Entity from "./Entity.js";

/** One hop signifies a payment moving one node ahead on a payment route; a list of sequential hops defines the path from sender node to recipient node for a payment attempt. **/
type Hop = Entity & {
  /** The unique identifier of this entity across all Lightspark systems. Should be treated as an opaque string. **/
  id: string;

  /** The date and time when the entity was first created. **/
  createdAt: string;

  /** The date and time when the entity was last updated. **/
  updatedAt: string;

  /** The zero-based index position of this hop in the path **/
  index: number;

  /** The channel's short ID, which is the location in the chain that the channel was confirmed. The format is <block-height>:<tx-index>:<tx-output>. **/
  shortChannelId: string;

  /** The typename of the object **/
  typename: string;

  /** The destination node of the hop. **/
  destinationId?: string;

  /** The public key of the node to which the hop is bound. **/
  pubKey?: string;

  /** The amount that is to be forwarded to the destination node. **/
  amountToForward?: CurrencyAmount;

  /** The fees to be collected by the source node for forwarding the payment over the hop. **/
  fee?: CurrencyAmount;

  /** The block height at which an unsettled HTLC is considered expired. **/
  expiry?: number;
};

export const HopFromJson = (obj: any): Hop => {
  return {
    id: obj["hop_id"],
    createdAt: obj["hop_created_at"],
    updatedAt: obj["hop_updated_at"],
    index: obj["hop_index"],
    shortChannelId: obj["hop_short_channel_id"],
    typename: "Hop",
    destinationId: obj["hop_destination"]?.id ?? undefined,
    pubKey: obj["hop_pub_key"],
    amountToForward: !!obj["hop_amount_to_forward"]
      ? CurrencyAmountFromJson(obj["hop_amount_to_forward"])
      : undefined,
    fee: !!obj["hop_fee"] ? CurrencyAmountFromJson(obj["hop_fee"]) : undefined,
    expiry: obj["hop_expiry"],
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
    hop_short_channel_id: short_channel_id
    hop_pub_key: pub_key
    hop_amount_to_forward: amount_to_forward {
        __typename
        currency_amount_value: value
        currency_amount_unit: unit
    }
    hop_fee: fee {
        __typename
        currency_amount_value: value
        currency_amount_unit: unit
    }
    hop_expiry: expiry
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
