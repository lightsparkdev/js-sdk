// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface FailHtlcsInput {
  /** The id of invoice which the pending HTLCs that need to be failed are paying for. **/
  invoiceId: string;

  /**
   * Whether the invoice needs to be canceled after failing the htlcs. If yes, the invoice cannot
   * be paid anymore.
   **/
  cancelInvoice: boolean;
}

export const FailHtlcsInputFromJson = (obj: any): FailHtlcsInput => {
  return {
    invoiceId: obj["fail_htlcs_input_invoice_id"],
    cancelInvoice: obj["fail_htlcs_input_cancel_invoice"],
  } as FailHtlcsInput;
};
export const FailHtlcsInputToJson = (obj: FailHtlcsInput): any => {
  return {
    fail_htlcs_input_invoice_id: obj.invoiceId,
    fail_htlcs_input_cancel_invoice: obj.cancelInvoice,
  };
};

export default FailHtlcsInput;
