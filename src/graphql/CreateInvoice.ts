// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

export const CreateInvoice = `
  mutation CreateInvoice(
    $nodeId: ID!
    $amount: CurrencyAmountInput!
    $memo: String
    $type: InvoiceType = null
    ) {
    create_invoice(input: { node_id: $nodeId, amount: $amount, memo: $memo, invoice_type: $type }) {
      invoice {
        data {
          encoded_payment_request
        }
      }
    }
  }
`;
