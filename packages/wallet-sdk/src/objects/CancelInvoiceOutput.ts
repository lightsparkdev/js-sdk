// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

/**
 * The Invoice that was cancelled. If the invoice was already cancelled, the same invoice is
 * returned. *
 */
interface CancelInvoiceOutput {
  invoiceId: string;
}

export const CancelInvoiceOutputFromJson = (obj: any): CancelInvoiceOutput => {
  return {
    invoiceId: obj["cancel_invoice_output_invoice"].id,
  } as CancelInvoiceOutput;
};
export const CancelInvoiceOutputToJson = (obj: CancelInvoiceOutput): any => {
  return {
    cancel_invoice_output_invoice: { id: obj.invoiceId },
  };
};

export const FRAGMENT = `
fragment CancelInvoiceOutputFragment on CancelInvoiceOutput {
    __typename
    cancel_invoice_output_invoice: invoice {
        id
    }
}`;

export default CancelInvoiceOutput;
