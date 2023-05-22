// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type CreateTestModePaymentInputWallet = {
  /** The invoice you want to be paid (as defined by the BOLT11 standard). **/
  encodedInvoice: string;

  /**
   * The amount you will be paid for this invoice, expressed in msats. It should ONLY be set when the
   * invoice amount is zero.
   **/
  amountMsats?: number;
};

export const CreateTestModePaymentInputWalletFromJson = (
  obj: any
): CreateTestModePaymentInputWallet => {
  return {
    encodedInvoice:
      obj["create_test_mode_payment_input_wallet_encoded_invoice"],
    amountMsats: obj["create_test_mode_payment_input_wallet_amount_msats"],
  } as CreateTestModePaymentInputWallet;
};

export default CreateTestModePaymentInputWallet;
