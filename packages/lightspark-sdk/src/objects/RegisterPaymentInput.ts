// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import ComplianceProvider from "./ComplianceProvider.js";
import PaymentDirection from "./PaymentDirection.js";

interface RegisterPaymentInput {
  /**
   * The compliance provider that is going to screen the node. You need to be a customer of the
   * selected provider and store the API key on the Lightspark account setting page.
   **/
  provider: ComplianceProvider;

  /**
   * The Lightspark ID of the lightning payment you want to register. It can be the id of either
   * an OutgoingPayment or an IncomingPayment.
   **/
  paymentId: string;

  /**
   * The public key of the counterparty lightning node, which would be the public key of the
   * recipient node if it is to register an outgoing payment, or the public key of the sender
   * node if it is to register an incoming payment.
   **/
  nodePubkey: string;

  /** Indicates whether this payment is an OutgoingPayment or an IncomingPayment. **/
  direction: PaymentDirection;
}

export const RegisterPaymentInputFromJson = (
  obj: any,
): RegisterPaymentInput => {
  return {
    provider:
      ComplianceProvider[obj["register_payment_input_provider"]] ??
      ComplianceProvider.FUTURE_VALUE,
    paymentId: obj["register_payment_input_payment_id"],
    nodePubkey: obj["register_payment_input_node_pubkey"],
    direction:
      PaymentDirection[obj["register_payment_input_direction"]] ??
      PaymentDirection.FUTURE_VALUE,
  } as RegisterPaymentInput;
};
export const RegisterPaymentInputToJson = (obj: RegisterPaymentInput): any => {
  return {
    register_payment_input_provider: obj.provider,
    register_payment_input_payment_id: obj.paymentId,
    register_payment_input_node_pubkey: obj.nodePubkey,
    register_payment_input_direction: obj.direction,
  };
};

export default RegisterPaymentInput;
