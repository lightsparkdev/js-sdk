// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface CreateTestModeInvoiceOutput {
  encodedPaymentRequest: string;
}

export const CreateTestModeInvoiceOutputFromJson = (
  obj: any,
): CreateTestModeInvoiceOutput => {
  return {
    encodedPaymentRequest:
      obj["create_test_mode_invoice_output_encoded_payment_request"],
  } as CreateTestModeInvoiceOutput;
};
export const CreateTestModeInvoiceOutputToJson = (
  obj: CreateTestModeInvoiceOutput,
): any => {
  return {
    create_test_mode_invoice_output_encoded_payment_request:
      obj.encodedPaymentRequest,
  };
};

export const FRAGMENT = `
fragment CreateTestModeInvoiceOutputFragment on CreateTestModeInvoiceOutput {
    __typename
    create_test_mode_invoice_output_encoded_payment_request: encoded_payment_request
}`;

export default CreateTestModeInvoiceOutput;
