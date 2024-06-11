// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface InvoiceForPaymentHashOutput {
  invoiceId?: string | undefined;
}

export const InvoiceForPaymentHashOutputFromJson = (
  obj: any,
): InvoiceForPaymentHashOutput => {
  return {
    invoiceId: obj["invoice_for_payment_hash_output_invoice"]?.id ?? undefined,
  } as InvoiceForPaymentHashOutput;
};
export const InvoiceForPaymentHashOutputToJson = (
  obj: InvoiceForPaymentHashOutput,
): any => {
  return {
    invoice_for_payment_hash_output_invoice: { id: obj.invoiceId } ?? undefined,
  };
};

export const FRAGMENT = `
fragment InvoiceForPaymentHashOutputFragment on InvoiceForPaymentHashOutput {
    __typename
    invoice_for_payment_hash_output_invoice: invoice {
        id
    }
}`;

export default InvoiceForPaymentHashOutput;
