import { gql } from "@apollo/client/core/index.js";

export const DecodeInvoice = gql`
  query DecodeInvoice($encoded_payment_request: String!) {
    decoded_payment_request(encoded_payment_request: $encoded_payment_request) {
      __typename
      ... on InvoiceData {
        __typename
        encoded_payment_request
        bitcoin_network
        payment_hash
        amount {
          __typename
          value
          unit
        }
        created_at
        expires_at
        destination {
          __typename
          addresses {
            count
            edges {
                entity {
                    address
                    type
                }
            }
          }
          ... on LightsparkNode {
            __typename
            id
            created_at
            updated_at
            bitcoin_network
            color
            conductivity
            display_name
            public_key
          }
          ... on GraphNode {
            __typename
            id
            created_at
            updated_at
            bitcoin_network
            color
            conductivity
            display_name
            public_key
          }
        }
        invoice_data_memo: memo
      }
    }
  }
`;
