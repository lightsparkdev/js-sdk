// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface FailHtlcsOutput {
  invoiceId: string;
}

export const FailHtlcsOutputFromJson = (obj: any): FailHtlcsOutput => {
  return {
    invoiceId: obj["fail_htlcs_output_invoice"].id,
  } as FailHtlcsOutput;
};
export const FailHtlcsOutputToJson = (obj: FailHtlcsOutput): any => {
  return {
    fail_htlcs_output_invoice: { id: obj.invoiceId },
  };
};

export const FRAGMENT = `
fragment FailHtlcsOutputFragment on FailHtlcsOutput {
    __typename
    fail_htlcs_output_invoice: invoice {
        id
    }
}`;

export default FailHtlcsOutput;
