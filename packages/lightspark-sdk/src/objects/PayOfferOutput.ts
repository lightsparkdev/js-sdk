// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface PayOfferOutput {
  /** The payment that has been sent. **/
  paymentId: string;
}

export const PayOfferOutputFromJson = (obj: any): PayOfferOutput => {
  return {
    paymentId: obj["pay_offer_output_payment"].id,
  } as PayOfferOutput;
};
export const PayOfferOutputToJson = (obj: PayOfferOutput): any => {
  return {
    pay_offer_output_payment: { id: obj.paymentId },
  };
};

export const FRAGMENT = `
fragment PayOfferOutputFragment on PayOfferOutput {
    __typename
    pay_offer_output_payment: payment {
        id
    }
}`;

export default PayOfferOutput;
