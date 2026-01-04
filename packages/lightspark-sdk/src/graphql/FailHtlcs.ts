// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as FailHtlcsOutputFragment } from "../objects/FailHtlcsOutput.js";

export const FailHtlcs = `
  mutation FailHtlcs(
    $invoice_id: ID!,
    $cancel_invoice: Boolean!
  ) {
    fail_htlcs(input: {
      invoice_id: $invoice_id,
      cancel_invoice: $cancel_invoice
    }) {
      ...FailHtlcsOutputFragment
    }
  }

${FailHtlcsOutputFragment}
`;
