// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import CurrencyAmount, { CurrencyAmountFromJson } from "./CurrencyAmount.js";

/** This object provides a detailed breakdown of a `LightsparkNode`'s current balance on the Bitcoin Network. **/
type BlockchainBalance = {
  /** The total wallet balance, including unconfirmed UTXOs. **/
  totalBalance?: CurrencyAmount;

  /** The balance of confirmed UTXOs in the wallet. **/
  confirmedBalance?: CurrencyAmount;

  /** The balance of unconfirmed UTXOs in the wallet. **/
  unconfirmedBalance?: CurrencyAmount;

  /** The balance that's locked by an on-chain transaction. **/
  lockedBalance?: CurrencyAmount;

  /** Funds required to be held in reserve for channel bumping. **/
  requiredReserve?: CurrencyAmount;

  /** Funds available for creating channels or withdrawing. **/
  availableBalance?: CurrencyAmount;
};

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

export const FRAGMENT = `
fragment BlockchainBalanceFragment on BlockchainBalance {
    __typename
    blockchain_balance_total_balance: total_balance {
        __typename
        currency_amount_value: value
        currency_amount_unit: unit
    }
    blockchain_balance_confirmed_balance: confirmed_balance {
        __typename
        currency_amount_value: value
        currency_amount_unit: unit
    }
    blockchain_balance_unconfirmed_balance: unconfirmed_balance {
        __typename
        currency_amount_value: value
        currency_amount_unit: unit
    }
    blockchain_balance_locked_balance: locked_balance {
        __typename
        currency_amount_value: value
        currency_amount_unit: unit
    }
    blockchain_balance_required_reserve: required_reserve {
        __typename
        currency_amount_value: value
        currency_amount_unit: unit
    }
    blockchain_balance_available_balance: available_balance {
        __typename
        currency_amount_value: value
        currency_amount_unit: unit
    }
}`;

export default BlockchainBalance;
