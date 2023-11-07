// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import InvoiceType from "./InvoiceType.js";

interface CreateTestModeInvoiceInput {
  localNodeId: string;

  amountMsats: number;

  memo?: string | undefined;

  invoiceType?: InvoiceType | undefined;
}

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
export const CreateTestModeInvoiceInputToJson = (
  obj: CreateTestModeInvoiceInput,
): any => {
  return {
    create_test_mode_invoice_input_local_node_id: obj.localNodeId,
    create_test_mode_invoice_input_amount_msats: obj.amountMsats,
    create_test_mode_invoice_input_memo: obj.memo,
    create_test_mode_invoice_input_invoice_type: obj.invoiceType,
  };
};

export default CreateTestModeInvoiceInput;
