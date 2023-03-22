// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as WithdrawalRequestFragment } from "../objects/WithdrawalRequest.js";

export const RequestWithdrawal = `
  mutation RequestWithdrawal(
    $amount_sats: Int!
    $bitcoin_address: String!
    $withdrawal_mode: WithdrawalMode!
  ) {
    request_withdrawal(input: {
        amount_sats: $amount_sats
        bitcoin_address: $bitcoin_address
        withdrawal_mode: $withdrawal_mode
    }) {
        request {
            ...WithdrawalRequestFragment
        }
    }
  }

  ${WithdrawalRequestFragment}
`;
