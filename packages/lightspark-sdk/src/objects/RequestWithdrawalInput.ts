// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import OnChainFeeTarget from "./OnChainFeeTarget.js";
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

  /**
   * The idempotency key of the request. The same result will be returned for the same
   * idempotency key. *
   */
  idempotencyKey?: string | undefined;

  /**
   * The target of the fee that should be used when crafting the L1 transaction. You should only
   * set `fee_target` or `sats_per_vbyte`. If neither of them is set, default value of MEDIUM
   * will be used as `fee_target`.
   **/
  feeTarget?: OnChainFeeTarget | undefined;

  /**
   * A manual fee rate set in sat/vbyte that should be used when crafting the L1 transaction. You
   * should only set `fee_target` or `sats_per_vbyte`
   **/
  satsPerVbyte?: number | undefined;
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
    idempotencyKey: obj["request_withdrawal_input_idempotency_key"],
    feeTarget: !!obj["request_withdrawal_input_fee_target"]
      ? OnChainFeeTarget[obj["request_withdrawal_input_fee_target"]] ??
        OnChainFeeTarget.FUTURE_VALUE
      : null,
    satsPerVbyte: obj["request_withdrawal_input_sats_per_vbyte"],
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
    request_withdrawal_input_idempotency_key: obj.idempotencyKey,
    request_withdrawal_input_fee_target: obj.feeTarget,
    request_withdrawal_input_sats_per_vbyte: obj.satsPerVbyte,
  };
};

export default RequestWithdrawalInput;
