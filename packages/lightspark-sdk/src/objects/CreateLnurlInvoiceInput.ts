// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface CreateLnurlInvoiceInput {
  /** The node from which to create the invoice. **/
  nodeId: string;

  /** The amount for which the invoice should be created, in millisatoshis. **/
  amountMsats: number;

  /**
   * The SHA256 hash of the LNURL metadata payload. This will be present in the h-tag (SHA256
   * purpose of payment) of the resulting Bolt 11 invoice.
   **/
  metadataHash: string;

  /** The expiry of the invoice in seconds. Default value is 86400 (1 day). **/
  expirySecs?: number | undefined;
}

export const CreateLnurlInvoiceInputFromJson = (
  obj: any,
): CreateLnurlInvoiceInput => {
  return {
    nodeId: obj["create_lnurl_invoice_input_node_id"],
    amountMsats: obj["create_lnurl_invoice_input_amount_msats"],
    metadataHash: obj["create_lnurl_invoice_input_metadata_hash"],
    expirySecs: obj["create_lnurl_invoice_input_expiry_secs"],
  } as CreateLnurlInvoiceInput;
};
export const CreateLnurlInvoiceInputToJson = (
  obj: CreateLnurlInvoiceInput,
): any => {
  return {
    create_lnurl_invoice_input_node_id: obj.nodeId,
    create_lnurl_invoice_input_amount_msats: obj.amountMsats,
    create_lnurl_invoice_input_metadata_hash: obj.metadataHash,
    create_lnurl_invoice_input_expiry_secs: obj.expirySecs,
  };
};

export default CreateLnurlInvoiceInput;
