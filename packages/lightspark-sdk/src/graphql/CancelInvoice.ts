// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as InvoiceFragment } from "../objects/Invoice.js";

export const CancelInvoice = `
  mutation CancelInvoice(
    $invoice_id: ID!
  ) {
    cancel_invoice(input: { invoice_id: $invoice_id }) {
      invoice {
        ...InvoiceFragment
      }
    }
  }

  ${InvoiceFragment}
`;
