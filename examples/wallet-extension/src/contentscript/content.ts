import { ChannelSource } from "../types";
import { VideoPlaybackUpdateMessage } from "../types";
import { updateWalletBalances } from "./lightsparkDemoDom";

let currentTrackingDetails: VideoPlaybackUpdateMessage | null = null;
let timeUpdateListener: (() => void) | null = null;

const messageReceived = (
  msg: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
) => {
  console.log("[content.js]. Message received", msg);
  if (msg.id === "get_video_details") {
    const response = window.location.host.includes("youtube")
      ? getDomDetailsForYoutube()
      : window.location.host.includes("twitch")
      ? getDomDetailsForTwitch()
      : getDomDetailsForLighstparkDemo();

    sendResponse(response);
  } else if (msg.id === "is_video_playing") {
    sendResponse(currentTrackingDetails?.isPlaying || false);
  }
};

const getDomDetailsForYoutube = (): VideoPlaybackUpdateMessage | null => {
  const searchParams = new URLSearchParams(window.location.search);
  if (!searchParams.has("v")) {
    currentTrackingDetails = null;
    return null;
  }
  const userLink = document.querySelector(
    ".ytd-watch-metadata .ytd-channel-name a"
  ) as HTMLAnchorElement;
  const videoElement = document.querySelector(
    "#movie_player video"
  ) as HTMLVideoElement;
  if (!userLink || !videoElement) {
    currentTrackingDetails = null;
    // Try again after a second.
    setTimeout(getDomDetailsForYoutube, 1000);
    return null;
  }
  const newTrackingDetails = {
    videoID: searchParams.get("v") || "",
    videoName:
      (document.querySelector('meta[name="title"]') as HTMLMetaElement)
        ?.content ||
      document.querySelector("title")?.textContent ||
      "",
    channelID: userLink.href.slice(
      userLink.href.indexOf("/channel/") + "/channel/".length
    ),
    channelName: userLink.textContent || "",
    channelSource: ChannelSource.youtube,
    progress: 0,
    duration: videoElement?.duration || 0,
    isPlaying: !videoElement.paused,
  };
  currentTrackingDetails = newTrackingDetails;
  startListeningToVideoEvents(videoElement);
  return newTrackingDetails;
};

const getDomDetailsForTwitch = (): VideoPlaybackUpdateMessage | null => {
  let videoID = "livestream";
  if (window.location.pathname.includes("/videos/")) {
    const index = window.location.pathname.lastIndexOf("/videos/");
    videoID = window.location.pathname.slice(index + "/videos/".length);
    // TODO(Jeremy): If we only care about live, probably just return null here.
  }

  // There may be a better way to do this, but the class names in twitch are obfuscated :-/.
  const userLink = Array.from(
    document.querySelectorAll(".channel-info-content a")
  ).filter((it) => {
    return it.classList.length === 0;
  })[0] as HTMLAnchorElement;
  const videoElement = document.querySelector(
    ".video-player video"
  ) as HTMLVideoElement;

  const newTrackingDetails = {
    videoID: videoID,
    videoName:
      document.querySelector('*[data-a-target="stream-title"]')?.textContent ||
      "",
    channelID: userLink?.href?.slice(userLink?.href.lastIndexOf("/") + 1) || "",
    channelName: userLink?.textContent || "",
    channelSource: ChannelSource.twitch,
    progress: 0,
    duration: videoElement?.duration || 0,
    isPlaying: !videoElement.paused,
  };
  currentTrackingDetails = newTrackingDetails;
  startListeningToVideoEvents(videoElement);
  return newTrackingDetails;
};

const getDomDetailsForLighstparkDemo =
  (): VideoPlaybackUpdateMessage | null => {
    const videoElement = document.querySelector(
      "video#stream-sats-video"
    ) as HTMLVideoElement;
    if (!videoElement) {
      currentTrackingDetails = null;
      // Try again after a second.
      setTimeout(getDomDetailsForLighstparkDemo, 1000);
      return null;
    }
    const newTrackingDetails = {
      videoID: "ls_demo",
      videoName: "Lightspark Streaming Demo",
      channelID: "ls",
      channelName: "Lightspark",
      channelSource: ChannelSource.lightspark,
      progress: 0,
      duration: videoElement?.duration || 0,
      isPlaying: !videoElement.paused,
    };
    currentTrackingDetails = newTrackingDetails;
    startListeningToVideoEvents(videoElement);
    updateWalletBalances();
    return newTrackingDetails;
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
        if (response.amountToPay.value > 0) {
          console.log(`Paying ${JSON.stringify(response.amountToPay)}!`);
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
