// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as InvoiceFragment } from "../objects/Invoice.js";

const CreateInvoiceMutation = `
  mutation CreateInvoice(
    $amountMsats: Long!
    $memo: String
    $type: InvoiceType = null
    $expirySecs: Int = null
    ) {
    create_invoice(input: { amount_msats: $amountMsats, memo: $memo, invoice_type: $type, expiry_secs: $expirySecs }) {
      invoice {
        ...InvoiceFragment
      }
    }
  }
  
  ${InvoiceFragment}
`;

export default CreateInvoiceMutation;
