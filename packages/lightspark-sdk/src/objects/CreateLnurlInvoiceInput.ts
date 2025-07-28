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

  /** An optional, monthly-rotated, unique hashed identifier corresponding to the receiver of the
   * payment. **/
  receiverHash?: string | undefined;

  /**
   * The payment hash of the invoice. It should only be set if your node is a remote signing
   * node, or if you are creating a hodl invoice. If not set, it will be requested through
   * REMOTE_SIGNING webhooks with sub event type REQUEST_INVOICE_PAYMENT_HASH.
   **/
  paymentHash?: string | undefined;

  /**
   * The 32-byte nonce used to generate the invoice preimage if applicable. It will later be
   * included in RELEASE_PAYMENT_PREIMAGE webhook to help recover the raw preimage. This can only
   * be specified when `payment_hash` is specified.
   **/
  preimageNonce?: string | undefined;
}

export const CreateLnurlInvoiceInputFromJson = (
  obj: any,
): CreateLnurlInvoiceInput => {
  return {
    nodeId: obj["create_lnurl_invoice_input_node_id"],
    amountMsats: obj["create_lnurl_invoice_input_amount_msats"],
    metadataHash: obj["create_lnurl_invoice_input_metadata_hash"],
    expirySecs: obj["create_lnurl_invoice_input_expiry_secs"],
    receiverHash: obj["create_lnurl_invoice_input_receiver_hash"],
    paymentHash: obj["create_lnurl_invoice_input_payment_hash"],
    preimageNonce: obj["create_lnurl_invoice_input_preimage_nonce"],
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
    create_lnurl_invoice_input_receiver_hash: obj.receiverHash,
    create_lnurl_invoice_input_payment_hash: obj.paymentHash,
    create_lnurl_invoice_input_preimage_nonce: obj.preimageNonce,
  };
};

export default CreateLnurlInvoiceInput;
