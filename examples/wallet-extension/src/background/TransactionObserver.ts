import { LightsparkWalletClient } from "@lightspark/js-sdk";
import { TransactionDetailsFragment } from "@lightspark/js-sdk/generated/graphql";
import autoBind from "auto-bind";
import { Subscription } from "zen-observable-ts";
import { findActiveStreamingDemoTabs } from "../common/streamingTabs";

class TransactionObserver {
  private isListening = false;
  private subscription?: Subscription;

  constructor(
    private readonly lightsparkClient: LightsparkWalletClient
  ) {
    autoBind(this);
  }

  public startListening() {
    console.log("Starting listening for transactions...");
    if (this.isListening) {
      return;
    }

    this.isListening = true;
    this.subscription = this.lightsparkClient.listenToTransactions().subscribe({
      next: (transaction) => {
        if (transaction) {
          this.broadcastTransactions([transaction]);
        }
      },
    });
  }

  public stopListening() {
    console.log("Stopping listening for transactions...");
    if (!this.isListening || !this.subscription) {
      return;
    }

    this.isListening = false;
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

export default TransactionObserver;
