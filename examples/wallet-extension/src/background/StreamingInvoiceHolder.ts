import { LightsparkWalletClient } from "@lightspark/js-sdk";
import { CurrencyUnit, InvoiceType } from "@lightspark/js-sdk/generated/graphql";
import autoBind from "auto-bind";

class StreamingInvoiceHolder {
  constructor() {
    autoBind(this);
  }

  public async createInvoice(
    lightsparkClient: LightsparkWalletClient,
    creatorWalletId: string
  ): Promise<String | undefined> {
    const initialWalletId = lightsparkClient.getActiveWalletId();
    lightsparkClient.setActiveWalletWithoutUnlocking(creatorWalletId);
    const encodedInvoice = await lightsparkClient.createInvoice(
      {value: 0, unit: CurrencyUnit.Satoshi},
      "Streaming demo",
      InvoiceType.Amp
    );
    await chrome.storage.local.set({ streamingInvoice: encodedInvoice });
    if (initialWalletId) {
      lightsparkClient.setActiveWalletWithoutUnlocking(initialWalletId);
    }
    return encodedInvoice;
  }

  public async getInvoiceData(): Promise<string | undefined> {
    return (await chrome.storage.local.get("streamingInvoice")).streamingInvoice;
  }

  public async clearInvoice(): Promise<void> {
    return await chrome.storage.local.remove("streamingInvoice");
  }
}

export default StreamingInvoiceHolder;
