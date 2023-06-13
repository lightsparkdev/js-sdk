// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type CreateLnurlInvoiceInput = {
  /** The node from which to create the invoice. **/
  nodeId: string;

  /** The amount for which the invoice should be created, in millisatoshis. **/
  amountMsats: number;

  /**
   * The SHA256 hash of the LNURL metadata payload. This will be present in the h-tag (SHA256 purpose of
   * payment) of the resulting Bolt 11 invoice.
   **/
  metadataHash: string;
};

export const CreateLnurlInvoiceInputFromJson = (
  obj: any
): CreateLnurlInvoiceInput => {
  return {
    nodeId: obj["create_lnurl_invoice_input_node_id"],
    amountMsats: obj["create_lnurl_invoice_input_amount_msats"],
    metadataHash: obj["create_lnurl_invoice_input_metadata_hash"],
  } as CreateLnurlInvoiceInput;
};

export default CreateLnurlInvoiceInput;
