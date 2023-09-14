// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type SetInvoicePaymentHashOutput = {
  invoiceId: string;
};

export const SetInvoicePaymentHashOutputFromJson = (
  obj: any,
): SetInvoicePaymentHashOutput => {
  return {
    invoiceId: obj["set_invoice_payment_hash_output_invoice"].id,
  } as SetInvoicePaymentHashOutput;
};

export const FRAGMENT = `
fragment SetInvoicePaymentHashOutputFragment on SetInvoicePaymentHashOutput {
    __typename
    set_invoice_payment_hash_output_invoice: invoice {
        id
    }
}`;

export default SetInvoicePaymentHashOutput;
