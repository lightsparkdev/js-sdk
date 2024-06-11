// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface OutgoingPaymentForIdempotencyKeyInput {
  idempotencyKey: string;
}

export const OutgoingPaymentForIdempotencyKeyInputFromJson = (
  obj: any,
): OutgoingPaymentForIdempotencyKeyInput => {
  return {
    idempotencyKey:
      obj["outgoing_payment_for_idempotency_key_input_idempotency_key"],
  } as OutgoingPaymentForIdempotencyKeyInput;
};
export const OutgoingPaymentForIdempotencyKeyInputToJson = (
  obj: OutgoingPaymentForIdempotencyKeyInput,
): any => {
  return {
    outgoing_payment_for_idempotency_key_input_idempotency_key:
      obj.idempotencyKey,
  };
};

export default OutgoingPaymentForIdempotencyKeyInput;
