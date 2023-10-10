// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as IncomingPaymentFragment } from "../objects/IncomingPayment.js";

const CreateTestModePayment = `
mutation CreateTestModePayment(
  $encoded_invoice: String!
  $amount_msats: Long
) {
  create_test_mode_payment(input: {
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

export default CreateTestModePayment;
