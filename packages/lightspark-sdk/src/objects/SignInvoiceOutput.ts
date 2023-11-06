// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface SignInvoiceOutput {
  /** The signed invoice object. **/
  invoiceId: string;
}

export const SignInvoiceOutputFromJson = (obj: any): SignInvoiceOutput => {
  return {
    invoiceId: obj["sign_invoice_output_invoice"].id,
  } as SignInvoiceOutput;
};
export const SignInvoiceOutputToJson = (obj: SignInvoiceOutput): any => {
  return {
    sign_invoice_output_invoice: { id: obj.invoiceId },
  };
};

export const FRAGMENT = `
fragment SignInvoiceOutputFragment on SignInvoiceOutput {
    __typename
    sign_invoice_output_invoice: invoice {
        id
    }
}`;

export default SignInvoiceOutput;
