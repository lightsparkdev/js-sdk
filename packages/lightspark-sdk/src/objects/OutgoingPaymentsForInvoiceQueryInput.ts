// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import TransactionStatus from "./TransactionStatus.js";

type OutgoingPaymentsForInvoiceQueryInput = {
  /** The encoded invoice that the outgoing payments paid to. **/
  encodedInvoice: string;

  /** An optional filter to only query outgoing payments of given statuses. **/
  statuses?: TransactionStatus[];
};

export const OutgoingPaymentsForInvoiceQueryInputFromJson = (
  obj: any,
): OutgoingPaymentsForInvoiceQueryInput => {
  return {
    encodedInvoice:
      obj["outgoing_payments_for_invoice_query_input_encoded_invoice"],
    statuses: obj["outgoing_payments_for_invoice_query_input_statuses"]?.map(
      (e) => TransactionStatus[e],
    ),
  } as OutgoingPaymentsForInvoiceQueryInput;
};

export default OutgoingPaymentsForInvoiceQueryInput;
