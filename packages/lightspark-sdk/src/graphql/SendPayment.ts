// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as OutgoingPaymentFragment } from "../objects/OutgoingPayment.js";

export const SendPayment = `
  mutation SendPayment(
    $node_id: ID!
    $destination_public_key: String!
    $timeout_secs: Int!
    $amount_msats: Long!
    $maximum_fees_msats: Long!
  ) {
    send_payment(
      input: {
        node_id: $node_id
        destination_public_key: $destination_public_key
        timeout_secs: $timeout_secs
        amount_msats: $amount_msats
        maximum_fees_msats: $maximum_fees_msats
      }
    ) {
      payment {
        ...OutgoingPaymentFragment
      }
    }
  }

  ${OutgoingPaymentFragment}
`;
