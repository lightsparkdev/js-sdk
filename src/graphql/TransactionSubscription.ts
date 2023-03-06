import { FRAGMENT as TransactionFragment } from "../objects/Transaction.js";

export const TransactionSubscription = `
subscription TransactionSubscription(
    $nodeIds: [ID!]!
) {
    transactions(node_ids: $nodeIds) {
        ...TransactionFragment
        __typename
    }
}

${TransactionFragment}
`;
