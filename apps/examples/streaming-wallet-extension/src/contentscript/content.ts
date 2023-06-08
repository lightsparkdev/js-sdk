import { ENABLE_YOUTUBE_AND_TWITCH } from "../common/settings";
import { VideoPlaybackUpdateMessage } from "../types/Messages";
import {
  updateTransactionRows,
  updateWalletBalances,
} from "./lightsparkDemoDom";
import {
  getDomDetailsForLighstparkDemo,
  getDomDetailsForTwitch,
  getDomDetailsForYoutube,
} from "./videoElementParsers";

let currentTrackingDetails: VideoPlaybackUpdateMessage | null = null;
let timeUpdateListener: (() => void) | null = null;

const messageReceived = (
  msg: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
) => {
  console.log("[content.js]. Message received", msg);
  if (msg.id === "is_video_playing") {
    sendResponse(currentTrackingDetails?.isPlaying || false);
  } else if (
    msg.id === "new_transactions" ||
    msg.id === "transactions_updated"
  ) {
    updateTransactionRows(msg.transactions);
  }
};

const startListeningToVideoEvents = (videoElement: HTMLVideoElement) => {
  console.log(
    `Beginning listener on: ${JSON.stringify(currentTrackingDetails)}`
  );
  if (timeUpdateListener) {
    videoElement.removeEventListener("timeupdate", timeUpdateListener);
  }
  timeUpdateListener = () => {
    console.log("Time update", videoElement.currentTime);
    const prevProgress = currentTrackingDetails?.progress || 0;
    currentTrackingDetails = {
      ...currentTrackingDetails!,
      progress: videoElement.currentTime,
      duration: videoElement.duration,
      prevProgress: prevProgress,
    };
    // No time updates while seeking.
    if (
      videoElement.seeking ||
      Math.abs(videoElement.currentTime - prevProgress) > 2
    )
      return;
    chrome.runtime
      .sendMessage({ id: "video_progress", ...currentTrackingDetails })
      .then((response) => {
        if (response.amountToPay > 0) {
          console.log(`Paying ${response.amountToPay} msats!`);
        }
      });
  };
  const playListener = () => {
    console.log("Play event");
    currentTrackingDetails = {
      ...currentTrackingDetails!,
      isPlaying: true,
    };
    chrome.runtime.sendMessage({ id: "video_play", ...currentTrackingDetails });
  };
  const pauseListener = () => {
    console.log("Pause event");
    currentTrackingDetails = {
      ...currentTrackingDetails!,
      isPlaying: false,
    };
    chrome.runtime.sendMessage({
      id: "video_pause",
      ...currentTrackingDetails,
    });
  };
  videoElement.addEventListener("timeupdate", timeUpdateListener);
  videoElement.addEventListener("play", playListener);
  videoElement.addEventListener("pause", pauseListener);
};

chrome.runtime.onMessage.addListener(messageReceived);

const afterDOMLoaded = (numRetries: number) => {
  console.log("[content.js]. DOM loaded");
  const isLightsparkDemo =
    window.location.host.includes("lightspark") ||
    window.location.host.includes("localhost") ||
    window.location.host.includes("sparkinfra.net");
  const parseResponse =
    window.location.host.includes("youtube") && ENABLE_YOUTUBE_AND_TWITCH
      ? getDomDetailsForYoutube()
      : window.location.host.includes("twitch") && ENABLE_YOUTUBE_AND_TWITCH
      ? getDomDetailsForTwitch()
      : getDomDetailsForLighstparkDemo();

  if (parseResponse) {
    currentTrackingDetails = parseResponse.trackingDetails;
    startListeningToVideoEvents(parseResponse.videoElement);
    chrome.runtime.sendMessage({
      ...parseResponse.trackingDetails,
      id: "video_details",
    });
    if (isLightsparkDemo) {
      updateWalletBalances();
    }
  } else if (numRetries < 10) {
    // Retry in a second to see if the page loads.
    // TODO: Consider whether we need to use a navigation listener to detect video page changes for SPAs where the
    // load event won't re-fire.
    setTimeout(() => afterDOMLoaded(numRetries + 1), 1000);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => afterDOMLoaded(0));
} else {
  afterDOMLoaded(0);
}
