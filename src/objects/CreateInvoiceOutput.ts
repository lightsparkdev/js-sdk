// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

type CreateInvoiceOutput = {
  invoiceId: string;
};

export const CreateInvoiceOutputFromJson = (obj: any): CreateInvoiceOutput => {
  return {
    invoiceId: obj["create_invoice_output_invoice"].id,
  } as CreateInvoiceOutput;
};

export const FRAGMENT = `
fragment CreateInvoiceOutputFragment on CreateInvoiceOutput {
    __typename
    create_invoice_output_invoice: invoice {
        id
    }
}`;

export default CreateInvoiceOutput;
