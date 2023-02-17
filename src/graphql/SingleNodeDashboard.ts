import { gql } from "@apollo/client/core/index.js";
import { TransactionDetails } from "./TransactionDetails.js";

export const SingleNodeDashboard = gql`
query SingleNodeDashboard(
    $network: BitcoinNetwork!,
    $nodeId: ID!,
    $numTransactions: Int,
    $transactionsAfterDate: DateTime,
    $transactionTypes: [TransactionType!] = [PAYMENT, PAYMENT_REQUEST, ROUTE, L1_WITHDRAW, L1_DEPOSIT]
    $transaction_statuses: [TransactionStatus!] = null
) {
    current_account {
        id
        name
        dashboard_overview_nodes: nodes(
            first: 1
            bitcoin_networks: [$network]
            node_ids: [$nodeId]
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
        blockchain_balance(bitcoin_networks: [$network], node_ids: [$nodeId]) {
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
        local_balance(bitcoin_networks: [$network], node_ids: [$nodeId]) {
            value
            unit
            __typename
        }
        remote_balance(bitcoin_networks: [$network], node_ids: [$nodeId]) {
            value
            unit
            __typename
        }
        recent_transactions: transactions(
            first: $numTransactions
            types: $transactionTypes
            bitcoin_network: $network
            lightning_node_id: $nodeId
            statuses: $transaction_statuses
            after_date: $transactionsAfterDate
        ) {
            count
            total_amount_transacted {
                value
                unit
                __typename
            }
            edges {
                entity {
                    ...TransactionDetails
                    __typename
                }
                __typename
            }
            __typename
        }
        __typename
    }
}

${TransactionDetails}
`;