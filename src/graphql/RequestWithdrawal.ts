// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as WithdrawalRequestFragment } from "../objects/WithdrawalRequest.js";

export const RequestWithdrawal = `
  mutation RequestWithdrawal(
    $node_id: ID!
    $bitcoin_address: String!
    $amount_sats: Long!
    $withdrawal_mode: WithdrawalMode!
  ) {
    request_withdrawal(input: {
      node_id: $node_id
      bitcoin_address: $bitcoin_address
      amount_sats: $amount_sats
      withdrawal_mode: $withdrawal_mode
    }) {
        request {
            ...WithdrawalRequestFragment
        }
    }
  }

  ${WithdrawalRequestFragment}
`;
