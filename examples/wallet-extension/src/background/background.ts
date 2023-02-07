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
    onMessageReceived(
      message,
      lightsparkClient,
      progressCache,
      sendResponse
    );
  });
  return true;
});

startListeningForNavigations();
