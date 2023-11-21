// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface LightningFeeEstimateForInvoiceInput {
  /** The invoice you want to pay (as defined by the BOLT11 standard). **/
  encodedPaymentRequest: string;

  /**
   * If the invoice does not specify a payment amount, then the amount that you wish to pay,
   * expressed in msats.
   **/
  amountMsats?: number | undefined;
}

export const LightningFeeEstimateForInvoiceInputFromJson = (
  obj: any,
): LightningFeeEstimateForInvoiceInput => {
  return {
    encodedPaymentRequest:
      obj["lightning_fee_estimate_for_invoice_input_encoded_payment_request"],
    amountMsats: obj["lightning_fee_estimate_for_invoice_input_amount_msats"],
  } as LightningFeeEstimateForInvoiceInput;
};
export const LightningFeeEstimateForInvoiceInputToJson = (
  obj: LightningFeeEstimateForInvoiceInput,
): any => {
  return {
    lightning_fee_estimate_for_invoice_input_encoded_payment_request:
      obj.encodedPaymentRequest,
    lightning_fee_estimate_for_invoice_input_amount_msats: obj.amountMsats,
  };
};

export default LightningFeeEstimateForInvoiceInput;
