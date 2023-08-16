// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import InvoiceType from "./InvoiceType.js";

type CreateInvoiceInput = {
  amountMsats: number;

  memo?: string;

  invoiceType?: InvoiceType;

  expirySecs?: number;
};

export const CreateInvoiceInputFromJson = (obj: any): CreateInvoiceInput => {
  return {
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
