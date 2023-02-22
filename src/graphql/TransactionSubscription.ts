import { gql } from "@apollo/client/core/index.js";
import { TransactionDetails } from "./TransactionDetails.js";

export const TransactionSubscription = gql`
subscription TransactionSubscription(
    $nodeIds: [ID!]!
) {
    transactions(node_ids: $nodeIds) {
        ...TransactionDetails
        __typename
    }
}

${TransactionDetails}
`;