// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as InvoiceDataFragment } from "../objects/InvoiceData.js";

const CreateInvoiceMutation = `
  mutation CreateInvoice(
    $amountMsats: Long!
    $memo: String
    $type: InvoiceType = null
    ) {
    create_invoice(input: { amount_msats: $amountMsats, memo: $memo, invoice_type: $type }) {
      invoice {
        data {
          ...InvoiceDataFragment
        }
      }
    }
  }
  
  ${InvoiceDataFragment}
`;

export default CreateInvoiceMutation;
