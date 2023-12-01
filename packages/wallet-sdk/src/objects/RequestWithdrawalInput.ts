// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface RequestWithdrawalInput {
  /** The bitcoin address where the withdrawal should be sent. **/
  bitcoinAddress: string;

  /**
   * The amount you want to withdraw from this node in Satoshis. Use the special value -1 to
   * withdrawal all funds from this node.
   **/
  amountSats: number;
}

export const RequestWithdrawalInputFromJson = (
  obj: any,
): RequestWithdrawalInput => {
  return {
    bitcoinAddress: obj["request_withdrawal_input_bitcoin_address"],
    amountSats: obj["request_withdrawal_input_amount_sats"],
  } as RequestWithdrawalInput;
};
export const RequestWithdrawalInputToJson = (
  obj: RequestWithdrawalInput,
): any => {
  return {
    request_withdrawal_input_bitcoin_address: obj.bitcoinAddress,
    request_withdrawal_input_amount_sats: obj.amountSats,
  };
};

export default RequestWithdrawalInput;
