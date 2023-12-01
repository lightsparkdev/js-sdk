// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";

/**
 * This is an object representing the balance associated with your Lightspark account. You can
 * retrieve this object to see your balance, which can be broken down into several different
 * categorizations. *
 */
interface Balances {
  /**
   * This represents the balance that should be displayed when asked "how much do I own right
   * now?". It represents the amount currently owned, including things that may not be owned soon
   * (e.g. in-flight outgoing payments, in-flight withdrawals, commit fees, etc.). It really is a
   * snapshot of what is officially owned at this instant.
   **/
  ownedBalance: CurrencyAmount;

  /**
   * This represents the balance that should be displayed when asked "how much can I send on
   * Lightning right now?". It represents the amount currently available to be sent on the
   * Lightning network. We remove from the balance all the funds that are temporarily locked
   * (e.g. channel reserves).
   **/
  availableToSendBalance: CurrencyAmount;

  /**
   * This represents the balance that should be displayed when asked "how much money can I
   * withdraw on the Bitcoin network right now?". It represents the amount currently available to
   * withdraw and is usually equal to the `owned_balance` but it does not include in-flight
   * operations (which would likely succeed and therefore likely make your withdrawal fail).
   **/
  availableToWithdrawBalance: CurrencyAmount;
}

export const BalancesFromJson = (obj: any): Balances => {
  return {
    ownedBalance: CurrencyAmountFromJson(obj["balances_owned_balance"]),
    availableToSendBalance: CurrencyAmountFromJson(
      obj["balances_available_to_send_balance"],
    ),
    availableToWithdrawBalance: CurrencyAmountFromJson(
      obj["balances_available_to_withdraw_balance"],
    ),
  } as Balances;
};
export const BalancesToJson = (obj: Balances): any => {
  return {
    balances_owned_balance: CurrencyAmountToJson(obj.ownedBalance),
    balances_available_to_send_balance: CurrencyAmountToJson(
      obj.availableToSendBalance,
    ),
    balances_available_to_withdraw_balance: CurrencyAmountToJson(
      obj.availableToWithdrawBalance,
    ),
  };
};

export const FRAGMENT = `
fragment BalancesFragment on Balances {
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
}`;

export default Balances;
