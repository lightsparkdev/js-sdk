// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as CurrencyAmountFragment } from "../objects/CurrencyAmount.js";

export const FundNode = `
    mutation FundNode(
        $node_id: ID!,
        $amountSats: Long
    ) {
        fund_node(input: { node_id: $node_id, amount_sats: $amountMsats }) {
            amount {
                ...CurrencyAmountFragment
            }
        }
    }

${CurrencyAmountFragment}
`;
