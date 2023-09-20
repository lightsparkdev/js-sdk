// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved
import { FRAGMENT as InvoiceFragment } from "../objects/Invoice.js";

export const CreateUmaInvoice = `
mutation CreateUmaInvoice(
  $node_id: ID!
  $amount_msats: Long!
  $metadata_hash: String!
  $expiry_secs: Int = null
) {
  create_uma_invoice(input: {
      node_id: $node_id
      amount_msats: $amount_msats
      metadata_hash: $metadata_hash
      expiry_secs: $expiry_secs
  }) {
      invoice {
          ...InvoiceFragment
      }
  }
}
${InvoiceFragment}
`;
