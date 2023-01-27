import { startListeningForNavigations } from "../NavigationTracker";
import { DOMMessageResponse } from "../types";
import VideoProgressCache from "./VideoProgressCache";

const progressCache = new VideoProgressCache();

const messageReceived = async (message: DOMMessageResponse) => {
  progressCache.addProgress(
    message.videoID,
    message.progress,
    message.prevProgress || 0
  );
};

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "write_progress" && progressCache.needsWriteToStorage()) {
    progressCache.writeProgressToStorage();
  }
});

chrome.alarms.create("write_progress", { periodInMinutes: 5 });
chrome.runtime.onMessage.addListener(messageReceived);
startListeningForNavigations();
