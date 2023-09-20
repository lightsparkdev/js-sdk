// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type SetInvoicePaymentHashInput = {
  /** The invoice that needs to be updated. **/
  invoiceId: string;

  /** The 32-byte hash of the payment preimage. **/
  paymentHash: string;

  /** The 32-byte nonce used to generate the invoice preimage. **/
  preimageNonce: string;
};

export const SetInvoicePaymentHashInputFromJson = (
  obj: any,
): SetInvoicePaymentHashInput => {
  return {
    invoiceId: obj["set_invoice_payment_hash_input_invoice_id"],
    paymentHash: obj["set_invoice_payment_hash_input_payment_hash"],
    preimageNonce: obj["set_invoice_payment_hash_input_preimage_nonce"],
  } as SetInvoicePaymentHashInput;
};

export default SetInvoicePaymentHashInput;
