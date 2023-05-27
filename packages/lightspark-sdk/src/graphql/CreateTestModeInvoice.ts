// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

export const CreateTestModeInvoice = `
mutation CreateTestModeInvoice(
  $local_node_id: ID!
  $amount_msats: Long!
  $memo: String
  $invoice_type: InvoiceType
) {
  create_test_mode_invoice(input: {
      local_node_id: $local_node_id
      amount_msats: $amount_msats
      memo: $memo
      invoice_type: $invoice_type
  }) {
      encoded_payment_request
  }
}
`;
