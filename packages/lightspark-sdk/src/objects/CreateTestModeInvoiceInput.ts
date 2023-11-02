// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import InvoiceType from "./InvoiceType.js";

type CreateTestModeInvoiceInput = {
  localNodeId: string;

  amountMsats: number;

  memo?: string;

  invoiceType?: InvoiceType;
};

export const CreateTestModeInvoiceInputFromJson = (
  obj: any,
): CreateTestModeInvoiceInput => {
  return {
    localNodeId: obj["create_test_mode_invoice_input_local_node_id"],
    amountMsats: obj["create_test_mode_invoice_input_amount_msats"],
    memo: obj["create_test_mode_invoice_input_memo"],
    invoiceType: !!obj["create_test_mode_invoice_input_invoice_type"]
      ? InvoiceType[obj["create_test_mode_invoice_input_invoice_type"]] ??
        InvoiceType.FUTURE_VALUE
      : null,
  } as CreateTestModeInvoiceInput;
};

export default CreateTestModeInvoiceInput;
