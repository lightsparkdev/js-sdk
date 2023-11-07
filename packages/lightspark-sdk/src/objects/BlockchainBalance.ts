// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";

/** This is an object representing a detailed breakdown of the balance for a Lightspark Node. **/
interface BlockchainBalance {
  /** The total wallet balance, including unconfirmed UTXOs. **/
  totalBalance?: CurrencyAmount | undefined;

  /** The balance of confirmed UTXOs in the wallet. **/
  confirmedBalance?: CurrencyAmount | undefined;

  /** The balance of unconfirmed UTXOs in the wallet. **/
  unconfirmedBalance?: CurrencyAmount | undefined;

  /** The balance that's locked by an on-chain transaction. **/
  lockedBalance?: CurrencyAmount | undefined;

  /** Funds required to be held in reserve for channel bumping. **/
  requiredReserve?: CurrencyAmount | undefined;

  /** Funds available for creating channels or withdrawing. **/
  availableBalance?: CurrencyAmount | undefined;
}

export const BlockchainBalanceFromJson = (obj: any): BlockchainBalance => {
  return {
    totalBalance: !!obj["blockchain_balance_total_balance"]
      ? CurrencyAmountFromJson(obj["blockchain_balance_total_balance"])
      : undefined,
    confirmedBalance: !!obj["blockchain_balance_confirmed_balance"]
      ? CurrencyAmountFromJson(obj["blockchain_balance_confirmed_balance"])
      : undefined,
    unconfirmedBalance: !!obj["blockchain_balance_unconfirmed_balance"]
      ? CurrencyAmountFromJson(obj["blockchain_balance_unconfirmed_balance"])
      : undefined,
    lockedBalance: !!obj["blockchain_balance_locked_balance"]
      ? CurrencyAmountFromJson(obj["blockchain_balance_locked_balance"])
      : undefined,
    requiredReserve: !!obj["blockchain_balance_required_reserve"]
      ? CurrencyAmountFromJson(obj["blockchain_balance_required_reserve"])
      : undefined,
    availableBalance: !!obj["blockchain_balance_available_balance"]
      ? CurrencyAmountFromJson(obj["blockchain_balance_available_balance"])
      : undefined,
  } as BlockchainBalance;
};
export const BlockchainBalanceToJson = (obj: BlockchainBalance): any => {
  return {
    blockchain_balance_total_balance: obj.totalBalance
      ? CurrencyAmountToJson(obj.totalBalance)
      : undefined,
    blockchain_balance_confirmed_balance: obj.confirmedBalance
      ? CurrencyAmountToJson(obj.confirmedBalance)
      : undefined,
    blockchain_balance_unconfirmed_balance: obj.unconfirmedBalance
      ? CurrencyAmountToJson(obj.unconfirmedBalance)
      : undefined,
    blockchain_balance_locked_balance: obj.lockedBalance
      ? CurrencyAmountToJson(obj.lockedBalance)
      : undefined,
    blockchain_balance_required_reserve: obj.requiredReserve
      ? CurrencyAmountToJson(obj.requiredReserve)
      : undefined,
    blockchain_balance_available_balance: obj.availableBalance
      ? CurrencyAmountToJson(obj.availableBalance)
      : undefined,
  };
};

export const FRAGMENT = `
fragment BlockchainBalanceFragment on BlockchainBalance {
    __typename
    blockchain_balance_total_balance: total_balance {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    blockchain_balance_confirmed_balance: confirmed_balance {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    blockchain_balance_unconfirmed_balance: unconfirmed_balance {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    blockchain_balance_locked_balance: locked_balance {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    blockchain_balance_required_reserve: required_reserve {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    blockchain_balance_available_balance: available_balance {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
}`;

export default BlockchainBalance;
