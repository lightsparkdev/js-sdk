// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import InvoiceType from "./InvoiceType.js";

type CreateTestModeInvoiceInputWallet = {
  amountMsats: number;

  memo?: string;

  invoiceType?: InvoiceType;
};

export const CreateTestModeInvoiceInputWalletFromJson = (
  obj: any
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

export default CreateTestModeInvoiceInputWallet;
