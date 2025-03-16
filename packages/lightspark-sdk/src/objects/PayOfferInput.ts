// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface PayOfferInput {
  /** The ID of the node that will be sending the payment. **/
  nodeId: string;

  /** The Bech32 offer you want to pay (as defined by the BOLT12 standard). **/
  encodedOffer: string;

  /** The timeout in seconds that we will try to make the payment. **/
  timeoutSecs: number;

  /**
   * The maximum amount of fees that you want to pay for this payment to be sent, expressed in
   * msats. *
   */
  maximumFeesMsats: number;

  /**
   * The amount you will pay for this offer, expressed in msats. It should ONLY be set when the
   * offer amount is zero.
   **/
  amountMsats?: number | undefined;

  /**
   * An idempotency key for this payment. If provided, it will be used to create a payment with
   * the same idempotency key. If not provided, a new idempotency key will be generated.
   **/
  idempotencyKey?: string | undefined;
}

export const PayOfferInputFromJson = (obj: any): PayOfferInput => {
  return {
    nodeId: obj["pay_offer_input_node_id"],
    encodedOffer: obj["pay_offer_input_encoded_offer"],
    timeoutSecs: obj["pay_offer_input_timeout_secs"],
    maximumFeesMsats: obj["pay_offer_input_maximum_fees_msats"],
    amountMsats: obj["pay_offer_input_amount_msats"],
    idempotencyKey: obj["pay_offer_input_idempotency_key"],
  } as PayOfferInput;
};
export const PayOfferInputToJson = (obj: PayOfferInput): any => {
  return {
    pay_offer_input_node_id: obj.nodeId,
    pay_offer_input_encoded_offer: obj.encodedOffer,
    pay_offer_input_timeout_secs: obj.timeoutSecs,
    pay_offer_input_maximum_fees_msats: obj.maximumFeesMsats,
    pay_offer_input_amount_msats: obj.amountMsats,
    pay_offer_input_idempotency_key: obj.idempotencyKey,
  };
};

export default PayOfferInput;
