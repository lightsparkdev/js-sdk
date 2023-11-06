// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface CreateUmaInvoiceInput {
  nodeId: string;

  amountMsats: number;

  metadataHash: string;

  expirySecs?: number | undefined;
}

export const CreateUmaInvoiceInputFromJson = (
  obj: any,
): CreateUmaInvoiceInput => {
  return {
    nodeId: obj["create_uma_invoice_input_node_id"],
    amountMsats: obj["create_uma_invoice_input_amount_msats"],
    metadataHash: obj["create_uma_invoice_input_metadata_hash"],
    expirySecs: obj["create_uma_invoice_input_expiry_secs"],
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
  };
};

export default CreateUmaInvoiceInput;
