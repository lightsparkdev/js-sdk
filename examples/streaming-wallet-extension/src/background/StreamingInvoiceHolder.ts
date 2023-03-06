import { LightsparkClient } from "@lightsparkdev/js-sdk";
import { CurrencyUnit, InvoiceType } from "@lightsparkdev/js-sdk/objects";
import autoBind from "auto-bind";

class StreamingInvoiceHolder {
  constructor() {
    autoBind(this);
  }

  public async createInvoice(
    lightsparkClient: LightsparkClient,
    creatorWalletId: string
  ): Promise<String | undefined> {
    const encodedInvoice = await lightsparkClient.createInvoice(
      creatorWalletId,
      { value: 0, unit: CurrencyUnit.SATOSHI },
      "Streaming demo",
      InvoiceType.AMP
    );
    await chrome.storage.local.set({ streamingInvoice: encodedInvoice });
    return encodedInvoice;
  }

  public async getInvoiceData(): Promise<string | undefined> {
    return (await chrome.storage.local.get("streamingInvoice"))
      .streamingInvoice;
  }

  public async clearInvoice(): Promise<void> {
    return await chrome.storage.local.remove("streamingInvoice");
  }
}

export default StreamingInvoiceHolder;
