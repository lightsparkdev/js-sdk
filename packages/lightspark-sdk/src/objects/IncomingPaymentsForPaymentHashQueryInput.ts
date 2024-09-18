// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import TransactionStatus from "./TransactionStatus.js";

interface IncomingPaymentsForPaymentHashQueryInput {
  /** The 32-byte hash of the payment preimage for which to fetch payments **/
  paymentHash: string;

  /** An optional filter to only query incoming payments of given statuses. **/
  statuses?: TransactionStatus[] | undefined;
}

export const IncomingPaymentsForPaymentHashQueryInputFromJson = (
  obj: any,
): IncomingPaymentsForPaymentHashQueryInput => {
  return {
    paymentHash:
      obj["incoming_payments_for_payment_hash_query_input_payment_hash"],
    statuses: obj[
      "incoming_payments_for_payment_hash_query_input_statuses"
    ]?.map((e) => TransactionStatus[e]),
  } as IncomingPaymentsForPaymentHashQueryInput;
};
export const IncomingPaymentsForPaymentHashQueryInputToJson = (
  obj: IncomingPaymentsForPaymentHashQueryInput,
): any => {
  return {
    incoming_payments_for_payment_hash_query_input_payment_hash:
      obj.paymentHash,
    incoming_payments_for_payment_hash_query_input_statuses: obj.statuses,
  };
};

export default IncomingPaymentsForPaymentHashQueryInput;
