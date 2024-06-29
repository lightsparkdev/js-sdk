// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface PayUmaInvoiceInput {
  nodeId: string;

  encodedInvoice: string;

  timeoutSecs: number;

  maximumFeesMsats: number;

  amountMsats?: number | undefined;

  idempotencyKey?: string | undefined;

  /**
   * An optional, monthly-rotated, unique hashed identifier corresponding to the sender of the
   * payment. *
   */
  senderHash?: string | undefined;
}

export const PayUmaInvoiceInputFromJson = (obj: any): PayUmaInvoiceInput => {
  return {
    nodeId: obj["pay_uma_invoice_input_node_id"],
    encodedInvoice: obj["pay_uma_invoice_input_encoded_invoice"],
    timeoutSecs: obj["pay_uma_invoice_input_timeout_secs"],
    maximumFeesMsats: obj["pay_uma_invoice_input_maximum_fees_msats"],
    amountMsats: obj["pay_uma_invoice_input_amount_msats"],
    idempotencyKey: obj["pay_uma_invoice_input_idempotency_key"],
    senderHash: obj["pay_uma_invoice_input_sender_hash"],
  } as PayUmaInvoiceInput;
};
export const PayUmaInvoiceInputToJson = (obj: PayUmaInvoiceInput): any => {
  return {
    pay_uma_invoice_input_node_id: obj.nodeId,
    pay_uma_invoice_input_encoded_invoice: obj.encodedInvoice,
    pay_uma_invoice_input_timeout_secs: obj.timeoutSecs,
    pay_uma_invoice_input_maximum_fees_msats: obj.maximumFeesMsats,
    pay_uma_invoice_input_amount_msats: obj.amountMsats,
    pay_uma_invoice_input_idempotency_key: obj.idempotencyKey,
    pay_uma_invoice_input_sender_hash: obj.senderHash,
  };
};

export default PayUmaInvoiceInput;
