// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type CreateUmaInvoiceInput = {
  nodeId: string;

  amountMsats: number;

  metadataHash: string;

  expirySecs?: number;
};

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

export default CreateUmaInvoiceInput;
