// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import InvoiceType from "./InvoiceType.js";

interface CreateTestModeInvoiceInput {
  /** The local node from which to create the invoice. **/
  localNodeId: string;

  /**
   * The amount for which the invoice should be created, in millisatoshis. Setting the amount to
   * 0 will allow the payer to specify an amount.
   **/
  amountMsats: number;

  /** An optional memo to include in the invoice. **/
  memo?: string | undefined;

  /** The type of invoice to create. **/
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
