// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface ReleasePaymentPreimageOutput {
  /** The invoice of the transaction. **/
  invoiceId: string;
}

export const ReleasePaymentPreimageOutputFromJson = (
  obj: any,
): ReleasePaymentPreimageOutput => {
  return {
    invoiceId: obj["release_payment_preimage_output_invoice"].id,
  } as ReleasePaymentPreimageOutput;
};
export const ReleasePaymentPreimageOutputToJson = (
  obj: ReleasePaymentPreimageOutput,
): any => {
  return {
    release_payment_preimage_output_invoice: { id: obj.invoiceId },
  };
};

export const FRAGMENT = `
fragment ReleasePaymentPreimageOutputFragment on ReleasePaymentPreimageOutput {
    __typename
    release_payment_preimage_output_invoice: invoice {
        id
    }
}`;

export default ReleasePaymentPreimageOutput;
