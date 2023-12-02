// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface CreateTestModePaymentInputWallet {
  /** The invoice you want to be paid (as defined by the BOLT11 standard). **/
  encodedInvoice: string;

  /**
   * The amount you will be paid for this invoice, expressed in msats. It should ONLY be set when
   * the invoice amount is zero.
   **/
  amountMsats?: number | undefined;
}

export const CreateTestModePaymentInputWalletFromJson = (
  obj: any,
): CreateTestModePaymentInputWallet => {
  return {
    encodedInvoice:
      obj["create_test_mode_payment_input_wallet_encoded_invoice"],
    amountMsats: obj["create_test_mode_payment_input_wallet_amount_msats"],
  } as CreateTestModePaymentInputWallet;
};
export const CreateTestModePaymentInputWalletToJson = (
  obj: CreateTestModePaymentInputWallet,
): any => {
  return {
    create_test_mode_payment_input_wallet_encoded_invoice: obj.encodedInvoice,
    create_test_mode_payment_input_wallet_amount_msats: obj.amountMsats,
  };
};

export default CreateTestModePaymentInputWallet;
