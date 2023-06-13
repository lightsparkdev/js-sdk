// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { Query } from "@lightsparkdev/core";
import autoBind from "auto-bind";
import LightsparkClient from "../client.js";
import Balances, { BalancesFromJson } from "./Balances.js";
import CurrencyAmount, { CurrencyAmountFromJson } from "./CurrencyAmount.js";
import LightsparkNodeOwner from "./LightsparkNodeOwner.js";
import WalletStatus from "./WalletStatus.js";

class Wallet implements LightsparkNodeOwner {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly thirdPartyIdentifier: string,
    public readonly status: WalletStatus,
    public readonly typename: string,
    public readonly lastLoginAt?: string,
    public readonly balances?: Balances
  ) {
    autoBind(this);
  }

  public async getTotalAmountReceived(
    client: LightsparkClient,
    createdAfterDate: string | undefined = undefined,
    createdBeforeDate: string | undefined = undefined
  ): Promise<CurrencyAmount> {
    return (await client.executeRawQuery({
      queryPayload: ` 
query FetchWalletTotalAmountReceived($created_after_date: DateTime, $created_before_date: DateTime) {
    current_wallet {
        ... on Wallet {
            total_amount_received(, created_after_date: $created_after_date, created_before_date: $created_before_date) {
                __typename
                currency_amount_original_value: original_value
                currency_amount_original_unit: original_unit
                currency_amount_preferred_currency_unit: preferred_currency_unit
                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
            }
        }
    }
}
`,
      variables: {
        created_after_date: createdAfterDate,
        created_before_date: createdBeforeDate,
      },
      constructObject: (json) => {
        const connection = json["current_wallet"]["total_amount_received"];
        return CurrencyAmountFromJson(connection);
      },
    }))!;
  }

  public async getTotalAmountSent(
    client: LightsparkClient,
    createdAfterDate: string | undefined = undefined,
    createdBeforeDate: string | undefined = undefined
  ): Promise<CurrencyAmount> {
    return (await client.executeRawQuery({
      queryPayload: ` 
query FetchWalletTotalAmountSent($created_after_date: DateTime, $created_before_date: DateTime) {
    current_wallet {
        ... on Wallet {
            total_amount_sent(, created_after_date: $created_after_date, created_before_date: $created_before_date) {
                __typename
                currency_amount_original_value: original_value
                currency_amount_original_unit: original_unit
                currency_amount_preferred_currency_unit: preferred_currency_unit
                currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
                currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
            }
        }
    }
}
`,
      variables: {
        created_after_date: createdAfterDate,
        created_before_date: createdBeforeDate,
      },
      constructObject: (json) => {
        const connection = json["current_wallet"]["total_amount_sent"];
        return CurrencyAmountFromJson(connection);
      },
    }))!;
  }

  static getWalletQuery(id: string): Query<Wallet> {
    return {
      queryPayload: `
query GetWallet($id: ID!) {
    entity(id: $id) {
        ... on Wallet {
            ...WalletFragment
        }
    }
}

${FRAGMENT}    
`,
      variables: { id },
      constructObject: (data: any) => WalletFromJson(data.entity),
    };
  }
}

export const WalletFromJson = (obj: any): Wallet => {
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
};

export const FRAGMENT = `
fragment WalletFragment on Wallet {
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
}`;

export default Wallet;
