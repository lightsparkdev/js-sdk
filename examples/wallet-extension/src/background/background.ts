import { getLightsparkClient } from "../lightsparkClientProvider";
import {
  AccountTokenAuthProvider,
  StubAuthProvider,
} from "@lightspark/js-sdk/auth";
import AccountStorage from "../auth/AccountStorage";
import { onMessageReceived } from "./messageHandling";
import VideoProgressCache from "./VideoProgressCache";
import { findActiveStreamingDemoTabs } from "../common/streamingTabs";
import StreamingInvoiceHolder from "./StreamingInvoiceHolder";
import StreamingDemoAccountCredentials from "../auth/StreamingDemoCredentials";
import { unreserveStreamingDemoAccountCredentials } from "../auth/DemoAccountProvider";
import TransactionObserver from "./TransactionObserver";

const progressCache = new VideoProgressCache();
const accountStorage = new AccountStorage();
const invoiceHolder = new StreamingInvoiceHolder();
const lightsparkClient = getLightsparkClient(accountStorage);
const transactionObserver = lightsparkClient.then(
  (client) => new TransactionObserver(client)
);
let lastKnownStreamingTabId: number | undefined;

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "write_progress" && progressCache.needsWriteToStorage()) {
    progressCache.writeProgressToStorage();
  }
});

chrome.alarms.create("write_progress", { periodInMinutes: 5 });

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  Promise.all([lightsparkClient, transactionObserver]).then(
    ([lightsparkClient, transactionObserver]) => {
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
  (message, _sender, sendResponse) => {
    Promise.all([lightsparkClient, transactionObserver]).then(
      ([lightsparkClient, transactionObserver]) => {
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

const onNavigation = (
  details: chrome.webNavigation.WebNavigationFramedCallbackDetails
) => {
  console.log(`Navigated to ${details.url}`);
  if (details.url.includes("demos/streaming")) {
    lastKnownStreamingTabId = details.tabId;
  }
  chrome.tabs.sendMessage(
    details.tabId,
    { id: "get_video_details" },
    (response) => {
      console.log(`Got details from tab: ${JSON.stringify(response)}`);
    }
  );
};

const urlFilter = {
  url: [
    { hostSuffix: "youtube.com" },
    { hostSuffix: "twitch.tv" },
    { pathContains: "demos/streaming" },
  ],
};
chrome.webNavigation.onCompleted.addListener(onNavigation, urlFilter);
chrome.webNavigation.onHistoryStateUpdated.addListener(onNavigation, urlFilter);

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
        lightsparkClient.setActiveWalletWithoutUnlocking(
          credentials.viewerWalletId
        );
        await lightsparkClient.loadWalletKey(credentials.viewerSigningKey);
        await invoiceHolder
          .createInvoice(lightsparkClient, credentials.creatorWalletId)
          .then((invoice) => {
            console.log(`Created invoice: ${invoice}`);
          });
      } else {
        await lightsparkClient.setAuthProvider(new StubAuthProvider());
        await invoiceHolder.clearInvoice();
        lightsparkClient.setActiveWalletWithoutUnlocking(undefined);
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
    chrome.storage.local.clear();
    progressCache.clear();
  }
});
