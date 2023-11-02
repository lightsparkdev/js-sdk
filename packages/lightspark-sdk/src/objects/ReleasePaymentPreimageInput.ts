// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type ReleasePaymentPreimageInput = {
  /** The invoice the preimage belongs to. **/
  invoiceId: string;

  /** The preimage to release. **/
  paymentPreimage: string;
};

export const ReleasePaymentPreimageInputFromJson = (
  obj: any,
): ReleasePaymentPreimageInput => {
  return {
    invoiceId: obj["release_payment_preimage_input_invoice_id"],
    paymentPreimage: obj["release_payment_preimage_input_payment_preimage"],
  } as ReleasePaymentPreimageInput;
};

export default ReleasePaymentPreimageInput;
