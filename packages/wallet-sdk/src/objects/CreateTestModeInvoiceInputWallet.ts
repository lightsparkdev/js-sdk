// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import InvoiceType from "./InvoiceType.js";

interface CreateTestModeInvoiceInputWallet {
  amountMsats: number;

  memo?: string | undefined;

  invoiceType?: InvoiceType | undefined;
}

export const CreateTestModeInvoiceInputWalletFromJson = (
  obj: any,
): CreateTestModeInvoiceInputWallet => {
  return {
    amountMsats: obj["create_test_mode_invoice_input_wallet_amount_msats"],
    memo: obj["create_test_mode_invoice_input_wallet_memo"],
    invoiceType: !!obj["create_test_mode_invoice_input_wallet_invoice_type"]
      ? InvoiceType[
          obj["create_test_mode_invoice_input_wallet_invoice_type"]
        ] ?? InvoiceType.FUTURE_VALUE
      : null,
  } as CreateTestModeInvoiceInputWallet;
};
export const CreateTestModeInvoiceInputWalletToJson = (
  obj: CreateTestModeInvoiceInputWallet,
): any => {
  return {
    create_test_mode_invoice_input_wallet_amount_msats: obj.amountMsats,
    create_test_mode_invoice_input_wallet_memo: obj.memo,
    create_test_mode_invoice_input_wallet_invoice_type: obj.invoiceType,
  };
};

export default CreateTestModeInvoiceInputWallet;
