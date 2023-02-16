import { LightsparkWalletClient } from "@lightspark/js-sdk";
import {
  BitcoinNetwork,
  TransactionDetailsFragment,
} from "@lightspark/js-sdk/generated/graphql";
import autoBind from "auto-bind";
import AccountStorage from "../auth/AccountStorage";
import { findActiveStreamingDemoTabs } from "../common/streamingTabs";

class TransactionPoller {
  private isPolling = false;
  private pollingHandle?: ReturnType<typeof setInterval>;

  constructor(
    private readonly lightsparkClient: LightsparkWalletClient,
    private readonly accountStorage: AccountStorage,
    private readonly pollingInterval: number
  ) {
    autoBind(this);
  }

  public startPolling() {
    console.log("Starting polling for transactions...");
    if (this.isPolling) {
      return;
    }

    this.isPolling = true;
    this.pollingHandle = setInterval(this.poll, this.pollingInterval);
  }

  public stopPolling() {
    console.log("Stopping polling for transactions...");
    if (!this.isPolling) {
      return;
    }

    this.isPolling = false;
    clearInterval(this.pollingHandle);
  }

  private async poll() {
    console.log("Polling for transactions...")
    const transactions = await this.lightsparkClient.getRecentTransactions(
      20,
      BitcoinNetwork.Regtest,
      true,
      (await this.accountStorage.getAccountCredentials())?.allocationTime
    );
    this.broadcastTransactions(transactions);
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
