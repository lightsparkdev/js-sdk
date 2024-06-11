// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface OutgoingPaymentForIdempotencyKeyOutput {
  paymentId?: string | undefined;
}

export const OutgoingPaymentForIdempotencyKeyOutputFromJson = (
  obj: any,
): OutgoingPaymentForIdempotencyKeyOutput => {
  return {
    paymentId:
      obj["outgoing_payment_for_idempotency_key_output_payment"]?.id ??
      undefined,
  } as OutgoingPaymentForIdempotencyKeyOutput;
};
export const OutgoingPaymentForIdempotencyKeyOutputToJson = (
  obj: OutgoingPaymentForIdempotencyKeyOutput,
): any => {
  return {
    outgoing_payment_for_idempotency_key_output_payment:
      { id: obj.paymentId } ?? undefined,
  };
};

export const FRAGMENT = `
fragment OutgoingPaymentForIdempotencyKeyOutputFragment on OutgoingPaymentForIdempotencyKeyOutput {
    __typename
    outgoing_payment_for_idempotency_key_output_payment: payment {
        id
    }
}`;

export default OutgoingPaymentForIdempotencyKeyOutput;
