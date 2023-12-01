// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query } from "@lightsparkdev/core";
import type CurrencyAmount from "./CurrencyAmount.js";
import {
  CurrencyAmountFromJson,
  CurrencyAmountToJson,
} from "./CurrencyAmount.js";
import WithdrawalRequestStatus from "./WithdrawalRequestStatus.js";

/**
 * This object represents a request made for an L1 withdrawal from your Lightspark Node to any
 * Bitcoin wallet. You can retrieve this object to receive detailed information about any
 * withdrawal request made from your Lightspark account. *
 */
interface WithdrawalRequest {
  /**
   * The unique identifier of this entity across all Lightspark systems. Should be treated as an
   * opaque string.
   **/
  id: string;

  /** The date and time when the entity was first created. **/
  createdAt: string;

  /** The date and time when the entity was last updated. **/
  updatedAt: string;

  /**
   * The requested amount of money to be withdrawn. If the requested amount is -1, it means to
   * withdraw all.
   **/
  requestedAmount: CurrencyAmount;

  /**
   * The amount of money that should be withdrawn in this request.
   *
   * @deprecated Use `requested_amount` instead
   **/
  amount: CurrencyAmount;

  /** The bitcoin address where the funds should be sent. **/
  bitcoinAddress: string;

  /** The current status of this withdrawal request. **/
  status: WithdrawalRequestStatus;

  /** The typename of the object **/
  typename: string;

  /**
   * If the requested amount is `-1` (i.e. everything), this field may contain an estimate of the
   * amount for the withdrawal.
   **/
  estimatedAmount?: CurrencyAmount | undefined;

  /** The actual amount that is withdrawn. It will be set once the request is completed. **/
  amountWithdrawn?: CurrencyAmount | undefined;

  /** The time at which this request was completed. **/
  completedAt?: string | undefined;

  /** The withdrawal transaction that has been generated by this request. **/
  withdrawalId?: string | undefined;
}

export const WithdrawalRequestFromJson = (obj: any): WithdrawalRequest => {
  return {
    id: obj["withdrawal_request_id"],
    createdAt: obj["withdrawal_request_created_at"],
    updatedAt: obj["withdrawal_request_updated_at"],
    requestedAmount: CurrencyAmountFromJson(
      obj["withdrawal_request_requested_amount"],
    ),
    amount: CurrencyAmountFromJson(obj["withdrawal_request_amount"]),
    bitcoinAddress: obj["withdrawal_request_bitcoin_address"],
    status:
      WithdrawalRequestStatus[obj["withdrawal_request_status"]] ??
      WithdrawalRequestStatus.FUTURE_VALUE,
    typename: "WithdrawalRequest",
    estimatedAmount: !!obj["withdrawal_request_estimated_amount"]
      ? CurrencyAmountFromJson(obj["withdrawal_request_estimated_amount"])
      : undefined,
    amountWithdrawn: !!obj["withdrawal_request_amount_withdrawn"]
      ? CurrencyAmountFromJson(obj["withdrawal_request_amount_withdrawn"])
      : undefined,
    completedAt: obj["withdrawal_request_completed_at"],
    withdrawalId: obj["withdrawal_request_withdrawal"]?.id ?? undefined,
  } as WithdrawalRequest;
};
export const WithdrawalRequestToJson = (obj: WithdrawalRequest): any => {
  return {
    __typename: "WithdrawalRequest",
    withdrawal_request_id: obj.id,
    withdrawal_request_created_at: obj.createdAt,
    withdrawal_request_updated_at: obj.updatedAt,
    withdrawal_request_requested_amount: CurrencyAmountToJson(
      obj.requestedAmount,
    ),
    withdrawal_request_amount: CurrencyAmountToJson(obj.amount),
    withdrawal_request_estimated_amount: obj.estimatedAmount
      ? CurrencyAmountToJson(obj.estimatedAmount)
      : undefined,
    withdrawal_request_amount_withdrawn: obj.amountWithdrawn
      ? CurrencyAmountToJson(obj.amountWithdrawn)
      : undefined,
    withdrawal_request_bitcoin_address: obj.bitcoinAddress,
    withdrawal_request_status: obj.status,
    withdrawal_request_completed_at: obj.completedAt,
    withdrawal_request_withdrawal: { id: obj.withdrawalId } ?? undefined,
  };
};

export const FRAGMENT = `
fragment WithdrawalRequestFragment on WithdrawalRequest {
    __typename
    withdrawal_request_id: id
    withdrawal_request_created_at: created_at
    withdrawal_request_updated_at: updated_at
    withdrawal_request_requested_amount: requested_amount {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    withdrawal_request_amount: amount {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    withdrawal_request_estimated_amount: estimated_amount {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    withdrawal_request_amount_withdrawn: amount_withdrawn {
        __typename
        currency_amount_original_value: original_value
        currency_amount_original_unit: original_unit
        currency_amount_preferred_currency_unit: preferred_currency_unit
        currency_amount_preferred_currency_value_rounded: preferred_currency_value_rounded
        currency_amount_preferred_currency_value_approx: preferred_currency_value_approx
    }
    withdrawal_request_bitcoin_address: bitcoin_address
    withdrawal_request_status: status
    withdrawal_request_completed_at: completed_at
    withdrawal_request_withdrawal: withdrawal {
        id
    }
}`;

export const getWithdrawalRequestQuery = (
  id: string,
): Query<WithdrawalRequest> => {
  return {
    queryPayload: `
query GetWithdrawalRequest($id: ID!) {
    entity(id: $id) {
        ... on WithdrawalRequest {
            ...WithdrawalRequestFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => WithdrawalRequestFromJson(data.entity),
  };
};

export default WithdrawalRequest;
