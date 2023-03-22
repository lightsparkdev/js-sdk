// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as OutgoingPaymentFragment } from "../objects/OutgoingPayment.js";

export const SendPayment = `
  mutation SendPayment(
    $node_id: ID!
    $destination_public_key: String!
    $timeout_secs: Int!
    $amount: CurrencyAmountInput
    $maximum_fees: CurrencyAmountInput
  ) {
    send_payment(
      input: {
        node_id: $node_id
        destination_public_key: $destination_public_key
        timeout_secs: $timeout_secs
        amount: $amount
        maximum_fees: $maximum_fees
      }
    ) {
      payment {
        ...OutgoingPaymentFragment
      }
    }
  }

  ${OutgoingPaymentFragment}
`;
