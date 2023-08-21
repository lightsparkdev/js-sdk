// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type CreateTestModePaymentInput = {
  /** The node to where you want to send the payment. **/
  localNodeId: string;

  /** The invoice you want to be paid (as defined by the BOLT11 standard). **/
  encodedInvoice: string;

  /**
   * The amount you will be paid for this invoice, expressed in msats. It should ONLY be set when the
   * invoice amount is zero.
   **/
  amountMsats?: number;
};

export const CreateTestModePaymentInputFromJson = (
  obj: any
): CreateTestModePaymentInput => {
  return {
    localNodeId: obj["create_test_mode_payment_input_local_node_id"],
    encodedInvoice: obj["create_test_mode_payment_input_encoded_invoice"],
    amountMsats: obj["create_test_mode_payment_input_amount_msats"],
  } as CreateTestModePaymentInput;
};

export default CreateTestModePaymentInput;
