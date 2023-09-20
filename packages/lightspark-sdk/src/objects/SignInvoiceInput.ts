// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type SignInvoiceInput = {
  invoiceId: string;

  signature: string;

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
