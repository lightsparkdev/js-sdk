// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as OutgoingPaymentFragment } from "../objects/OutgoingPayment.js";

const PayInvoiceMutation = `
  mutation PayInvoice(
    $encoded_invoice: String!
    $timeout_secs: Int!
    $maximum_fees_msats: Long!
    $amount_msats: Long
  ) {
    pay_invoice(
      input: {
        encoded_invoice: $encoded_invoice
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

export default PayInvoiceMutation;
