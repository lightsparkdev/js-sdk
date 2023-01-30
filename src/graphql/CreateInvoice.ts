import { gql } from "@apollo/client/core";

export const CreateInvoice = gql`
  mutation CreateInvoice(
    $node_id: ID!
    $amount: CurrencyAmountInput!
    $memo: String
  ) {
    create_invoice(input: { node_id: $node_id, amount: $amount, memo: $memo }) {
      invoice {
        data {
          encoded_payment_request
        }
      }
    }
  }
`;