import { gql } from "@apollo/client/core/index.js";

export const PayInvoice = gql`
  mutation PayInvoice(
    $node_id: ID!
    $encoded_invoice: String!
    $timeout_secs: Int!
    $amount: CurrencyAmountInput
    $maximum_fees: CurrencyAmountInput
  ) {
    pay_invoice(
      input: {
        node_id: $node_id
        encoded_invoice: $encoded_invoice
        timeout_secs: $timeout_secs
        amount: $amount
        maximum_fees: $maximum_fees
      }
    ) {
      payment {
        __typename
        outgoing_payment_id: id
        outgoing_payment_created_at: created_at
        outgoing_payment_updated_at: updated_at
        outgoing_payment_status: status
        outgoing_payment_resolved_at: resolved_at
        outgoing_payment_amount: amount {
          currency_amount_value: value
          currency_amount_unit: unit
        }
        outgoing_payment_transaction_hash: transaction_hash
        outgoing_payment_origin: origin {
          id
        }
        outgoing_payment_destination: destination {
          id
        }
        outgoing_payment_fees: fees {
          currency_amount_value: value
          currency_amount_unit: unit
        }
        outgoing_payment_failure_reason: failure_reason
        outgoing_payment_failure_message: failure_message {
          __typename
          rich_text_text: text
        }
      }
    }
  }
`;
