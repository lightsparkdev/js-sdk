import { gql } from "@apollo/client/core/index.js";

export const CreateInvoice = gql`
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