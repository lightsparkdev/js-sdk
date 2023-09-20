// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

export const CreateInvoice = `
  mutation CreateInvoice(
    $node_id: ID!
    $amount_msats: Long!
    $memo: String
    $type: InvoiceType = null
    $expiry_secs: Int = null
  ) {
    create_invoice(input: { node_id: $node_id, amount_msats: $amount_msats, memo: $memo, invoice_type: $type, expiry_secs: $expiry_secs }) {
      invoice {
        data {
          encoded_payment_request
        }
      }
    }
  }
`;
