import PlaybackRangesTracker from "./VideoPlaybackRanges";

class VideoProgressCache {
  private videoProgressCache: { [videoID: string]: PlaybackRangesTracker };
  private listeners: Array<(videoID: string) => void> = [];
  private resolveWhenLoaded: () => void = () => {};
  private whenLoadedPromise = new Promise<void>((resolve) => {
    this.resolveWhenLoaded = resolve;
  });

  constructor() {
    this.videoProgressCache = {};
    this.readProgressFromStorage();
  }

  public async whenLoaded() {
    return this.whenLoadedPromise;
  }

  public clear() {
    this.videoProgressCache = {};
    this.writeProgressToStorage();
  }

  addProgress(videoID: string, start: number, end: number) {
    if (!this.videoProgressCache[videoID]) {
      this.videoProgressCache[videoID] = new PlaybackRangesTracker();
    }
    this.videoProgressCache[videoID].addPlayedRange(start, end);
    console.log(`Added progress for ${videoID}: ${start} - ${end}`);
    console.log(
      `Current ranges: ${JSON.stringify(
        this.videoProgressCache[videoID].getPlayedRanges()
      )}`
    );
    this.listeners.forEach((listener) => listener(videoID));
    this.writeProgressToStorage();
  }

  listenForProgressChanges(listener: (videoID: string) => void) {
    this.listeners.push(listener);
  }

  getPlayedDuration(videoID: string) {
    if (!this.videoProgressCache[videoID]) {
      return 0;
    }
    return this.videoProgressCache[videoID].getPlayedDuration();
  }

  getPlayedRanges(videoID: string) {
    if (!this.videoProgressCache[videoID]) {
      return [];
    }
    return this.videoProgressCache[videoID].getPlayedRanges();
  }

  readProgressFromStorage() {
    chrome.storage.local.get(null, (result) => {
      Object.keys(result).forEach((key) => {
        if (key.startsWith("video_")) {
          const videoID = key.replace("video_", "");
          const videoRanges = result[key]["playedRanges"];
          this.videoProgressCache[videoID] = new PlaybackRangesTracker();
          videoRanges.forEach((range: any) => {
            this.videoProgressCache[videoID].addPlayedRange(
              range.start,
              range.end
            );
          });
        }
      });
      this.resolveWhenLoaded();
    });
  }

  writeProgressToStorage() {
    const newEntrys: any = {};
    Object.keys(this.videoProgressCache).forEach((videoID) => {
      const videoRanges = this.videoProgressCache[videoID];
      newEntrys[`video_${videoID}`] = videoRanges;
    });
    chrome.storage.local.set(newEntrys);
  }
}

export default VideoProgressCache;
