// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as CurrencyAmountFragment } from "../objects/CurrencyAmount.js";
import { FRAGMENT as TransactionFragment } from "../objects/Transaction.js";

export const SingleNodeDashboard = `
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
            entities {
                color
                display_name
                id
                addresses(first: 1) {
                    entities {
                        address
                        type
                        __typename
                    }
                    count
                    __typename
                }
                public_key
                status
                total_local_balance {
                    ...CurrencyAmountFragment
                }
                local_balance {
                    ...CurrencyAmountFragment
                }
                remote_balance {
                    ...CurrencyAmountFragment
                }
                blockchain_balance {
                    confirmed_balance {
                        ...CurrencyAmountFragment
                    }
                    unconfirmed_balance {
                        ...CurrencyAmountFragment
                    }
                    available_balance {
                        ...CurrencyAmountFragment
                    }
                    total_balance {
                        ...CurrencyAmountFragment
                    }
                    __typename
                }
                __typename
            }
            __typename
        }
        blockchain_balance(bitcoin_networks: [$network], node_ids: [$nodeId]) {
            total_balance: total_balance {
                ...CurrencyAmountFragment
            }
            required_reserve {
                ...CurrencyAmountFragment
            }
            available_balance {
                ...CurrencyAmountFragment
            }
            unconfirmed_balance {
                ...CurrencyAmountFragment
            }
            confirmed_balance {
                ...CurrencyAmountFragment
            }
            __typename
        }
        local_balance(bitcoin_networks: [$network], node_ids: [$nodeId]) {
            ...CurrencyAmountFragment
        }
        remote_balance(bitcoin_networks: [$network], node_ids: [$nodeId]) {
            ...CurrencyAmountFragment
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
                ...CurrencyAmountFragment
            }
            entities {
                ...TransactionFragment
                __typename
            }
            __typename
        }
        __typename
    }
}

${TransactionFragment}
${CurrencyAmountFragment}
`;
