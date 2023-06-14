// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { LightsparkException, Query } from "@lightsparkdev/core";
import Account from "./Account.js";
import { BalancesFromJson } from "./Balances.js";
import Entity from "./Entity.js";
import Wallet from "./Wallet.js";
import WalletStatus from "./WalletStatus.js";

type LightsparkNodeOwner = Entity & {
  /**
   * The unique identifier of this entity across all Lightspark systems. Should be treated as an opaque
   * string.
   **/
  id: string;

  /** The date and time when the entity was first created. **/
  createdAt: string;

  /** The date and time when the entity was last updated. **/
  updatedAt: string;

  /** The typename of the object **/
  typename: string;
};

export const LightsparkNodeOwnerFromJson = (obj: any): LightsparkNodeOwner => {
  if (obj["__typename"] == "Account") {
    return new Account(
      obj["account_id"],
      obj["account_created_at"],
      obj["account_updated_at"],
      "Account",
      obj["account_name"]
    );
  }
  if (obj["__typename"] == "Wallet") {
    return new Wallet(
      obj["wallet_id"],
      obj["wallet_created_at"],
      obj["wallet_updated_at"],
      obj["wallet_third_party_identifier"],
      WalletStatus[obj["wallet_status"]] ?? WalletStatus.FUTURE_VALUE,
      "Wallet",
      obj["wallet_last_login_at"],
      !!obj["wallet_balances"]
        ? BalancesFromJson(obj["wallet_balances"])
        : undefined
    );
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface LightsparkNodeOwner corresponding to the typename=${obj["__typename"]}`
  );
};

export const FRAGMENT = `
fragment LightsparkNodeOwnerFragment on LightsparkNodeOwner {
    __typename
    ... on Account {
        __typename
        account_id: id
        account_created_at: created_at
        account_updated_at: updated_at
        account_name: name
    }
    ... on Wallet {
        __typename
        wallet_id: id
        wallet_created_at: created_at
        wallet_updated_at: updated_at
        wallet_last_login_at: last_login_at
        wallet_balances: balances {
            __typename
            balances_owned_balance: owned_balance {
                __typename
                currency_amount_original_value: original_value
                currency_amount_original_unit: original_unit
                currency_amount_preferred_currency_unit: preferred_currency_unit
                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
            }
            balances_available_to_send_balance: available_to_send_balance {
                __typename
                currency_amount_original_value: original_value
                currency_amount_original_unit: original_unit
                currency_amount_preferred_currency_unit: preferred_currency_unit
                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
            }
            balances_available_to_withdraw_balance: available_to_withdraw_balance {
                __typename
                currency_amount_original_value: original_value
                currency_amount_original_unit: original_unit
                currency_amount_preferred_currency_unit: preferred_currency_unit
                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
            }
        }
        wallet_third_party_identifier: third_party_identifier
        wallet_status: status
    }
}`;

export const getLightsparkNodeOwnerQuery = (
  id: string
): Query<LightsparkNodeOwner> => {
  return {
    queryPayload: `
query GetLightsparkNodeOwner($id: ID!) {
    entity(id: $id) {
        ... on LightsparkNodeOwner {
            ...LightsparkNodeOwnerFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => LightsparkNodeOwnerFromJson(data.entity),
  };
};

export default LightsparkNodeOwner;
