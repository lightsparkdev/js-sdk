// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import WithdrawalMode from "./WithdrawalMode.js";

interface WithdrawalFeeEstimateInput {
  /**
   * The amount you want to withdraw from this node in Satoshis. Use the special value -1 to
   * withdrawal all funds from this node.
   **/
  amountSats: number;

  /** The strategy that should be used to withdraw the funds from this node. **/
  withdrawalMode: WithdrawalMode;
}

export const WithdrawalFeeEstimateInputFromJson = (
  obj: any,
): WithdrawalFeeEstimateInput => {
  return {
    amountSats: obj["withdrawal_fee_estimate_input_amount_sats"],
    withdrawalMode:
      WithdrawalMode[obj["withdrawal_fee_estimate_input_withdrawal_mode"]] ??
      WithdrawalMode.FUTURE_VALUE,
  } as WithdrawalFeeEstimateInput;
};
export const WithdrawalFeeEstimateInputToJson = (
  obj: WithdrawalFeeEstimateInput,
): any => {
  return {
    withdrawal_fee_estimate_input_amount_sats: obj.amountSats,
    withdrawal_fee_estimate_input_withdrawal_mode: obj.withdrawalMode,
  };
};

export default WithdrawalFeeEstimateInput;
