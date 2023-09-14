// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type ReleasePaymentPreimageOutput = {
  invoiceId: string;
};

export const ReleasePaymentPreimageOutputFromJson = (
  obj: any,
): ReleasePaymentPreimageOutput => {
  return {
    invoiceId: obj["release_payment_preimage_output_invoice"].id,
  } as ReleasePaymentPreimageOutput;
};

export const FRAGMENT = `
fragment ReleasePaymentPreimageOutputFragment on ReleasePaymentPreimageOutput {
    __typename
    release_payment_preimage_output_invoice: invoice {
        id
    }
}`;

export default ReleasePaymentPreimageOutput;
