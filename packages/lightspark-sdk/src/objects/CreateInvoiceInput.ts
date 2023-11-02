// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import InvoiceType from "./InvoiceType.js";

type CreateInvoiceInput = {
  /** The node from which to create the invoice. **/
  nodeId: string;

  /** The amount for which the invoice should be created, in millisatoshis. **/
  amountMsats: number;

  memo?: string;

  invoiceType?: InvoiceType;

  /** The expiry of the invoice in seconds. Default value is 86400 (1 day). **/
  expirySecs?: number;
};

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

export default CreateInvoiceInput;
