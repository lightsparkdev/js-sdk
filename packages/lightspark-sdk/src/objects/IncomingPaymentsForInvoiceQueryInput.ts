// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import TransactionStatus from "./TransactionStatus.js";

interface IncomingPaymentsForInvoiceQueryInput {
  invoiceId: string;

  /** An optional filter to only query outgoing payments of given statuses. **/
  statuses?: TransactionStatus[] | undefined;
}

export const IncomingPaymentsForInvoiceQueryInputFromJson = (
  obj: any,
): IncomingPaymentsForInvoiceQueryInput => {
  return {
    invoiceId: obj["incoming_payments_for_invoice_query_input_invoice_id"],
    statuses: obj["incoming_payments_for_invoice_query_input_statuses"]?.map(
      (e) => TransactionStatus[e],
    ),
  } as IncomingPaymentsForInvoiceQueryInput;
};
export const IncomingPaymentsForInvoiceQueryInputToJson = (
  obj: IncomingPaymentsForInvoiceQueryInput,
): any => {
  return {
    incoming_payments_for_invoice_query_input_invoice_id: obj.invoiceId,
    incoming_payments_for_invoice_query_input_statuses: obj.statuses,
  };
};

export default IncomingPaymentsForInvoiceQueryInput;
