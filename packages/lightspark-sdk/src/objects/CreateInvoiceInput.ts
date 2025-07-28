// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import InvoiceType from "./InvoiceType.js";

interface CreateInvoiceInput {
  /** The node from which to create the invoice. **/
  nodeId: string;

  /**
   * The amount for which the invoice should be created, in millisatoshis. Setting the amount to
   * 0 will allow the payer to specify an amount.
   **/
  amountMsats: number;

  memo?: string | undefined;

  invoiceType?: InvoiceType | undefined;

  /** The expiry of the invoice in seconds. Default value is 86400 (1 day). **/
  expirySecs?: number | undefined;

  /**
   * The payment hash of the invoice. It should only be set if your node is a remote signing
   * node. If not set, it will be requested through REMOTE_SIGNING webhooks with sub event type
   * REQUEST_INVOICE_PAYMENT_HASH.
   **/
  paymentHash?: string | undefined;

  /**
   * The 32-byte nonce used to generate the invoice preimage if applicable. It will later be
   * included in RELEASE_PAYMENT_PREIMAGE webhook to help recover the raw preimage. This can only
   * be specified when `payment_hash` is specified.
   **/
  preimageNonce?: string | undefined;
}

export const CreateInvoiceInputFromJson = (obj: any): CreateInvoiceInput => {
  return {
    nodeId: obj["create_invoice_input_node_id"],
    amountMsats: obj["create_invoice_input_amount_msats"],
    memo: obj["create_invoice_input_memo"],
    invoiceType: !!obj["create_invoice_input_invoice_type"]
      ? InvoiceType[obj["create_invoice_input_invoice_type"]] ??
        InvoiceType.FUTURE_VALUE
      : null,
    expirySecs: obj["create_invoice_input_expiry_secs"],
    paymentHash: obj["create_invoice_input_payment_hash"],
    preimageNonce: obj["create_invoice_input_preimage_nonce"],
  } as CreateInvoiceInput;
};
export const CreateInvoiceInputToJson = (obj: CreateInvoiceInput): any => {
  return {
    create_invoice_input_node_id: obj.nodeId,
    create_invoice_input_amount_msats: obj.amountMsats,
    create_invoice_input_memo: obj.memo,
    create_invoice_input_invoice_type: obj.invoiceType,
    create_invoice_input_expiry_secs: obj.expirySecs,
    create_invoice_input_payment_hash: obj.paymentHash,
    create_invoice_input_preimage_nonce: obj.preimageNonce,
  };
};

export default CreateInvoiceInput;
