// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

/**
 * This is an object identifying the output of a test mode payment. This object can be used to
 * retrieve the associated payment made from a Test Mode Payment call. *
 */
interface CreateTestModePaymentoutput {
  /**
   * The payment that has been sent.
   *
   * @deprecated Use incoming_payment instead.
   **/
  paymentId: string;

  /** The payment that has been received. **/
  incomingPaymentId: string;
}

export const CreateTestModePaymentoutputFromJson = (
  obj: any,
): CreateTestModePaymentoutput => {
  return {
    paymentId: obj["create_test_mode_paymentoutput_payment"].id,
    incomingPaymentId:
      obj["create_test_mode_paymentoutput_incoming_payment"].id,
  } as CreateTestModePaymentoutput;
};
export const CreateTestModePaymentoutputToJson = (
  obj: CreateTestModePaymentoutput,
): any => {
  return {
    create_test_mode_paymentoutput_payment: { id: obj.paymentId },
    create_test_mode_paymentoutput_incoming_payment: {
      id: obj.incomingPaymentId,
    },
  };
};

export const FRAGMENT = `
fragment CreateTestModePaymentoutputFragment on CreateTestModePaymentoutput {
    __typename
    create_test_mode_paymentoutput_payment: payment {
        id
    }
    create_test_mode_paymentoutput_incoming_payment: incoming_payment {
        id
    }
}`;

export default CreateTestModePaymentoutput;
