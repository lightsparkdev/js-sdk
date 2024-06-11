// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import TransactionStatus from "./TransactionStatus.js";

interface OutgoingPaymentsForPaymentHashQueryInput {
  /** The 32-byte hash of the payment preimage for which to fetch payments **/
  paymentHash: string;

  /** An optional filter to only query outgoing payments of given statuses. **/
  statuses?: TransactionStatus[] | undefined;
}

export const OutgoingPaymentsForPaymentHashQueryInputFromJson = (
  obj: any,
): OutgoingPaymentsForPaymentHashQueryInput => {
  return {
    paymentHash:
      obj["outgoing_payments_for_payment_hash_query_input_payment_hash"],
    statuses: obj[
      "outgoing_payments_for_payment_hash_query_input_statuses"
    ]?.map((e) => TransactionStatus[e]),
  } as OutgoingPaymentsForPaymentHashQueryInput;
};
export const OutgoingPaymentsForPaymentHashQueryInputToJson = (
  obj: OutgoingPaymentsForPaymentHashQueryInput,
): any => {
  return {
    outgoing_payments_for_payment_hash_query_input_payment_hash:
      obj.paymentHash,
    outgoing_payments_for_payment_hash_query_input_statuses: obj.statuses,
  };
};

export default OutgoingPaymentsForPaymentHashQueryInput;
