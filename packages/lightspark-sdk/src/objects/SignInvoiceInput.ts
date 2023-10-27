// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type SignInvoiceInput = {
  /** The unique identifier of the invoice to be signed. **/
  invoiceId: string;

  /** The cryptographic signature for the invoice. **/
  signature: string;

  /** The recovery identifier for the signature. **/
  recoveryId: number;
};

export const SignInvoiceInputFromJson = (obj: any): SignInvoiceInput => {
  return {
    invoiceId: obj["sign_invoice_input_invoice_id"],
    signature: obj["sign_invoice_input_signature"],
    recoveryId: obj["sign_invoice_input_recovery_id"],
  } as SignInvoiceInput;
};

export default SignInvoiceInput;
