// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as IncomingPaymentFragment } from "../objects/IncomingPayment.js";

export const CreateTestModePayment = `
mutation CreateTestModePayment(
  $local_node_id: ID!
  $encoded_invoice: String!
  $amount_msats: Long
) {
  create_test_mode_payment(input: {
      local_node_id: $local_node_id
      encoded_invoice: $encoded_invoice
      amount_msats: $amount_msats
  }) {
      incoming_payment {
          ...IncomingPaymentFragment
      }
  }
}

${IncomingPaymentFragment}
`;
