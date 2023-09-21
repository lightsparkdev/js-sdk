import { type Invoice } from "@lightsparkdev/lightspark-sdk";

type CreateUmaInvoiceVariables = {
  nodeId: string;
  amountMsats: number;
  metadataHash: string;
  expirySecs?: number | undefined;
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
};

export class UmaClient {
  provider: UmaProvider;

  constructor({ provider }: UmaClientArgs) {
    this.provider = provider;
  }

  async createUmaInvoice({
    nodeId,
    amountMsats,
    metadataHash,
    expirySecs,
  }: CreateUmaInvoiceVariables) {
    const result = await this.provider.createUmaInvoice(
      nodeId,
      amountMsats,
      metadataHash,
      expirySecs,
    );
    return result;
  }
}
