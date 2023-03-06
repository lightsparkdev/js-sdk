import { FRAGMENT as WithdrawalFragment } from "../objects/Withdrawal.js";

export const WithdrawFunds = `
    mutation WithdrawFunds(
        $node_id: ID!
        $bitcoin_address: String!
        $amount: CurrencyAmountInput!
    ) {
        withdraw_funds(input: {
            node_id: $node_id
            bitcoin_address: $bitcoin_address
            amount: $amount
        }) {
            transaction {
                ...WithdrawalFragment
            }
        }
    }

${WithdrawalFragment}
`;
