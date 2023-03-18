// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

type SendPaymentOutput = {
  /** The payment that has been sent. **/
  paymentId: string;
};

export const SendPaymentOutputFromJson = (obj: any): SendPaymentOutput => {
  return {
    paymentId: obj["send_payment_output_payment"].id,
  } as SendPaymentOutput;
};

export const FRAGMENT = `
fragment SendPaymentOutputFragment on SendPaymentOutput {
    __typename
    send_payment_output_payment: payment {
        id
    }
}`;

export default SendPaymentOutput;
