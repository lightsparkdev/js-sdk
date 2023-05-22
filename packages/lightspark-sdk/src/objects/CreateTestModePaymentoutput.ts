// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type CreateTestModePaymentoutput = {
  /** The payment that has been sent. **/
  paymentId: string;
};

export const CreateTestModePaymentoutputFromJson = (
  obj: any
): CreateTestModePaymentoutput => {
  return {
    paymentId: obj["create_test_mode_paymentoutput_payment"].id,
  } as CreateTestModePaymentoutput;
};

export const FRAGMENT = `
fragment CreateTestModePaymentoutputFragment on CreateTestModePaymentoutput {
    __typename
    create_test_mode_paymentoutput_payment: payment {
        id
    }
}`;

export default CreateTestModePaymentoutput;
