import { LightsparkWalletClient } from "@lightspark/js-sdk";
import { CurrencyUnit, InvoiceType } from "@lightspark/js-sdk/generated/graphql";
import autoBind from "auto-bind";

class StreamingInvoiceHolder {
  private encodedInvoice: string | undefined;

  constructor() {
    autoBind(this);
  }

  public async createInvoice(
    lightsparkClient: LightsparkWalletClient,
    creatorWalletId: string
  ): Promise<String | undefined> {
    const initialWalletId = lightsparkClient.getActiveWalletId();
    lightsparkClient.setActiveWalletWithoutUnlocking(creatorWalletId);
    this.encodedInvoice = await lightsparkClient.createInvoice(
      {value: 0, unit: CurrencyUnit.Satoshi},
      "Streaming demo",
      InvoiceType.Amp
    );
    if (initialWalletId) {
      lightsparkClient.setActiveWalletWithoutUnlocking(initialWalletId);
    }
    return this.encodedInvoice;
  }

  public getInvoiceData(): string | undefined {
    return this.encodedInvoice;
  }
}

export default StreamingInvoiceHolder;
