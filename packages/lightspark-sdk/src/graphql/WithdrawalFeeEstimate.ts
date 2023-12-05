// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as WithdrawalFeeEstimateOutputFragment } from "../objects/WithdrawalFeeEstimateOutput.js";

export const WithdrawalFeeEstimate = `
  query WithdrawalFeeEstimate(
    $node_id: ID!
    $amount_sats: Long!
    $withdrawal_mode: WithdrawalMode!
  ) {
    withdrawal_fee_estimate(input: {
      node_id: $node_id,
      amount_sats: $amount_sats,
      withdrawal_mode: $withdrawal_mode
    }) {
      ...WithdrawalFeeEstimateOutputFragment
    }
  }

  ${WithdrawalFeeEstimateOutputFragment}
`;
