// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import PaymentFailureReason from "./PaymentFailureReason.js";

interface PayTestModeInvoiceInput {
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

  /** The failure reason to trigger for the payment. If not set, pay_invoice will be called. **/
  failureReason?: PaymentFailureReason | undefined;

  /**
   * The amount you will pay for this invoice, expressed in msats. It should ONLY be set when the
   * invoice amount is zero.
   **/
  amountMsats?: number | undefined;

  /**
   * The idempotency key of the request. The same result will be returned for the same
   * idempotency key. *
   */
  idempotencyKey?: string | undefined;
}

export const PayTestModeInvoiceInputFromJson = (
  obj: any,
): PayTestModeInvoiceInput => {
  return {
    nodeId: obj["pay_test_mode_invoice_input_node_id"],
    encodedInvoice: obj["pay_test_mode_invoice_input_encoded_invoice"],
    timeoutSecs: obj["pay_test_mode_invoice_input_timeout_secs"],
    maximumFeesMsats: obj["pay_test_mode_invoice_input_maximum_fees_msats"],
    failureReason: !!obj["pay_test_mode_invoice_input_failure_reason"]
      ? PaymentFailureReason[
          obj["pay_test_mode_invoice_input_failure_reason"]
        ] ?? PaymentFailureReason.FUTURE_VALUE
      : null,
    amountMsats: obj["pay_test_mode_invoice_input_amount_msats"],
    idempotencyKey: obj["pay_test_mode_invoice_input_idempotency_key"],
  } as PayTestModeInvoiceInput;
};
export const PayTestModeInvoiceInputToJson = (
  obj: PayTestModeInvoiceInput,
): any => {
  return {
    pay_test_mode_invoice_input_node_id: obj.nodeId,
    pay_test_mode_invoice_input_encoded_invoice: obj.encodedInvoice,
    pay_test_mode_invoice_input_timeout_secs: obj.timeoutSecs,
    pay_test_mode_invoice_input_maximum_fees_msats: obj.maximumFeesMsats,
    pay_test_mode_invoice_input_failure_reason: obj.failureReason,
    pay_test_mode_invoice_input_amount_msats: obj.amountMsats,
    pay_test_mode_invoice_input_idempotency_key: obj.idempotencyKey,
  };
};

export default PayTestModeInvoiceInput;
