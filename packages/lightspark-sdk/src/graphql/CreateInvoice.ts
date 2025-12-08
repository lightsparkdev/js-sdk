// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { FRAGMENT as InvoiceFragment } from "../objects/Invoice.js";

export const CreateInvoice = `
  mutation CreateInvoice(
    $node_id: ID!
    $amount_msats: Long!
    $memo: String
    $type: InvoiceType = null
    $expiry_secs: Int = null
    $payment_hash: Hash32 = null
    $preimage_nonce: Hash32 = null
  ) {
    create_invoice(input: {
      node_id: $node_id,
      amount_msats: $amount_msats,
      memo: $memo,
      invoice_type: $type,
      expiry_secs: $expiry_secs,
      payment_hash: $payment_hash,
      preimage_nonce: $preimage_nonce
    }) {
      invoice {
        ...InvoiceFragment
      }
    }
  }

${InvoiceFragment}
`;
