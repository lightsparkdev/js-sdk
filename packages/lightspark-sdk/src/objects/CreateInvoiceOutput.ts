// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface CreateInvoiceOutput {
  invoiceId: string;
}

export const CreateInvoiceOutputFromJson = (obj: any): CreateInvoiceOutput => {
  return {
    invoiceId: obj["create_invoice_output_invoice"].id,
  } as CreateInvoiceOutput;
};
export const CreateInvoiceOutputToJson = (obj: CreateInvoiceOutput): any => {
  return {
    create_invoice_output_invoice: { id: obj.invoiceId },
  };
};

export const FRAGMENT = `
fragment CreateInvoiceOutputFragment on CreateInvoiceOutput {
    __typename
    create_invoice_output_invoice: invoice {
        id
    }
}`;

export default CreateInvoiceOutput;
