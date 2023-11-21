// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import PaymentFailureReason from "./PaymentFailureReason.js";
import RoutingTransactionFailureReason from "./RoutingTransactionFailureReason.js";

/** This object represents payment failures associated with your Lightspark Node. **/
interface TransactionFailures {
  paymentFailures?: PaymentFailureReason[] | undefined;

  routingTransactionFailures?: RoutingTransactionFailureReason[] | undefined;
}

export const TransactionFailuresFromJson = (obj: any): TransactionFailures => {
  return {
    paymentFailures: obj["transaction_failures_payment_failures"]?.map(
      (e) => PaymentFailureReason[e],
    ),
    routingTransactionFailures: obj[
      "transaction_failures_routing_transaction_failures"
    ]?.map((e) => RoutingTransactionFailureReason[e]),
  } as TransactionFailures;
};
export const TransactionFailuresToJson = (obj: TransactionFailures): any => {
  return {
    transaction_failures_payment_failures: obj.paymentFailures,
    transaction_failures_routing_transaction_failures:
      obj.routingTransactionFailures,
  };
};

export default TransactionFailures;
