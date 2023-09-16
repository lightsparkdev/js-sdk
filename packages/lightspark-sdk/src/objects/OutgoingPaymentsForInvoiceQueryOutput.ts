// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type OutgoingPayment from "./OutgoingPayment.js";
import { OutgoingPaymentFromJson } from "./OutgoingPayment.js";

type OutgoingPaymentsForInvoiceQueryOutput = {
  payments: OutgoingPayment[];
};

export const OutgoingPaymentsForInvoiceQueryOutputFromJson = (
  obj: any,
): OutgoingPaymentsForInvoiceQueryOutput => {
  return {
    payments: obj["outgoing_payments_for_invoice_query_output_payments"].map(
      (e) => OutgoingPaymentFromJson(e),
    ),
  } as OutgoingPaymentsForInvoiceQueryOutput;
};

export const FRAGMENT = `
fragment OutgoingPaymentsForInvoiceQueryOutputFragment on OutgoingPaymentsForInvoiceQueryOutput {
    __typename
    outgoing_payments_for_invoice_query_output_payments: payments {
        id
    }
}`;

export default OutgoingPaymentsForInvoiceQueryOutput;