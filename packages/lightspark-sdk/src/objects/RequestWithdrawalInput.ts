// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import WithdrawalMode from "./WithdrawalMode.js";

interface RequestWithdrawalInput {
  /** The node from which you'd like to make the withdrawal. **/
  nodeId: string;

  /** The bitcoin address where the withdrawal should be sent. **/
  bitcoinAddress: string;

  /**
   * The amount you want to withdraw from this node in Satoshis. Use the special value -1 to
   * withdrawal all funds from this node.
   **/
  amountSats: number;

  /** The strategy that should be used to withdraw the funds from this node. **/
  withdrawalMode: WithdrawalMode;
}

export const RequestWithdrawalInputFromJson = (
  obj: any,
): RequestWithdrawalInput => {
  return {
    nodeId: obj["request_withdrawal_input_node_id"],
    bitcoinAddress: obj["request_withdrawal_input_bitcoin_address"],
    amountSats: obj["request_withdrawal_input_amount_sats"],
    withdrawalMode:
      WithdrawalMode[obj["request_withdrawal_input_withdrawal_mode"]] ??
      WithdrawalMode.FUTURE_VALUE,
  } as RequestWithdrawalInput;
};
export const RequestWithdrawalInputToJson = (
  obj: RequestWithdrawalInput,
): any => {
  return {
    request_withdrawal_input_node_id: obj.nodeId,
    request_withdrawal_input_bitcoin_address: obj.bitcoinAddress,
    request_withdrawal_input_amount_sats: obj.amountSats,
    request_withdrawal_input_withdrawal_mode: obj.withdrawalMode,
  };
};

export default RequestWithdrawalInput;
