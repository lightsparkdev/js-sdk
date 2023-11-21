// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface PayInvoiceInput {
  /** The node from where you want to send the payment. **/
  nodeId: string;

  /** The invoice you want to pay (as defined by the BOLT11 standard). **/
  encodedInvoice: string;

  /** The timeout in seconds that we will try to make the payment. **/
  timeoutSecs: number;

  /**
   * The maximum amount of fees that you want to pay for this payment to be sent, expressed in
   * msats. *
   */
  maximumFeesMsats: number;

  /**
   * The amount you will pay for this invoice, expressed in msats. It should ONLY be set when the
   * invoice amount is zero.
   **/
  amountMsats?: number | undefined;
}

export const PayInvoiceInputFromJson = (obj: any): PayInvoiceInput => {
  return {
    nodeId: obj["pay_invoice_input_node_id"],
    encodedInvoice: obj["pay_invoice_input_encoded_invoice"],
    timeoutSecs: obj["pay_invoice_input_timeout_secs"],
    maximumFeesMsats: obj["pay_invoice_input_maximum_fees_msats"],
    amountMsats: obj["pay_invoice_input_amount_msats"],
  } as PayInvoiceInput;
};
export const PayInvoiceInputToJson = (obj: PayInvoiceInput): any => {
  return {
    pay_invoice_input_node_id: obj.nodeId,
    pay_invoice_input_encoded_invoice: obj.encodedInvoice,
    pay_invoice_input_timeout_secs: obj.timeoutSecs,
    pay_invoice_input_maximum_fees_msats: obj.maximumFeesMsats,
    pay_invoice_input_amount_msats: obj.amountMsats,
  };
};

export default PayInvoiceInput;
