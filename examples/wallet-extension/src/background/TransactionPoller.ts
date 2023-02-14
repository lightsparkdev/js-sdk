import { LightsparkWalletClient } from "@lightspark/js-sdk";
import { TransactionDetailsFragment } from "@lightspark/js-sdk/generated/graphql";
import autoBind from "auto-bind";
import AccountStorage from "../auth/AccountStorage";
import { Subscription } from "zen-observable-ts";
import { findActiveStreamingDemoTabs } from "../common/streamingTabs";

class TransactionPoller {
  private isPolling = false;
  private subscription?: Subscription;

  constructor(
    private readonly lightsparkClient: LightsparkWalletClient,
    private readonly accountStorage: AccountStorage
  ) {
    autoBind(this);
  }

  public startPolling() {
    console.log("Starting polling for transactions...");
    if (this.isPolling) {
      return;
    }

    this.isPolling = true;
    this.subscription = this.lightsparkClient.listenToTransactions().subscribe({
      next: (transaction) => {
        if (transaction) {
          this.broadcastTransactions([transaction]);
        }
      },
    });
  }

  public stopPolling() {
    console.log("Stopping polling for transactions...");
    if (!this.isPolling || !this.subscription) {
      return;
    }

    this.isPolling = false;
    this.subscription.unsubscribe();
    this.subscription = undefined;
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
