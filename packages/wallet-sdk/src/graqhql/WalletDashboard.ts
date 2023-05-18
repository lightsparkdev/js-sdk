// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as BalancesFragment } from "../objects/Balances.js";
import { FRAGMENT as PaymentRequestFragment } from "../objects/PaymentRequest.js";
import { FRAGMENT as TransactionFragment } from "../objects/Transaction.js";

const WalletDashboardQuery = `
query WalletDashboard(
    $numTransactions: Int,
    $numPaymentRequests: Int,
    $transactionsAfterDate: DateTime = null,
    $paymentRequestsAfterDate: DateTime = null,
    $transactionTypes: [TransactionType!] = [CHANNEL_OPEN, CHANNEL_CLOSE, L1_DEPOSIT, L1_WITHDRAW, INCOMING_PAYMENT, OUTGOING_PAYMENT],
    $transactionStatuses: [TransactionStatus!] = [SUCCESS, FAILED, PENDING]
) {
    current_wallet {
        id
        balances {
            ...BalancesFragment
        }
        status
        recent_transactions: transactions(
            first: $numTransactions
            types: $transactionTypes
            statuses: $transactionStatuses
            created_after_date: $transactionsAfterDate
        ) {
            wallet_to_transactions_connection_count: count
            wallet_to_transactions_connection_entities: entities {
                ...TransactionFragment
            }
            wallet_to_transactions_connection_page_info: page_info {
                page_info_has_next_page: has_next_page
                page_info_has_previous_page: has_previous_page
                page_info_start_cursor: start_cursor
                page_info_end_cursor: end_cursor
            }
            type: __typename
        }
        payment_requests(
            first: $numPaymentRequests
            created_after_date: $paymentRequestsAfterDate
        ) {
            wallet_to_payment_requests_connection_count: count
            wallet_to_payment_requests_connection_entities: entities {
                ...PaymentRequestFragment
            }
            wallet_to_payment_requests_connection_page_info: page_info {
                page_info_has_next_page: has_next_page
                page_info_has_previous_page: has_previous_page
                page_info_start_cursor: start_cursor
                page_info_end_cursor: end_cursor
            }
        }
    }
}

${TransactionFragment}
${BalancesFragment}
${PaymentRequestFragment}
`;

export default WalletDashboardQuery;
