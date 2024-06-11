// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type Withdrawal from "./Withdrawal.js";
import { WithdrawalFromJson, WithdrawalToJson } from "./Withdrawal.js";

interface WithdrawalRequestToWithdrawalsConnection {
  /**
   * The total count of objects in this connection, using the current filters. It is different
   * from the number of objects returned in the current page (in the `entities` field).
   **/
  count: number;

  /** The withdrawals for the current page of this connection. **/
  entities: Withdrawal[];
}

export const WithdrawalRequestToWithdrawalsConnectionFromJson = (
  obj: any,
): WithdrawalRequestToWithdrawalsConnection => {
  return {
    count: obj["withdrawal_request_to_withdrawals_connection_count"],
    entities: obj["withdrawal_request_to_withdrawals_connection_entities"].map(
      (e) => WithdrawalFromJson(e),
    ),
  } as WithdrawalRequestToWithdrawalsConnection;
};
export const WithdrawalRequestToWithdrawalsConnectionToJson = (
  obj: WithdrawalRequestToWithdrawalsConnection,
): any => {
  return {
    withdrawal_request_to_withdrawals_connection_count: obj.count,
    withdrawal_request_to_withdrawals_connection_entities: obj.entities.map(
      (e) => WithdrawalToJson(e),
    ),
  };
};

export const FRAGMENT = `
fragment WithdrawalRequestToWithdrawalsConnectionFragment on WithdrawalRequestToWithdrawalsConnection {
    __typename
    withdrawal_request_to_withdrawals_connection_count: count
    withdrawal_request_to_withdrawals_connection_entities: entities {
        id
    }
}`;

export default WithdrawalRequestToWithdrawalsConnection;
