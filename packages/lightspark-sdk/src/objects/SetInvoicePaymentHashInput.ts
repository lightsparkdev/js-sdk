// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface SetInvoicePaymentHashInput {
  /** The invoice that needs to be updated. **/
  invoiceId: string;

  /** The 32-byte hash of the payment preimage. **/
  paymentHash: string;

  /**
   * The 32-byte nonce used to generate the invoice preimage if applicable. It will later be
   * included in RELEASE_PAYMENT_PREIMAGE webhook to help recover the raw preimage.
   **/
  preimageNonce?: string | undefined;
}

export const SetInvoicePaymentHashInputFromJson = (
  obj: any,
): SetInvoicePaymentHashInput => {
  return {
    invoiceId: obj["set_invoice_payment_hash_input_invoice_id"],
    paymentHash: obj["set_invoice_payment_hash_input_payment_hash"],
    preimageNonce: obj["set_invoice_payment_hash_input_preimage_nonce"],
  } as SetInvoicePaymentHashInput;
};
export const SetInvoicePaymentHashInputToJson = (
  obj: SetInvoicePaymentHashInput,
): any => {
  return {
    set_invoice_payment_hash_input_invoice_id: obj.invoiceId,
    set_invoice_payment_hash_input_payment_hash: obj.paymentHash,
    set_invoice_payment_hash_input_preimage_nonce: obj.preimageNonce,
  };
};

export default SetInvoicePaymentHashInput;
