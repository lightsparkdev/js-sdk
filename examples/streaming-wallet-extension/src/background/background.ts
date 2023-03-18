import {
  AccountTokenAuthProvider,
  StubAuthProvider,
} from "@lightsparkdev/js-sdk/auth";
import AccountStorage from "../auth/AccountStorage";
import { unreserveStreamingDemoAccountCredentials } from "../auth/DemoAccountProvider";
import StreamingDemoAccountCredentials from "../auth/StreamingDemoCredentials";
import { clearStorageKeepingInstanceId } from "../common/storage";
import { findActiveStreamingDemoTabs } from "../common/streamingTabs";
import { getWalletClient } from "../lightsparkClientProvider";
import { onMessageReceived } from "./messageHandling";
import StreamingInvoiceHolder from "./StreamingInvoiceHolder";
import TransactionObserver from "./TransactionObserver";
import VideoProgressCache from "./VideoProgressCache";

const progressCache = new VideoProgressCache();
const accountStorage = new AccountStorage();
const invoiceHolder = new StreamingInvoiceHolder();
const lightsparkClient = getWalletClient(accountStorage);
const transactionObserver = lightsparkClient.then(
  (client) => new TransactionObserver(client)
);
let lastKnownStreamingTabId: number | undefined;

const setStreamingTabIdIfSender = (
  message: { id: string },
  sender: chrome.runtime.MessageSender
) => {
  if (
    message.id === "video_details" &&
    sender.url?.includes("demos/streaming") &&
    sender.tab &&
    sender.tab?.id
  ) {
    lastKnownStreamingTabId = sender.tab.id;
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  Promise.all([lightsparkClient, transactionObserver]).then(
    ([lightsparkClient, transactionObserver]) => {
      setStreamingTabIdIfSender(message, sender);
      onMessageReceived(
        message,
        lightsparkClient,
        progressCache,
        invoiceHolder,
        accountStorage,
        transactionObserver,
        sendResponse
      );
    }
  );
  return true;
});

chrome.runtime.onMessageExternal.addListener(
  (message, sender, sendResponse) => {
    Promise.all([lightsparkClient, transactionObserver]).then(
      ([lightsparkClient, transactionObserver]) => {
        setStreamingTabIdIfSender(message, sender);
        onMessageReceived(
          message,
          lightsparkClient,
          progressCache,
          invoiceHolder,
          accountStorage,
          transactionObserver,
          sendResponse
        );
      }
    );
    return true;
  }
);

const reloadOrOpenStreamingDemo = (openIfMissing: boolean = true) => {
  findActiveStreamingDemoTabs().then(async (tabs) => {
    console.log(`Found ${tabs.length} tabs to reload.`);
    if (tabs.length > 0) {
      chrome.tabs.update(tabs[0].id!, { active: true, highlighted: true });
      chrome.tabs.reload(tabs[0].id!);
      lastKnownStreamingTabId = tabs[0].id;
    } else if (openIfMissing) {
      // TODO: Replace with the final URL.
      const newTab = await chrome.tabs.create({
        url: "https://app.lightspark.com/demos/streaming",
        active: true,
      });
      lastKnownStreamingTabId = newTab.id;
    }
  });
};

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    reloadOrOpenStreamingDemo();
  }
});

chrome.storage.local.onChanged.addListener((changes) => {
  if (changes["credentials"]) {
    console.log("Credentials changed, reloading tabs.");
    lightsparkClient.then(async (lightsparkClient) => {
      const credentials = changes["credentials"]
        .newValue as StreamingDemoAccountCredentials;
      if (credentials) {
        lightsparkClient.setAuthProvider(
          new AccountTokenAuthProvider(
            credentials.clientId,
            credentials.clientSecret
          )
        );
        await lightsparkClient.loadNodeKey(
          credentials.viewerWalletId,
          credentials.viewerSigningKey
        );
        await invoiceHolder
          .createInvoice(lightsparkClient, credentials.creatorWalletId)
          .then((invoice) => {
            console.log(`Created invoice: ${invoice}`);
          });
      } else {
        await lightsparkClient.setAuthProvider(new StubAuthProvider());
        await invoiceHolder.clearInvoice();
      }
      reloadOrOpenStreamingDemo(!!credentials);
    });
    return true;
  }
  return false;
});

chrome.tabs.onRemoved.addListener(async (tabId, _removeInfo) => {
  if (tabId === lastKnownStreamingTabId) {
    lastKnownStreamingTabId = undefined;
    const account = await accountStorage.getAccountCredentials();
    if (account) {
      await unreserveStreamingDemoAccountCredentials(account);
    }
    await clearStorageKeepingInstanceId();
    progressCache.clear();
  }
});
