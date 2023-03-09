// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import CurrencyAmountInput from "./CurrencyAmountInput.js";
import { CurrencyAmountInputFromJson } from "./CurrencyAmountInput.js";

type PayInvoiceInput = {
  /** The node from where you want to send the payment. **/
  nodeId: string;

  /** The invoice you want to pay (as defined by the BOLT11 standard). **/
  encodedInvoice: string;

  /** The timeout in seconds that we will try to make the payment. **/
  timeoutSecs: number;

  /** The amount you will pay for this invoice. It should ONLY be set when the invoice amount is zero. **/
  amount?: CurrencyAmountInput;

  /** The maximum amount of fees that you want to pay for this payment to be sent. **/
  maximumFees?: CurrencyAmountInput;
};

export const PayInvoiceInputFromJson = (obj: any): PayInvoiceInput => {
  return {
    nodeId: obj["pay_invoice_input_node_id"],
    encodedInvoice: obj["pay_invoice_input_encoded_invoice"],
    timeoutSecs: obj["pay_invoice_input_timeout_secs"],
    amount: !!obj["pay_invoice_input_amount"]
      ? CurrencyAmountInputFromJson(obj["pay_invoice_input_amount"])
      : undefined,
    maximumFees: !!obj["pay_invoice_input_maximum_fees"]
      ? CurrencyAmountInputFromJson(obj["pay_invoice_input_maximum_fees"])
      : undefined,
  } as PayInvoiceInput;
};

export default PayInvoiceInput;
