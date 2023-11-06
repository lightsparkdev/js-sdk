// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface PayUmaInvoiceInput {
  nodeId: string;

  encodedInvoice: string;

  timeoutSecs: number;

  maximumFeesMsats: number;

  amountMsats?: number | undefined;
}

export const PayUmaInvoiceInputFromJson = (obj: any): PayUmaInvoiceInput => {
  return {
    nodeId: obj["pay_uma_invoice_input_node_id"],
    encodedInvoice: obj["pay_uma_invoice_input_encoded_invoice"],
    timeoutSecs: obj["pay_uma_invoice_input_timeout_secs"],
    maximumFeesMsats: obj["pay_uma_invoice_input_maximum_fees_msats"],
    amountMsats: obj["pay_uma_invoice_input_amount_msats"],
  } as PayUmaInvoiceInput;
};
export const PayUmaInvoiceInputToJson = (obj: PayUmaInvoiceInput): any => {
  return {
    pay_uma_invoice_input_node_id: obj.nodeId,
    pay_uma_invoice_input_encoded_invoice: obj.encodedInvoice,
    pay_uma_invoice_input_timeout_secs: obj.timeoutSecs,
    pay_uma_invoice_input_maximum_fees_msats: obj.maximumFeesMsats,
    pay_uma_invoice_input_amount_msats: obj.amountMsats,
  };
};

export default PayUmaInvoiceInput;
