// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface InvoiceForPaymentHashInput {
  /** The 32-byte hash of the payment preimage for which to fetch an invoice. **/
  paymentHash: string;
}

export const InvoiceForPaymentHashInputFromJson = (
  obj: any,
): InvoiceForPaymentHashInput => {
  return {
    paymentHash: obj["invoice_for_payment_hash_input_payment_hash"],
  } as InvoiceForPaymentHashInput;
};
export const InvoiceForPaymentHashInputToJson = (
  obj: InvoiceForPaymentHashInput,
): any => {
  return {
    invoice_for_payment_hash_input_payment_hash: obj.paymentHash,
  };
};

export default InvoiceForPaymentHashInput;
