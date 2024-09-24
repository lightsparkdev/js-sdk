// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type IncomingPayment from "./IncomingPayment.js";
import { IncomingPaymentFromJson } from "./IncomingPayment.js";

interface IncomingPaymentsForPaymentHashQueryOutput {
  payments: IncomingPayment[];
}

export const IncomingPaymentsForPaymentHashQueryOutputFromJson = (
  obj: any,
): IncomingPaymentsForPaymentHashQueryOutput => {
  return {
    payments: obj[
      "incoming_payments_for_payment_hash_query_output_payments"
    ].map((e) => IncomingPaymentFromJson(e)),
  } as IncomingPaymentsForPaymentHashQueryOutput;
};
export const IncomingPaymentsForPaymentHashQueryOutputToJson = (
  obj: IncomingPaymentsForPaymentHashQueryOutput,
): any => {
  return {
    incoming_payments_for_payment_hash_query_output_payments: obj.payments.map(
      (e) => e.toJson(),
    ),
  };
};

export const FRAGMENT = `
fragment IncomingPaymentsForPaymentHashQueryOutputFragment on IncomingPaymentsForPaymentHashQueryOutput {
    __typename
    incoming_payments_for_payment_hash_query_output_payments: payments {
        id
    }
}`;

export default IncomingPaymentsForPaymentHashQueryOutput;
