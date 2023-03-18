import { ChannelSource, VideoPlaybackUpdateMessage } from "../types/Messages";

type ParseResult = {trackingDetails: VideoPlaybackUpdateMessage, videoElement: HTMLVideoElement};

export const getDomDetailsForYoutube = (): ParseResult | null => {
  const searchParams = new URLSearchParams(window.location.search);
  if (!searchParams.has("v")) {
    return null;
  }
  const userLink = document.querySelector(
    ".ytd-watch-metadata .ytd-channel-name a"
  ) as HTMLAnchorElement;
  const videoElement = document.querySelector(
    "#movie_player video"
  ) as HTMLVideoElement;
  if (!userLink || !videoElement) {
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
  return { trackingDetails: newTrackingDetails, videoElement };
};

export const getDomDetailsForTwitch = (): ParseResult | null => {
  let videoID = "livestream";
  if (window.location.pathname.includes("/videos/")) {
    const index = window.location.pathname.lastIndexOf("/videos/");
    videoID = window.location.pathname.slice(index + "/videos/".length);
    // TODO: If we only care about live, probably just return null here.
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
  return { trackingDetails: newTrackingDetails, videoElement };
};

export const getDomDetailsForLighstparkDemo = (): ParseResult | null => {
    const videoElement = document.querySelector(
      "video#stream-sats-video"
    ) as HTMLVideoElement;
    if (!videoElement) {
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
    return { trackingDetails: newTrackingDetails, videoElement };
  };
