// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import PaymentFailureReason from "./PaymentFailureReason.js";
import RoutingTransactionFailureReason from "./RoutingTransactionFailureReason.js";

type TransactionFailures = {
  paymentFailures?: PaymentFailureReason[];

  routingTransactionFailures?: RoutingTransactionFailureReason[];
};

export const TransactionFailuresFromJson = (obj: any): TransactionFailures => {
  return {
    paymentFailures: obj["transaction_failures_payment_failures"]?.map(
      (e) => PaymentFailureReason[e]
    ),
    routingTransactionFailures: obj[
      "transaction_failures_routing_transaction_failures"
    ]?.map((e) => RoutingTransactionFailureReason[e]),
  } as TransactionFailures;
};

export default TransactionFailures;
