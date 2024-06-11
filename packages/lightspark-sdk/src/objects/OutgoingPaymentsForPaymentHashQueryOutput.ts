// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type OutgoingPayment from "./OutgoingPayment.js";
import { OutgoingPaymentFromJson } from "./OutgoingPayment.js";

interface OutgoingPaymentsForPaymentHashQueryOutput {
  payments: OutgoingPayment[];
}

export const OutgoingPaymentsForPaymentHashQueryOutputFromJson = (
  obj: any,
): OutgoingPaymentsForPaymentHashQueryOutput => {
  return {
    payments: obj[
      "outgoing_payments_for_payment_hash_query_output_payments"
    ].map((e) => OutgoingPaymentFromJson(e)),
  } as OutgoingPaymentsForPaymentHashQueryOutput;
};
export const OutgoingPaymentsForPaymentHashQueryOutputToJson = (
  obj: OutgoingPaymentsForPaymentHashQueryOutput,
): any => {
  return {
    outgoing_payments_for_payment_hash_query_output_payments: obj.payments.map(
      (e) => e.toJson(),
    ),
  };
};

export const FRAGMENT = `
fragment OutgoingPaymentsForPaymentHashQueryOutputFragment on OutgoingPaymentsForPaymentHashQueryOutput {
    __typename
    outgoing_payments_for_payment_hash_query_output_payments: payments {
        id
    }
}`;

export default OutgoingPaymentsForPaymentHashQueryOutput;
