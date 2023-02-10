import { getLightsparkClient } from "../lightsparkClientProvider";
import { AccountTokenAuthProvider } from "@lightspark/js-sdk/auth/AccountTokenAuthProvider";
import StubAuthProvider from "@lightspark/js-sdk/auth/StubAuthProvider";
import { startListeningForNavigations } from "./NavigationTracker";
import AccountStorage from "./AccountStorage";
import { onMessageReceived } from "./messageHandling";
import VideoProgressCache from "./VideoProgressCache";
import { findActiveStreamingDemoTabs } from "../common/streamingTabs";

const progressCache = new VideoProgressCache();
const accountStorage = new AccountStorage();
const lightsparkClient = getLightsparkClient(accountStorage);

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "write_progress" && progressCache.needsWriteToStorage()) {
    progressCache.writeProgressToStorage();
  }
});

chrome.alarms.create("write_progress", { periodInMinutes: 5 });

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  lightsparkClient.then((lightsparkClient) => {
    onMessageReceived(message, lightsparkClient, progressCache, sendResponse);
  });
  return true;
});

chrome.runtime.onMessageExternal.addListener(
  (message, _sender, sendResponse) => {
    lightsparkClient.then((lightsparkClient) => {
      onMessageReceived(message, lightsparkClient, progressCache, sendResponse);
    });
    return true;
  }
);

startListeningForNavigations();

const reloadOrOpenStreamingDemo = () => {
  findActiveStreamingDemoTabs().then((tabs) => {
      console.log(`Found ${tabs} tabs to reload.`);
      if (tabs.length > 0) {
        chrome.tabs.update(tabs[0].id!, { active: true, highlighted: true });
        chrome.tabs.reload(tabs[0].id!);
      } else {
        // TODO: Replace with the final URL.
        chrome.tabs.create({
          url: "https://app.lightspark.com/demos/streaming",
          active: true,
        });
      }
    }
  );
};

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    reloadOrOpenStreamingDemo();
  }
});

chrome.storage.local.onChanged.addListener((changes) => {
  if (changes["credentials"]) {
    console.log("Credentials changed, reloading tabs.");
    lightsparkClient.then((lightsparkClient) => {
      const credentials = changes["credentials"].newValue;
      if (credentials) {
        lightsparkClient.setAuthProvider(
          new AccountTokenAuthProvider(credentials.tokenId, credentials.token)
        );
        lightsparkClient.setActiveWalletWithoutUnlocking(
          credentials.viewerWalletId
        );
      } else {
        lightsparkClient.setAuthProvider(new StubAuthProvider());
      }
      reloadOrOpenStreamingDemo();
    });
    return true;
  }
  return false;
});
