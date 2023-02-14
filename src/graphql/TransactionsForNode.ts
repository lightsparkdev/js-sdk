import { gql } from "@apollo/client/core";
import { TransactionDetails } from "./TransactionDetails";

export const TransactionsForNode = gql`
query TransactionsForNode(
    $network: BitcoinNetwork!,
    $nodeId: ID!,
    $numTransactions: Int,
    $transactionTypes: [TransactionType!] = [PAYMENT, PAYMENT_REQUEST, ROUTE, L1_WITHDRAW, L1_DEPOSIT]
    $transaction_statuses: [TransactionStatus!] = null
) {
    current_account {
        id
        name
        recent_transactions: transactions(
            first: $numTransactions
            types: $transactionTypes
            bitcoin_network: $network
            lightning_node_id: $nodeId
            statuses: $transaction_statuses
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