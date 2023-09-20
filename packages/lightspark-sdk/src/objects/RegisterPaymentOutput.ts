// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type RegisterPaymentOutput = {
  paymentId: string;
};

export const RegisterPaymentOutputFromJson = (
  obj: any,
): RegisterPaymentOutput => {
  return {
    paymentId: obj["register_payment_output_payment"].id,
  } as RegisterPaymentOutput;
};

export const FRAGMENT = `
fragment RegisterPaymentOutputFragment on RegisterPaymentOutput {
    __typename
    register_payment_output_payment: payment {
        id
    }
}`;

export default RegisterPaymentOutput;
