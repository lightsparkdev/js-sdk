// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

const CreateTestModeInvoice = `
mutation CreateTestModeInvoice(
  $amount_msats: Long!
  $memo: String
  $invoice_type: InvoiceType
) {
  create_test_mode_invoice(input: {
      amount_msats: $amount_msats
      memo: $memo
      invoice_type: $invoice_type
  }) {
      encoded_payment_request
  }
}
`;

export default CreateTestModeInvoice;
