// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as CurrencyAmountFragment } from "../objects/CurrencyAmount.js";
import { FRAGMENT as TransactionFragment } from "../objects/Transaction.js";

export const TransactionsForNode = `
query TransactionsForNode(
    $network: BitcoinNetwork!,
    $nodeId: ID!,
    $numTransactions: Int,
    $afterDate: DateTime,
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
            after_date: $afterDate
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
