// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface SendPaymentInput {
  /** The public key of the destination node. **/
  destinationPublicKey: string;

  /** The timeout in seconds that we will try to make the payment. **/
  timeoutSecs: number;

  /** The amount you will send to the destination node, expressed in msats. **/
  amountMsats: number;

  /**
   * The maximum amount of fees that you want to pay for this payment to be sent, expressed in
   * msats. *
   */
  maximumFeesMsats: number;
}

export const SendPaymentInputFromJson = (obj: any): SendPaymentInput => {
  return {
    destinationPublicKey: obj["send_payment_input_destination_public_key"],
    timeoutSecs: obj["send_payment_input_timeout_secs"],
    amountMsats: obj["send_payment_input_amount_msats"],
    maximumFeesMsats: obj["send_payment_input_maximum_fees_msats"],
  } as SendPaymentInput;
};
export const SendPaymentInputToJson = (obj: SendPaymentInput): any => {
  return {
    send_payment_input_destination_public_key: obj.destinationPublicKey,
    send_payment_input_timeout_secs: obj.timeoutSecs,
    send_payment_input_amount_msats: obj.amountMsats,
    send_payment_input_maximum_fees_msats: obj.maximumFeesMsats,
  };
};

export default SendPaymentInput;
