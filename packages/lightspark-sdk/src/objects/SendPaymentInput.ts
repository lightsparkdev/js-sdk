// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface SendPaymentInput {
  /** The node from where you want to send the payment. **/
  nodeId: string;

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

  /**
   * The idempotency key of the request. The same result will be returned for the same
   * idempotency key. *
   */
  idempotencyKey?: string | undefined;
}

export const SendPaymentInputFromJson = (obj: any): SendPaymentInput => {
  return {
    nodeId: obj["send_payment_input_node_id"],
    destinationPublicKey: obj["send_payment_input_destination_public_key"],
    timeoutSecs: obj["send_payment_input_timeout_secs"],
    amountMsats: obj["send_payment_input_amount_msats"],
    maximumFeesMsats: obj["send_payment_input_maximum_fees_msats"],
    idempotencyKey: obj["send_payment_input_idempotency_key"],
  } as SendPaymentInput;
};
export const SendPaymentInputToJson = (obj: SendPaymentInput): any => {
  return {
    send_payment_input_node_id: obj.nodeId,
    send_payment_input_destination_public_key: obj.destinationPublicKey,
    send_payment_input_timeout_secs: obj.timeoutSecs,
    send_payment_input_amount_msats: obj.amountMsats,
    send_payment_input_maximum_fees_msats: obj.maximumFeesMsats,
    send_payment_input_idempotency_key: obj.idempotencyKey,
  };
};

export default SendPaymentInput;
