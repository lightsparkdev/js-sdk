// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import ComplianceProvider from "./ComplianceProvider.js";
import PaymentDirection from "./PaymentDirection.js";

type RegisterPaymentInput = {
  provider: ComplianceProvider;

  paymentId: string;

  nodePubkey: string;

  direction: PaymentDirection;
};

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

export default RegisterPaymentInput;
