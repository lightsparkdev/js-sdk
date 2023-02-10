import { getLightsparkClient } from "../lightsparkClientProvider";
import { startListeningForNavigations } from "../NavigationTracker";
import AccountStorage from "./AccountStorage";
import { onMessageReceived } from "./messageHandling";
import VideoProgressCache from "./VideoProgressCache";

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

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.query(
      {
        url: [
          "https://localhost:3000/demos/streaming",
          "http://192.168.86.248:3000/demos/streaming",
          "https://dev.dev.sparkinfra.net/demos/streaming",
          "https://app.lightspark.com/demos/streaming",
        ],
      },
      (tabs) => {
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
  }
});

chrome.storage.local.onChanged.addListener((changes) => {
  if (changes["credentials"]) {
    console.log("Credentials changed, reloading tabs.");
  }
});

