// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as TransactionUpdateFragment } from "../objects/TransactionUpdate.js";

export const TransactionSubscription = `
subscription TransactionSubscription(
    $nodeIds: [ID!]!
) {
    transactions(node_ids: $nodeIds) {
        ...TransactionUpdateFragment
        __typename
    }
}

${TransactionUpdateFragment}
`;
