// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface CancelInvoiceInput {
  invoiceId: string;
}

export const CancelInvoiceInputFromJson = (obj: any): CancelInvoiceInput => {
  return {
    invoiceId: obj["cancel_invoice_input_invoice_id"],
  } as CancelInvoiceInput;
};
export const CancelInvoiceInputToJson = (obj: CancelInvoiceInput): any => {
  return {
    cancel_invoice_input_invoice_id: obj.invoiceId,
  };
};

export default CancelInvoiceInput;
