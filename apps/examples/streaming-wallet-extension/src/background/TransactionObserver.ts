import { LightsparkClient, Transaction } from "@lightsparkdev/lightspark-sdk";
import autoBind from "auto-bind";
import { Subscription } from "zen-observable-ts";
import { findActiveStreamingDemoTabs } from "../common/streamingTabs";

class TransactionObserver {
  private isListening = false;
  private subscription?: Subscription | undefined;
  private readonly cachedTransactions = new Map<string, Transaction>();

  constructor(private readonly lightsparkClient: LightsparkClient) {
    autoBind(this);
  }

  public startListening(nodeId: string) {
    console.log("Starting listening for transactions...");
    if (this.isListening) {
      return;
    }

    this.isListening = true;
    this.subscription = this.lightsparkClient
      .listenToTransactions([nodeId])
      .subscribe({
        next: (transaction) => {
          if (transaction) {
            this.broadcastTransactions([transaction]);
          }
        },
      });
  }

  public clearCache() {
    this.cachedTransactions.clear();
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

  private async broadcastTransactions(transactions: Transaction[]) {
    transactions.forEach((transaction) => {
      this.cachedTransactions.set(transaction.id, transaction);
    });
    findActiveStreamingDemoTabs().then((tabs) => {
      if (tabs.length === 0) return;
      chrome.tabs.sendMessage(tabs[0].id!, {
        id: "transactions_updated",
        transactions,
      });
    });
    chrome.runtime.sendMessage({
      id: "transactions_updated",
      transactions: Array.from(this.cachedTransactions.values()),
    });
  }
}

export default TransactionObserver;
