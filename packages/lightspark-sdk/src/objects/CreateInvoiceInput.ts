// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import InvoiceType from "./InvoiceType.js";

interface CreateInvoiceInput {
  /** The node from which to create the invoice. **/
  nodeId: string;

  /** The amount for which the invoice should be created, in millisatoshis. **/
  amountMsats: number;

  memo?: string | undefined;

  invoiceType?: InvoiceType | undefined;

  /** The expiry of the invoice in seconds. Default value is 86400 (1 day). **/
  expirySecs?: number | undefined;
}

export const CreateInvoiceInputFromJson = (obj: any): CreateInvoiceInput => {
  return {
    nodeId: obj["create_invoice_input_node_id"],
    amountMsats: obj["create_invoice_input_amount_msats"],
    memo: obj["create_invoice_input_memo"],
    invoiceType: !!obj["create_invoice_input_invoice_type"]
      ? InvoiceType[obj["create_invoice_input_invoice_type"]] ??
        InvoiceType.FUTURE_VALUE
      : null,
    expirySecs: obj["create_invoice_input_expiry_secs"],
  } as CreateInvoiceInput;
};
export const CreateInvoiceInputToJson = (obj: CreateInvoiceInput): any => {
  return {
    create_invoice_input_node_id: obj.nodeId,
    create_invoice_input_amount_msats: obj.amountMsats,
    create_invoice_input_memo: obj.memo,
    create_invoice_input_invoice_type: obj.invoiceType,
    create_invoice_input_expiry_secs: obj.expirySecs,
  };
};

export default CreateInvoiceInput;
