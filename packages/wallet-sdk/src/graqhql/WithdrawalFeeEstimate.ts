// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as WithdrawalFeeEstimateOutputFragment } from "../objects/WithdrawalFeeEstimateOutput.js";

export const WithdrawalFeeEstimate = `
  query WithdrawalFeeEstimate(
    $amount_sats: Long!
    $withdrawal_mode: WithdrawalMode!
  ) {
    withdrawal_fee_estimate(input: {
      amount_sats: $amount_sats,
      withdrawal_mode: $withdrawal_mode
    }) {
      ...WithdrawalFeeEstimateOutputFragment
    }
  }

  ${WithdrawalFeeEstimateOutputFragment}
`;
