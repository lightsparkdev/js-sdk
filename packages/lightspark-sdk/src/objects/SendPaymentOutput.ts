// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface SendPaymentOutput {
  /** The payment that has been sent. **/
  paymentId: string;
}

export const SendPaymentOutputFromJson = (obj: any): SendPaymentOutput => {
  return {
    paymentId: obj["send_payment_output_payment"].id,
  } as SendPaymentOutput;
};
export const SendPaymentOutputToJson = (obj: SendPaymentOutput): any => {
  return {
    send_payment_output_payment: { id: obj.paymentId },
  };
};

export const FRAGMENT = `
fragment SendPaymentOutputFragment on SendPaymentOutput {
    __typename
    send_payment_output_payment: payment {
        id
    }
}`;

export default SendPaymentOutput;
