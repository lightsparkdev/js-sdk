import { gql } from "@apollo/client/core";

export const MultiNodeDashboard = gql`
  query MultiNodeDashboard(
    $network: BitcoinNetwork!
    $nodeIds: [ID!]
  ) {
    current_account {
      id
      name
      dashboard_overview_nodes: nodes(
        bitcoin_networks: [$network]
        node_ids: $nodeIds
      ) {
        count
        edges {
          entity {
            color
            display_name
            purpose
            id
            addresses(first: 1) {
              edges {
                entity {
                  address
                  type
                  __typename
                }
                __typename
              }
              count
              __typename
            }
            public_key
            status
            local_balance {
              value
              unit
              value
              unit
              __typename
            }
            remote_balance {
              value
              unit
              value
              unit
              __typename
            }
            blockchain_balance {
              available_balance {
                value
                unit
                __typename
              }
              total_balance {
                value
                unit
                __typename
              }
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      blockchain_balance(bitcoin_networks: [$network], node_ids: $nodeIds) {
        l1_balance: total_balance {
          value
          unit
          __typename
        }
        required_reserve {
          value
          unit
          __typename
        }
        available_balance {
          value
          unit
          __typename
        }
        unconfirmed_balance {
          value
          unit
          __typename
        }
        __typename
      }
      local_balance(bitcoin_networks: [$network], node_ids: $nodeIds) {
        value
        unit
        __typename
      }
      remote_balance(bitcoin_networks: [$network], node_ids: $nodeIds) {
        value
        unit
        __typename
      }
    }
  }
`;
