// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface CreateUmaInvoiceInput {
  /** The node from which to create the invoice. **/
  nodeId: string;

  /** The amount for which the invoice should be created, in millisatoshis. **/
  amountMsats: number;

  /**
   * The SHA256 hash of the UMA metadata payload. This will be present in the h-tag (SHA256
   * purpose of payment) of the resulting Bolt 11 invoice.
   **/
  metadataHash: string;

  /** The expiry of the invoice in seconds. Default value is 86400 (1 day). **/
  expirySecs?: number | undefined;

  /** An optional, monthly-rotated, unique hashed identifier corresponding to the receiver of the
   * payment. **/
  receiverHash?: string | undefined;
}

export const CreateUmaInvoiceInputFromJson = (
  obj: any,
): CreateUmaInvoiceInput => {
  return {
    nodeId: obj["create_uma_invoice_input_node_id"],
    amountMsats: obj["create_uma_invoice_input_amount_msats"],
    metadataHash: obj["create_uma_invoice_input_metadata_hash"],
    expirySecs: obj["create_uma_invoice_input_expiry_secs"],
    receiverHash: obj["create_uma_invoice_input_receiver_hash"],
  } as CreateUmaInvoiceInput;
};
export const CreateUmaInvoiceInputToJson = (
  obj: CreateUmaInvoiceInput,
): any => {
  return {
    create_uma_invoice_input_node_id: obj.nodeId,
    create_uma_invoice_input_amount_msats: obj.amountMsats,
    create_uma_invoice_input_metadata_hash: obj.metadataHash,
    create_uma_invoice_input_expiry_secs: obj.expirySecs,
    create_uma_invoice_input_receiver_hash: obj.receiverHash,
  };
};

export default CreateUmaInvoiceInput;
