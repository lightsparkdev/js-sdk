// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved
import { FRAGMENT as InvoiceFragment } from "../objects/Invoice.js";

export const CreateLnurlInvoice = `
mutation CreateLnurlInvoice(
  $node_id: ID!
  $amount_msats: Long!
  $metadata_hash: String!
) {
  create_lnurl_invoice(input: {
      node_id: $node_id
      amount_msats: $amount_msats
      metadata_hash: $metadata_hash
  }) {
      invoice {
          ...InvoiceFragment
      }
  }
}
${InvoiceFragment}
`;
