import { gql } from "@apollo/client/core";

export const TransactionDetails = gql`
  fragment TransactionDetails on Transaction {
    id
    amount {
      value
      unit
      __typename
    }
    created_at
    resolved_at
    status
    transaction_hash
    ... on OutgoingPayment {
      outgoing_payment_origin: origin {
        display_name
      }
      outgoing_payment_destination: destination {
        display_name
        public_key
      }
      fees {
        value
        unit
      }
    }
    ... on IncomingPayment {
      incoming_payment_origin: origin {
        display_name
        public_key
      }
      incoming_payment_destination: destination {
        display_name
      }
      payment_request {
        data {
          ... on InvoiceData {
            memo
          }
        }
      }
    }
    ... on RoutingTransaction {
      failure_reason
      fees {
        value
        unit
      }
      incoming_channel {
        remote_node {
          display_name
        }
        local_node {
          display_name
        }
      }
      outgoing_channel {
        remote_node {
          display_name
        }
      }
    }
    ... on ChannelOpeningTransaction {
        fees {
            value
            unit
          }
        channel {
            remote_node {
                display_name
            }
            local_node {
                display_name
            }
        }
    }
    ... on ChannelClosingTransaction {
        fees {
            value
            unit
          }
        channel {
            remote_node {
                display_name
            }
            local_node {
                display_name
            }
        }
    }
    ... on Deposit {
      deposit_destination: destination {
        display_name
        public_key
      }
      fees {
        value
        unit
      }
    }
    ... on Withdrawal {
      withdraw_origin: origin {
        display_name
        public_key
      }
      fees {
        value
        unit
      }
    }
  }
`;
