// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type LightningFeeEstimateForInvoiceInput = {
  /** The node from where you want to send the payment. **/
  nodeId: string;

  /** The invoice you want to pay (as defined by the BOLT11 standard). **/
  encodedInvoice: string;

  /**
   * If the invoice does not specify a payment amount, then the amount that you wish to pay, expressed
   * in msats.
   **/
  amountMsats?: number;
};

export const LightningFeeEstimateForInvoiceInputFromJson = (
  obj: any
): LightningFeeEstimateForInvoiceInput => {
  return {
    nodeId: obj["lightning_fee_estimate_for_invoice_input_node_id"],
    encodedInvoice:
      obj["lightning_fee_estimate_for_invoice_input_encoded_invoice"],
    amountMsats: obj["lightning_fee_estimate_for_invoice_input_amount_msats"],
  } as LightningFeeEstimateForInvoiceInput;
};

export default LightningFeeEstimateForInvoiceInput;
