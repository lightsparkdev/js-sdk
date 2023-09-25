import type { Invoice as InvoiceType } from "@lightsparkdev/lightspark-sdk";

type Invoice = InvoiceType;

type CreateUmaInvoiceArgs = {
  amountMsats: number;
  metadataHash: string;
};

type UmaProvider = {
  createUmaInvoice: (
    nodeId: string,
    amountMsats: number,
    metadata: string,
    expirySecs?: number | undefined,
  ) => Promise<Invoice | undefined>;
};

type UmaClientArgs = {
  provider: UmaProvider;
  receiverNodeId: string;
  invoiceExpirySeconds?: number | undefined;
};

export class UmaClient {
  provider: UmaProvider;
  receiverNodeId: string;
  invoiceExpirySeconds: number | undefined;

  constructor({
    provider,
    receiverNodeId, // the node ID of the receiver.
    invoiceExpirySeconds, // the number of seconds until the invoice expires.
  }: UmaClientArgs) {
    this.provider = provider;
    this.receiverNodeId = receiverNodeId;
    this.invoiceExpirySeconds = invoiceExpirySeconds;
  }

  async createUmaInvoice({ amountMsats, metadataHash }: CreateUmaInvoiceArgs) {
    const result = await this.provider.createUmaInvoice(
      this.receiverNodeId,
      amountMsats,
      metadataHash,
      this.invoiceExpirySeconds,
    );

    if (!result) {
      throw new Error("Failed to create invoice");
    }

    return result;
  }
}
