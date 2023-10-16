// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as PaymentRequestFragment } from "../objects/PaymentRequest.js";

export const PaymentRequestsForNode = `
query PaymentRequestsForNode(
    $network: BitcoinNetwork!,
    $nodeId: ID!,
    $numTransactions: Int,
    $afterDate: DateTime,
) {
    current_account {
        id
        name
        recent_payment_requests: payment_requests(
            first: $numTransactions
            bitcoin_network: $network
            lightning_node_id: $nodeId
            after_date: $afterDate
        ) {
            count
            entities {
                ...PaymentRequestFragment
                __typename
            }
            __typename
        }
        __typename
    }
}

${PaymentRequestFragment}
`;
