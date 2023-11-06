// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface RegisterPaymentOutput {
  paymentId: string;
}

export const RegisterPaymentOutputFromJson = (
  obj: any,
): RegisterPaymentOutput => {
  return {
    paymentId: obj["register_payment_output_payment"].id,
  } as RegisterPaymentOutput;
};
export const RegisterPaymentOutputToJson = (
  obj: RegisterPaymentOutput,
): any => {
  return {
    register_payment_output_payment: { id: obj.paymentId },
  };
};

export const FRAGMENT = `
fragment RegisterPaymentOutputFragment on RegisterPaymentOutput {
    __typename
    register_payment_output_payment: payment {
        id
    }
}`;

export default RegisterPaymentOutput;
