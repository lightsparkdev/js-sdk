import { LightsparkWalletClient } from "@lightspark/js-sdk";
import {
  BitcoinNetwork,
  TransactionDetailsFragment,
} from "@lightspark/js-sdk/generated/graphql";
import autoBind from "auto-bind";
import { findActiveStreamingDemoTabs } from "../common/streamingTabs";

class TransactionPoller {
  private isPolling = false;
  private pollingHandle?: number;

  constructor(
    private readonly lightsparkClient: LightsparkWalletClient,
    private readonly pollingInterval: number
  ) {
    autoBind(this);
  }

  public startPolling() {
    if (this.isPolling) {
      return;
    }

    this.isPolling = true;
    this.pollingHandle = window.setInterval(this.poll, this.pollingInterval);
  }

  public stopPolling() {
    if (!this.isPolling) {
      return;
    }

    this.isPolling = false;
    clearInterval(this.pollingHandle);
  }

  private async poll() {
    const transactions = await this.lightsparkClient.getRecentTransactions(
      20,
      BitcoinNetwork.Regtest
    );
    console.log(transactions);
  }

  private async broadcastTransactions(
    transactions: TransactionDetailsFragment[]
  ) {
    findActiveStreamingDemoTabs().then((tabs) => {
      if (tabs.length === 0) return;
      chrome.tabs.sendMessage(tabs[0].id!, {
        id: "transactions_updated",
        transactions,
      });
    });
  }
}

export default TransactionPoller;
